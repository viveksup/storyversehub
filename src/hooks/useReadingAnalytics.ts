import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface ReadingSession {
  id: string;
  storyId: string;
  startTime: Date;
  endTime?: Date;
  wordsRead: number;
  readingSpeed: number;
  comprehensionScore?: number;
}

interface ReadingAnalytics {
  totalReadingTime: number;
  averageReadingSpeed: number;
  storiesCompleted: number;
  currentStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  favoriteGenres: string[];
  readingPatterns: {
    preferredTimeOfDay: string;
    averageSessionLength: number;
    mostActiveDay: string;
  };
}

export const useReadingAnalytics = (userId: string | undefined) => {
  const [analytics, setAnalytics] = useState<ReadingAnalytics>({
    totalReadingTime: 0,
    averageReadingSpeed: 200,
    storiesCompleted: 0,
    currentStreak: 0,
    weeklyGoal: 5,
    weeklyProgress: 0,
    favoriteGenres: [],
    readingPatterns: {
      preferredTimeOfDay: 'evening',
      averageSessionLength: 25,
      mostActiveDay: 'Sunday'
    }
  });

  const [currentSession, setCurrentSession] = useState<ReadingSession | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Start a new reading session
  const startReadingSession = useCallback(async (storyId: string) => {
    if (!userId) return;

    const session: ReadingSession = {
      id: crypto.randomUUID(),
      storyId,
      startTime: new Date(),
      wordsRead: 0,
      readingSpeed: 0
    };

    setCurrentSession(session);
    setIsTracking(true);

    // Log session start in database
    try {
      await supabase
        .from('reading_sessions')
        .insert({
          id: session.id,
          user_id: userId,
          story_id: storyId,
          start_time: session.startTime.toISOString(),
          words_read: 0,
          reading_speed: 0
        });
    } catch (error) {
      console.error('Error starting reading session:', error);
    }
  }, [userId]);

  // Update reading progress
  const updateReadingProgress = useCallback(async (wordsRead: number) => {
    if (!currentSession || !isTracking) return;

    const timeElapsed = (new Date().getTime() - currentSession.startTime.getTime()) / 1000 / 60; // minutes
    const readingSpeed = timeElapsed > 0 ? Math.round(wordsRead / timeElapsed) : 0;

    const updatedSession = {
      ...currentSession,
      wordsRead,
      readingSpeed
    };

    setCurrentSession(updatedSession);

    // Update database
    try {
      await supabase
        .from('reading_sessions')
        .update({
          words_read: wordsRead,
          reading_speed: readingSpeed,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentSession.id);
    } catch (error) {
      console.error('Error updating reading progress:', error);
    }
  }, [currentSession, isTracking]);

  // End reading session
  const endReadingSession = useCallback(async (comprehensionScore?: number) => {
    if (!currentSession || !isTracking) return;

    const endTime = new Date();
    const finalSession = {
      ...currentSession,
      endTime,
      comprehensionScore
    };

    setCurrentSession(null);
    setIsTracking(false);

    // Update database with final session data
    try {
      await supabase
        .from('reading_sessions')
        .update({
          end_time: endTime.toISOString(),
          comprehension_score: comprehensionScore,
          duration: Math.round((endTime.getTime() - currentSession.startTime.getTime()) / 1000)
        })
        .eq('id', currentSession.id);

      // Refresh analytics
      await loadAnalytics();
    } catch (error) {
      console.error('Error ending reading session:', error);
    }

    return finalSession;
  }, [currentSession, isTracking]);

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    if (!userId) return;

    try {
      // Get reading sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('reading_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Get user preferences
      const { data: preferences, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (preferencesError && preferencesError.code !== 'PGRST116') {
        throw preferencesError;
      }

      // Calculate analytics
      if (sessions && sessions.length > 0) {
        const totalTime = sessions.reduce((sum, session) => {
          if (session.end_time && session.start_time) {
            const duration = new Date(session.end_time).getTime() - new Date(session.start_time).getTime();
            return sum + (duration / 1000 / 60); // Convert to minutes
          }
          return sum;
        }, 0);

        const completedSessions = sessions.filter(s => s.end_time);
        const averageSpeed = completedSessions.length > 0
          ? completedSessions.reduce((sum, s) => sum + (s.reading_speed || 0), 0) / completedSessions.length
          : 200;

        // Calculate streak
        const today = new Date();
        let streak = 0;
        let currentDate = new Date(today);
        
        while (true) {
          const dayStart = new Date(currentDate);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(currentDate);
          dayEnd.setHours(23, 59, 59, 999);

          const hasReadingOnDay = sessions.some(session => {
            const sessionDate = new Date(session.start_time);
            return sessionDate >= dayStart && sessionDate <= dayEnd;
          });

          if (hasReadingOnDay) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else {
            break;
          }
        }

        // Calculate weekly progress
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const weekSessions = sessions.filter(session => {
          const sessionDate = new Date(session.start_time);
          return sessionDate >= weekStart;
        });

        const weeklyGoal = preferences?.weekly_reading_goal || 5;
        const weeklyProgress = (weekSessions.length / weeklyGoal) * 100;

        setAnalytics({
          totalReadingTime: Math.round(totalTime),
          averageReadingSpeed: Math.round(averageSpeed),
          storiesCompleted: completedSessions.length,
          currentStreak: streak,
          weeklyGoal,
          weeklyProgress: Math.min(weeklyProgress, 100),
          favoriteGenres: preferences?.preferred_genres || ['Fantasy', 'Sci-Fi'],
          readingPatterns: {
            preferredTimeOfDay: 'evening',
            averageSessionLength: Math.round(totalTime / sessions.length) || 25,
            mostActiveDay: 'Sunday'
          }
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  }, [userId]);

  // Update weekly goal
  const updateWeeklyGoal = useCallback(async (newGoal: number) => {
    if (!userId) return;

    try {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          weekly_reading_goal: newGoal,
          updated_at: new Date().toISOString()
        });

      setAnalytics(prev => ({
        ...prev,
        weeklyGoal: newGoal,
        weeklyProgress: Math.min((prev.weeklyProgress * prev.weeklyGoal / newGoal), 100)
      }));
    } catch (error) {
      console.error('Error updating weekly goal:', error);
    }
  }, [userId]);

  // Load analytics on mount and when userId changes
  useEffect(() => {
    if (userId) {
      loadAnalytics();
    }
  }, [userId, loadAnalytics]);

  return {
    analytics,
    currentSession,
    isTracking,
    startReadingSession,
    updateReadingProgress,
    endReadingSession,
    updateWeeklyGoal,
    refreshAnalytics: loadAnalytics
  };
};