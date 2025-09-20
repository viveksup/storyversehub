import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Clock, TrendingUp, Star, 
  Plus, Eye, Heart, Bookmark, Users,
  ChevronRight, Sparkles, BookText, Activity
} from 'lucide-react';
import StoriesGrid from '../components/stories/StoriesGrid';
import CategoryGrid from '../components/stories/CategoryGrid';
import Button from '../components/ui/Button';
import RealtimeStats from '../components/dashboard/RealtimeStats';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import { supabase } from '../lib/supabase';
import { useStories } from '../hooks/useStories';
import { useCategories } from '../hooks/useCategories';
import { useDashboardData } from '../hooks/useDashboardData';
import { useRealtimeUserData } from '../hooks/useRealtimeUserData';

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Fetch user's recent stories and recommendations
  const { stories: recentStories, loading: recentLoading } = useStories({
    sort_by: 'published_at',
    sort_order: 'desc',
    limit: 4
  });

  const { stories: featuredStories, loading: featuredLoading } = useStories({
    is_featured: true,
    limit: 4
  });

  const { stories: popularStories, loading: popularLoading } = useStories({
    sort_by: 'views_count',
    sort_order: 'desc',
    limit: 4
  });

  const { categories, loading: categoriesLoading } = useCategories();
  const { stats, loading: statsLoading } = useDashboardData(user?.id);
  
  const { 
    userStats, 
    startReadingSession, 
    logUserActivity,
    updateWeeklyGoal 
  } = useRealtimeUserData(user?.id);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);

      // Load user profile
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profiles);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleStoryClick = async (storyId: string) => {
    if (user?.id) {
      await startReadingSession(storyId);
      await logUserActivity('story_read', storyId);
    }
  };

  const handleLikeStory = async (storyId: string) => {
    if (user?.id) {
      await supabase
        .from('user_story_interactions')
        .upsert({
          user_id: user.id,
          story_id: storyId,
          interaction_type: 'like'
        });
      await logUserActivity('story_liked', storyId);
    }
  };

  const handleBookmarkStory = async (storyId: string) => {
    if (user?.id) {
      await supabase
        .from('user_story_interactions')
        .upsert({
          user_id: user.id,
          story_id: storyId,
          interaction_type: 'bookmark'
        });
      await logUserActivity('story_bookmarked', storyId);
    }
  };

  const handleGoalUpdate = async (newGoal: number) => {
    await updateWeeklyGoal(newGoal);
  };

  // Get top categories for quick access
  const topCategories = categories
    .sort((a, b) => (b.story_count || 0) - (a.story_count || 0))
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-space-dark pt-20">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-space-light to-space-base py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-white mb-2">
                Welcome back, {profile?.username || user?.email?.split('@')[0] || 'Explorer'}
              </h1>
              <p className="text-gray-300">
                You're {Math.round(userStats.weeklyProgress)}% towards your weekly reading goal
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Activity size={16} className="text-success-400" />
                  {userStats.currentStreak} day streak
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen size={16} className="text-primary-400" />
                  {userStats.totalStoriesRead} stories read
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={16} className="text-secondary-400" />
                  {Math.floor(userStats.totalReadingTime / 60)}h reading time
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              <Link to="/create">
                <Button 
                  variant="primary"
                  size="lg"
                  leftIcon={<Plus size={18} />}
                >
                  Create Story
                </Button>
              </Link>
              <Link to="/explore">
                <Button 
                  variant="outline"
                  size="lg"
                  leftIcon={<BookOpen size={18} />}
                >
                  Explore Stories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Platform Statistics */}
            <section>
              <h2 className="text-2xl font-display font-semibold text-white mb-6">
                Platform Overview
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-4 border border-space-light/20">
                  <div className="flex items-center justify-between mb-2">
                    <BookOpen size={20} className="text-primary-400" />
                    <span className="text-xs text-success-400">
                      +{stats.storiesThisWeek} this week
                    </span>
                  </div>
                  <p className="text-2xl font-display font-bold text-white">
                    {stats.totalStories.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">Total Stories</p>
                </div>

                <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-4 border border-space-light/20">
                  <div className="flex items-center justify-between mb-2">
                    <Eye size={20} className="text-secondary-400" />
                    <span className="text-xs text-success-400">
                      +{stats.viewsThisWeek} this week
                    </span>
                  </div>
                  <p className="text-2xl font-display font-bold text-white">
                    {stats.totalViews.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">Total Views</p>
                </div>

                <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-4 border border-space-light/20">
                  <div className="flex items-center justify-between mb-2">
                    <Users size={20} className="text-accent-400" />
                  </div>
                  <p className="text-2xl font-display font-bold text-white">
                    {stats.totalUsers.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">Active Users</p>
                </div>

                <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-4 border border-space-light/20">
                  <div className="flex items-center justify-between mb-2">
                    <Heart size={20} className="text-error-400" />
                  </div>
                  <p className="text-2xl font-display font-bold text-white">
                    {stats.totalLikes.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">Total Likes</p>
                </div>
              </div>
            </section>

            {/* Popular Categories Quick Access */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-semibold text-white">
                  Browse by Category
                </h2>
                <Link 
                  to="/explore"
                  className="text-primary-400 hover:text-primary-300 flex items-center"
                >
                  View All <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>

              <CategoryGrid 
                categories={topCategories} 
                loading={categoriesLoading} 
                error={null}
              />
            </section>

            {/* Featured Stories */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-semibold text-white flex items-center gap-2">
                  <Star size={24} className="text-accent-400" />
                  Featured Stories
                </h2>
                <Link 
                  to="/explore?featured=true"
                  className="text-primary-400 hover:text-primary-300 flex items-center"
                >
                  View All <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>

              <StoriesGrid
                stories={featuredStories}
                loading={featuredLoading}
                error={null}
                hasMore={false}
                onLoadMore={() => {}}
                onLike={user ? handleLikeStory : undefined}
                onBookmark={user ? handleBookmarkStory : undefined}
                emptyMessage="No featured stories available"
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              />
            </section>

            {/* Popular Stories */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-semibold text-white flex items-center gap-2">
                  <TrendingUp size={24} className="text-success-400" />
                  Trending Stories
                </h2>
                <Link 
                  to="/explore?sort=views"
                  className="text-primary-400 hover:text-primary-300 flex items-center"
                >
                  View All <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>

              <StoriesGrid
                stories={popularStories}
                loading={popularLoading}
                error={null}
                hasMore={false}
                onLoadMore={() => {}}
                onLike={user ? handleLikeStory : undefined}
                onBookmark={user ? handleBookmarkStory : undefined}
                emptyMessage="No trending stories available"
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              />
            </section>

            {/* Recent Stories */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-semibold text-white flex items-center gap-2">
                  <Clock size={24} className="text-primary-400" />
                  Latest Stories
                </h2>
                <Link 
                  to="/explore"
                  className="text-primary-400 hover:text-primary-300 flex items-center"
                >
                  View All <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>

              <StoriesGrid
                stories={recentStories}
                loading={recentLoading}
                error={null}
                hasMore={false}
                onLoadMore={() => {}}
                onLike={user ? handleLikeStory : undefined}
                onBookmark={user ? handleBookmarkStory : undefined}
                emptyMessage="No recent stories available"
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              />
            </section>

            {/* Activity Feed */}
            {user?.id && <ActivityFeed userId={user.id} />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Real-time Stats */}
            {user?.id && <RealtimeStats userId={user.id} />}

            {/* Quick Actions */}
            <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
              <h3 className="text-xl font-display font-semibold text-white mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/create">
                  <Button 
                    variant="secondary"
                    size="sm"
                    leftIcon={<Plus size={16} />}
                    className="w-full"
                  >
                    Create
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button 
                    variant="secondary"
                    size="sm"
                    leftIcon={<BookText size={16} />}
                    className="w-full"
                  >
                    My Stories
                  </Button>
                </Link>
                <Link to="/bookmarks">
                  <Button 
                    variant="secondary"
                    size="sm"
                    leftIcon={<Bookmark size={16} />}
                    className="w-full"
                  >
                    Bookmarks
                  </Button>
                </Link>
                <Link to="/history">
                  <Button 
                    variant="secondary"
                    size="sm"
                    leftIcon={<Clock size={16} />}
                    className="w-full"
                  >
                    History
                  </Button>
                </Link>
              </div>
            </div>

            {/* Reading Goals with Real-time Updates */}
            <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-display font-semibold text-white">
                  Reading Goals
                </h3>
                <div className="p-2 bg-accent-600/30 rounded-lg">
                  <Sparkles size={20} className="text-accent-400" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Weekly Progress</span>
                    <span className="text-white">{Math.round(userStats.weeklyProgress)}%</span>
                  </div>
                  <div className="h-2 bg-space-dark rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent-500 rounded-full transition-all duration-500"
                      style={{ width: `${userStats.weeklyProgress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Stories This Week</span>
                  <span className="text-white">
                    {Math.floor(userStats.weeklyProgress * userStats.weeklyGoal / 100)}/{userStats.weeklyGoal}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Current Streak</span>
                  <span className="text-white">{userStats.currentStreak} days</span>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleGoalUpdate(userStats.weeklyGoal + 1)}
                  >
                    Increase Goal
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleGoalUpdate(Math.max(1, userStats.weeklyGoal - 1))}
                  >
                    Decrease Goal
                  </Button>
                </div>
              </div>
            </div>

            {/* Top Categories Stats */}
            <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
              <h3 className="text-xl font-display font-semibold text-white mb-4">
                Popular Categories
              </h3>
              
              <div className="space-y-3">
                {stats.topCategories.slice(0, 5).map((category, index) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-400">
                        #{index + 1}
                      </span>
                      <span className="text-white">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">
                        {category.story_count} stories
                      </div>
                      <div className="text-xs text-gray-400">
                        {category.total_views.toLocaleString()} views
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;