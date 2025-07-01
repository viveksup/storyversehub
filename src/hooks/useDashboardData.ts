import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface DashboardStats {
  totalStories: number;
  totalViews: number;
  totalLikes: number;
  totalBookmarks: number;
  totalUsers: number;
  storiesThisWeek: number;
  viewsThisWeek: number;
  topCategories: Array<{
    id: string;
    name: string;
    story_count: number;
    total_views: number;
  }>;
  recentStories: Array<{
    id: string;
    title: string;
    author: string;
    views: number;
    created_at: string;
  }>;
  userGrowth: Array<{
    date: string;
    count: number;
  }>;
  contentGrowth: Array<{
    date: string;
    count: number;
  }>;
}

export const useDashboardData = (userId?: string) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStories: 0,
    totalViews: 0,
    totalLikes: 0,
    totalBookmarks: 0,
    totalUsers: 0,
    storiesThisWeek: 0,
    viewsThisWeek: 0,
    topCategories: [],
    recentStories: [],
    userGrowth: [],
    contentGrowth: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current week boundaries
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      weekStart.setHours(0, 0, 0, 0);

      // Fetch total stories
      const { count: totalStories } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');

      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch stories this week
      const { count: storiesThisWeek } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')
        .gte('published_at', weekStart.toISOString());

      // Fetch analytics aggregates
      const { data: analyticsData } = await supabase
        .from('story_analytics')
        .select('views_count, likes_count, bookmarks_count')
        .not('story_id', 'is', null);

      const totalViews = analyticsData?.reduce((sum, item) => sum + (item.views_count || 0), 0) || 0;
      const totalLikes = analyticsData?.reduce((sum, item) => sum + (item.likes_count || 0), 0) || 0;
      const totalBookmarks = analyticsData?.reduce((sum, item) => sum + (item.bookmarks_count || 0), 0) || 0;

      // Fetch views this week
      const { data: weeklyViews } = await supabase
        .from('user_story_interactions')
        .select('id')
        .eq('interaction_type', 'view')
        .gte('created_at', weekStart.toISOString());

      const viewsThisWeek = weeklyViews?.length || 0;

      // Fetch top categories
      const { data: categoriesData } = await supabase
        .from('story_categories')
        .select(`
          id,
          name,
          stories!stories_category_id_fkey(
            id,
            analytics:story_analytics(views_count)
          )
        `)
        .eq('is_active', true);

      const topCategories = (categoriesData || [])
        .map(category => ({
          id: category.id,
          name: category.name,
          story_count: category.stories?.length || 0,
          total_views: category.stories?.reduce((sum: number, story: any) => 
            sum + (story.analytics?.[0]?.views_count || 0), 0) || 0
        }))
        .sort((a, b) => b.total_views - a.total_views)
        .slice(0, 5);

      // Fetch recent stories
      const { data: recentStoriesData } = await supabase
        .from('stories')
        .select(`
          id,
          title,
          author:profiles!stories_author_id_fkey(username),
          analytics:story_analytics(views_count),
          created_at
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(10);

      const recentStories = (recentStoriesData || []).map(story => ({
        id: story.id,
        title: story.title,
        author: story.author?.username || 'Unknown',
        views: story.analytics?.[0]?.views_count || 0,
        created_at: story.created_at
      }));

      // Fetch user growth data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: userGrowthData } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      // Group by date
      const userGrowthMap = new Map();
      userGrowthData?.forEach(user => {
        const date = new Date(user.created_at).toISOString().split('T')[0];
        userGrowthMap.set(date, (userGrowthMap.get(date) || 0) + 1);
      });

      const userGrowth = Array.from(userGrowthMap.entries()).map(([date, count]) => ({
        date,
        count
      }));

      // Fetch content growth data
      const { data: contentGrowthData } = await supabase
        .from('stories')
        .select('published_at')
        .eq('status', 'published')
        .gte('published_at', thirtyDaysAgo.toISOString())
        .order('published_at', { ascending: true });

      const contentGrowthMap = new Map();
      contentGrowthData?.forEach(story => {
        if (story.published_at) {
          const date = new Date(story.published_at).toISOString().split('T')[0];
          contentGrowthMap.set(date, (contentGrowthMap.get(date) || 0) + 1);
        }
      });

      const contentGrowth = Array.from(contentGrowthMap.entries()).map(([date, count]) => ({
        date,
        count
      }));

      setStats({
        totalStories: totalStories || 0,
        totalViews,
        totalLikes,
        totalBookmarks,
        totalUsers: totalUsers || 0,
        storiesThisWeek: storiesThisWeek || 0,
        viewsThisWeek,
        topCategories,
        recentStories,
        userGrowth,
        contentGrowth
      });

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Set up real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('dashboard_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stories'
        },
        () => {
          fetchDashboardData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'story_analytics'
        },
        () => {
          fetchDashboardData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_story_interactions'
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDashboardData]);

  return {
    stats,
    loading,
    error,
    refresh: fetchDashboardData
  };
};