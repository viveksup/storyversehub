import { useState, useEffect } from 'react';
import { supabase, subscribeToProfile, updateProfile } from '../lib/supabase';

export const useProfile = (userId: string | undefined) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Subscribe to real-time updates
    const subscription = subscribeToProfile(userId, (payload) => {
      if (payload.new) {
        setProfile(payload.new);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const updateUserProfile = async (updates: any) => {
    if (!userId) return { error: new Error('No user ID provided') };
    
    try {
      setLoading(true);
      const { data, error } = await updateProfile(userId, updates);
      
      if (error) throw error;
      setProfile(data);
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update profile');
      setError(error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, updateProfile: updateUserProfile };
};