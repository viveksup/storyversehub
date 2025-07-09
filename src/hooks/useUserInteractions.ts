import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
  bio: string;
  created_at: string;
  follower_count?: number;
  following_count?: number;
  is_following?: boolean;
}

export interface FollowStats {
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export const useUserInteractions = (currentUserId?: string) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [followStats, setFollowStats] = useState<Record<string, FollowStats>>({});

  // Search for users with debouncing
  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          avatar_url,
          bio,
          created_at,
          follower_count:follows!follows_following_id_fkey(count),
          following_count:follows!follows_follower_id_fkey(count)
        `)
        .ilike('username', `%${query}%`)
        .neq('id', currentUserId || '')
        .limit(10);

      if (error) throw error;

      // Check if current user is following each result
      let processedResults = data || [];
      
      if (currentUserId && data && data.length > 0) {
        const userIds = data.map(user => user.id);
        const { data: followData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', currentUserId)
          .in('following_id', userIds);

        const followingIds = new Set(followData?.map(f => f.following_id) || []);
        
        processedResults = data.map(user => ({
          ...user,
          follower_count: user.follower_count?.[0]?.count || 0,
          following_count: user.following_count?.[0]?.count || 0,
          is_following: followingIds.has(user.id)
        }));
      }

      setSearchResults(processedResults);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [currentUserId]);

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchUsers]);

  // Load follow stats for a specific user
  const loadFollowStats = useCallback(async (userId: string) => {
    try {
      // Get follower and following counts
      const [followerResult, followingResult, isFollowingResult] = await Promise.all([
        supabase
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('following_id', userId),
        supabase
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('follower_id', userId),
        currentUserId ? supabase
          .from('follows')
          .select('id')
          .eq('follower_id', currentUserId)
          .eq('following_id', userId)
          .single() : Promise.resolve({ data: null })
      ]);

      const stats: FollowStats = {
        followerCount: followerResult.count || 0,
        followingCount: followingResult.count || 0,
        isFollowing: !!isFollowingResult.data
      };

      setFollowStats(prev => ({
        ...prev,
        [userId]: stats
      }));

      return stats;
    } catch (error) {
      console.error('Error loading follow stats:', error);
      return {
        followerCount: 0,
        followingCount: 0,
        isFollowing: false
      };
    }
  }, [currentUserId]);

  // Follow a user
  const followUser = useCallback(async (userId: string) => {
    if (!currentUserId) return false;

    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: currentUserId,
          following_id: userId
        });

      if (error) throw error;

      // Update local state
      setFollowStats(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          followerCount: (prev[userId]?.followerCount || 0) + 1,
          isFollowing: true
        }
      }));

      // Update search results if user is in them
      setSearchResults(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, follower_count: (user.follower_count || 0) + 1, is_following: true }
          : user
      ));

      return true;
    } catch (error) {
      console.error('Error following user:', error);
      return false;
    }
  }, [currentUserId]);

  // Unfollow a user
  const unfollowUser = useCallback(async (userId: string) => {
    if (!currentUserId) return false;

    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', userId);

      if (error) throw error;

      // Update local state
      setFollowStats(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          followerCount: Math.max((prev[userId]?.followerCount || 0) - 1, 0),
          isFollowing: false
        }
      }));

      // Update search results if user is in them
      setSearchResults(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, follower_count: Math.max((user.follower_count || 0) - 1, 0), is_following: false }
          : user
      ));

      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return false;
    }
  }, [currentUserId]);

  // Toggle follow status
  const toggleFollow = useCallback(async (userId: string) => {
    const currentStats = followStats[userId];
    if (currentStats?.isFollowing) {
      return await unfollowUser(userId);
    } else {
      return await followUser(userId);
    }
  }, [followStats, followUser, unfollowUser]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    followStats,
    loadFollowStats,
    followUser,
    unfollowUser,
    toggleFollow
  };
};