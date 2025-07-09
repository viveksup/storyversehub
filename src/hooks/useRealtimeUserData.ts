import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UserStats {
  totalStoriesRead: number;
  totalReadingTime: number; // in minutes
  currentStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  favoriteGenres: string[];
  readingSpeed: number; // words per minute
  lastActiveAt: string;
}

interface ReadingSession {
  id: string;
  storyId: string;
  startTime: string;
  endTime?: string;
  duration: number; // in seconds
  wordsRead: number;
  progressPercentage: number;
}

interface UserActivity {
  id: string;
  userId: string;
  activityType: 'story_read' | 'story_liked' | 'story_bookmarked' | 'comment_posted' | 'user_followed';
  targetId: string;
  metadata: any;
  createdAt: string;
}

export const useRealtimeUserData = (userId: string | undefined) => {
  const [userStats, setUserStats] = useState<UserStats>({
    totalStoriesRead: 0,
    totalReadingTime: 0,
    currentStreak: 0,
    weeklyGoal: 5,
    weeklyProgress: 0,
    favoriteGenres: [],
    readingSpeed: 200,
    lastActiveAt: new Date().toISOString()
  });

  const [currentReadingSession, setCurrentReadingSession] = useState<ReadingSession | null>(null);
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // Load initial user stats
    loadUserStats();
    loadRecentActivity();

    // Set up real-time subscriptions
    const statsSubscription = subscribeToUserStats();
    const activitySubscription = subscribeToUserActivity();
    const presenceSubscription = subscribeToPresence();

    // Track user presence
    trackUserPresence();

    return () => {
      statsSubscription?.unsubscribe();
      activitySubscription?.unsubscribe();
      presenceSubscription?.unsubscribe();
    };
  }, [userId]);

  const loadUserStats = async () => {
    if (!userId) return;

    try {
      // Get reading history for stats calculation
      const { data: readingHistory } = await supabase
        .from('reading_history')
        .select('*')
        .eq('user_id', userId);

      // Get user rankings for streak and goals
      const { data: rankings } = await supabase
        .from('rankings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (readingHistory) {
        const stats = calculateUserStats(readingHistory, rankings);
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const loadRecentActivity = async () => {
    if (!userId) return;

    try {
      const { data: activities } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activities) {
        setRecentActivity(activities);
      }
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  const subscribeToUserStats = () => {
    if (!userId) return null;

    return supabase
      .channel(`user_stats:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reading_history',
          filter: `user_id=eq.${userId}`
        },
        () => {
          loadUserStats(); // Recalculate stats when reading history changes
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rankings',
          filter: `user_id=eq.${userId}`
        },
        () => {
          loadUserStats(); // Recalculate stats when rankings change
        }
      )
      .subscribe();
  };

  const subscribeToUserActivity = () => {
    if (!userId) return null;

    return supabase
      .channel(`user_activity:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_activities',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          setRecentActivity(prev => [payload.new as UserActivity, ...prev.slice(0, 9)]);
        }
      )
      .subscribe();
  };

  const subscribeToPresence = () => {
    if (!userId) return null;

    const channel = supabase.channel('online_users', {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setIsOnline(Object.keys(state).includes(userId));
      })
      .subscribe();

    return channel;
  };

  const trackUserPresence = async () => {
    if (!userId) return;

    const channel = supabase.channel('online_users');
    
    await channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
        });
      }
    });

    // Update last active timestamp
    await supabase
      .from('profiles')
      .update({ 
        last_active_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
  };

  const startReadingSession = async (storyId: string) => {
    if (!userId) return;

    const session: ReadingSession = {
      id: crypto.randomUUID(),
      storyId,
      startTime: new Date().toISOString(),
      duration: 0,
      wordsRead: 0,
      progressPercentage: 0
    };

    setCurrentReadingSession(session);

    // Track reading session start
    await logUserActivity('reading_session_start', storyId, { sessionId: session.id });
  };

  const updateReadingProgress = async (wordsRead: number, progressPercentage: number) => {
    if (!currentReadingSession) return;

    const updatedSession = {
      ...currentReadingSession,
      wordsRead,
      progressPercentage,
      duration: Math.floor((new Date().getTime() - new Date(currentReadingSession.startTime).getTime()) / 1000)
    };

    setCurrentReadingSession(updatedSession);

    // Update reading history in real-time
    await supabase
      .from('reading_history')
      .upsert({
        user_id: userId,
        content_id: currentReadingSession.storyId,
        content_type: 'story',
        progress: progressPercentage,
        last_read_at: new Date().toISOString()
      });
  };

  const endReadingSession = async () => {
    if (!currentReadingSession || !userId) return;

    const endTime = new Date().toISOString();
    const totalDuration = Math.floor((new Date().getTime() - new Date(currentReadingSession.startTime).getTime()) / 1000);

    // Save reading session
    await supabase
      .from('reading_sessions')
      .insert({
        id: currentReadingSession.id,
        user_id: userId,
        story_id: currentReadingSession.storyId,
        start_time: currentReadingSession.startTime,
        end_time: endTime,
        duration: totalDuration,
        words_read: currentReadingSession.wordsRead,
        progress_percentage: currentReadingSession.progressPercentage
      });

    // Log activity
    await logUserActivity('reading_session_end', currentReadingSession.storyId, {
      sessionId: currentReadingSession.id,
      duration: totalDuration,
      wordsRead: currentReadingSession.wordsRead
    });

    setCurrentReadingSession(null);
  };

  const logUserActivity = async (activityType: UserActivity['activityType'], targetId: string, metadata: any = {}) => {
    if (!userId) return;

    try {
      await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: activityType,
          target_id: targetId,
          metadata,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging user activity:', error);
    }
  };

  const updateWeeklyGoal = async (newGoal: number) => {
    if (!userId) return;

    try {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          weekly_reading_goal: newGoal,
          updated_at: new Date().toISOString()
        });

      setUserStats(prev => ({ ...prev, weeklyGoal: newGoal }));
    } catch (error) {
      console.error('Error updating weekly goal:', error);
    }
  };

  const calculateUserStats = (readingHistory: any[], rankings: any): UserStats => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    
    // Calculate weekly progress
    const thisWeekReads = readingHistory.filter(
      item => new Date(item.last_read_at) >= weekStart
    ).length;

    // Calculate reading streak
    const streak = calculateReadingStreak(readingHistory);

    // Calculate favorite genres (mock data for now)
    const favoriteGenres = ['Fantasy', 'Sci-Fi', 'Mystery'];

    // Calculate total reading time (mock calculation)
    const totalReadingTime = readingHistory.length * 15; // Assume 15 min per story

    return {
      totalStoriesRead: readingHistory.length,
      totalReadingTime,
      currentStreak: streak,
      weeklyGoal: rankings?.weekly_goal || 5,
      weeklyProgress: Math.min((thisWeekReads / (rankings?.weekly_goal || 5)) * 100, 100),
      favoriteGenres,
      readingSpeed: 200, // Default reading speed
      lastActiveAt: new Date().toISOString()
    };
  };

  const calculateReadingStreak = (readingHistory: any[]): number => {
    if (readingHistory.length === 0) return 0;

    const sortedHistory = readingHistory
      .sort((a, b) => new Date(b.last_read_at).getTime() - new Date(a.last_read_at).getTime());

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const item of sortedHistory) {
      const readDate = new Date(item.last_read_at);
      readDate.setHours(0, 0, 0, 0);

      if (readDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (readDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    return streak;
  };

  return {
    userStats,
    currentReadingSession,
    recentActivity,
    isOnline,
    startReadingSession,
    updateReadingProgress,
    endReadingSession,
    logUserActivity,
    updateWeeklyGoal
  };
};