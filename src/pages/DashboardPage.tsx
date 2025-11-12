import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Clock, TrendingUp, Star, 
  Plus, Eye, Heart, Bookmark, Users,
  ChevronRight, Sparkles, BookText, Activity,
  Target, Calendar, Award, Zap, Filter,
  ArrowUp, BarChart3, PieChart
} from 'lucide-react';
import StoriesGrid from '../components/stories/StoriesGrid';
import CategoryGrid from '../components/stories/CategoryGrid';
import Button from '../components/ui/Button';
import DraftsList from '../components/ui/DraftsList';
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
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('week');

  // Fetch user's recent stories and recommendations
  const { stories: recentStories, loading: recentLoading } = useStories({
    sort_by: 'created_at',
    sort_order: 'desc',
    limit: 6
  });

  const { stories: featuredStories, loading: featuredLoading } = useStories({
    sort_by: 'updated_at',
    sort_order: 'desc',
    limit: 6
  });

  const { stories: popularStories, loading: popularLoading } = useStories({
    sort_by: 'created_at',
    sort_order: 'desc',
    limit: 6
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
    .slice(0, 8);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="pt-20">
      {/* Hero Welcome Section */}
      <div className="relative bg-gradient-to-br from-space-light via-space-base to-space-dark py-12 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-star-field opacity-20 bg-cover bg-center"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-600 rounded-full filter blur-[120px] opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary-600 rounded-full filter blur-[120px] opacity-20 animate-pulse-slow"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            {/* Welcome Message */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-primary-500 shadow-neon">
                  <img 
                    src={profile?.avatar_url || 'https://via.placeholder.com/64'} 
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-display font-bold text-white">
                    {getGreeting()}, {profile?.username || user?.email?.split('@')[0] || 'Explorer'}!
                  </h1>
                  <p className="text-gray-300 flex items-center gap-2">
                    <Activity size={16} className="text-success-400" />
                    {userStats.currentStreak} day reading streak
                  </p>
                </div>
              </div>

              {/* Weekly Progress Card */}
              <div className="bg-space-base/60 backdrop-blur-sm rounded-2xl p-6 border border-space-light/20 shadow-cosmic mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target size={20} className="text-accent-400" />
                    <h3 className="text-lg font-display font-semibold text-white">Weekly Reading Goal</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-display font-bold text-white">
                      {Math.round(userStats.weeklyProgress)}%
                    </p>
                    <p className="text-sm text-gray-400">Complete</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="h-3 bg-space-dark rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-accent-500 to-primary-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(userStats.weeklyProgress, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    {Math.floor(userStats.weeklyProgress * userStats.weeklyGoal / 100)} of {userStats.weeklyGoal} stories
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => handleGoalUpdate(Math.max(1, userStats.weeklyGoal - 1))}
                      className="text-xs px-2 py-1"
                    >
                      -
                    </Button>
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => handleGoalUpdate(userStats.weeklyGoal + 1)}
                      className="text-xs px-2 py-1"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="lg:w-80">
              <div className="bg-space-base/60 backdrop-blur-sm rounded-2xl p-6 border border-space-light/20 shadow-cosmic">
                <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap size={20} className="text-warning-400" />
                  Quick Actions
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/create">
                    <Button 
                      variant="primary"
                      size="md"
                      leftIcon={<Plus size={16} />}
                      className="w-full"
                    >
                      Create Story
                    </Button>
                  </Link>
                  <Link to="/explore">
                    <Button 
                      variant="secondary"
                      size="md"
                      leftIcon={<BookOpen size={16} />}
                      className="w-full"
                    >
                      Explore
                    </Button>
                  </Link>
                  <Link to="/create?drafts=true">
                    <Button 
                      variant="outline"
                      size="md"
                      leftIcon={<BookText size={16} />}
                      className="w-full"
                    >
                      My Drafts
                    </Button>
                  </Link>
                  <Link to="/bookmarks">
                    <Button 
                      variant="outline"
                      size="md"
                      leftIcon={<Bookmark size={16} />}
                      className="w-full"
                    >
                      Bookmarks
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 bg-space-dark min-h-screen">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content Column */}
          <div className="xl:col-span-3 space-y-8">
            {/* Platform Statistics Overview */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-semibold text-white flex items-center gap-2">
                  <BarChart3 size={24} className="text-primary-400" />
                  Platform Overview
                </h2>
                <div className="flex bg-space-base rounded-lg p-1 border border-space-light/20">
                  {(['week', 'month', 'year'] as const).map((timeframe) => (
                    <button
                      key={timeframe}
                      onClick={() => setSelectedTimeframe(timeframe)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                        selectedTimeframe === timeframe
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {timeframe}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-primary-600/20 to-primary-800/20 backdrop-blur-sm rounded-xl p-6 border border-primary-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-primary-600/30 rounded-lg">
                      <BookOpen size={24} className="text-primary-400" />
                    </div>
                    <div className="flex items-center gap-1 text-success-400 text-sm">
                      <ArrowUp size={14} />
                      <span>+{stats.storiesThisWeek}</span>
                    </div>
                  </div>
                  <p className="text-3xl font-display font-bold text-white mb-1">
                    {stats.totalStories.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">Total Stories</p>
                </div>

                <div className="bg-gradient-to-br from-secondary-600/20 to-secondary-800/20 backdrop-blur-sm rounded-xl p-6 border border-secondary-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-secondary-600/30 rounded-lg">
                      <Eye size={24} className="text-secondary-400" />
                    </div>
                    <div className="flex items-center gap-1 text-success-400 text-sm">
                      <ArrowUp size={14} />
                      <span>+{stats.viewsThisWeek}</span>
                    </div>
                  </div>
                  <p className="text-3xl font-display font-bold text-white mb-1">
                    {stats.totalViews.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">Total Views</p>
                </div>

                <div className="bg-gradient-to-br from-accent-600/20 to-accent-800/20 backdrop-blur-sm rounded-xl p-6 border border-accent-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-accent-600/30 rounded-lg">
                      <Users size={24} className="text-accent-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-display font-bold text-white mb-1">
                    {stats.totalUsers.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">Active Users</p>
                </div>

                <div className="bg-gradient-to-br from-success-600/20 to-success-800/20 backdrop-blur-sm rounded-xl p-6 border border-success-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-success-600/30 rounded-lg">
                      <Heart size={24} className="text-success-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-display font-bold text-white mb-1">
                    {stats.totalLikes.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">Total Likes</p>
                </div>
              </div>
            </section>

            {/* Personal Reading Stats */}
            <section>
              <h2 className="text-2xl font-display font-semibold text-white mb-6 flex items-center gap-2">
                <Activity size={24} className="text-accent-400" />
                Your Reading Journey
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-primary-600/30 rounded-lg">
                      <BookOpen size={24} className="text-primary-400" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-display font-bold text-white">
                        {userStats.totalStoriesRead}
                      </p>
                      <p className="text-sm text-gray-400">Stories Read</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar size={14} />
                    <span>This month: +{Math.floor(userStats.totalStoriesRead * 0.3)}</span>
                  </div>
                </div>

                <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-secondary-600/30 rounded-lg">
                      <Clock size={24} className="text-secondary-400" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-display font-bold text-white">
                        {Math.floor(userStats.totalReadingTime / 60)}h
                      </p>
                      <p className="text-sm text-gray-400">Reading Time</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <TrendingUp size={14} />
                    <span>Avg: {Math.floor(userStats.totalReadingTime / Math.max(userStats.totalStoriesRead, 1))}m per story</span>
                  </div>
                </div>

                <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-accent-600/30 rounded-lg">
                      <Award size={24} className="text-accent-400" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-display font-bold text-white">
                        {userStats.currentStreak}
                      </p>
                      <p className="text-sm text-gray-400">Day Streak</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Star size={14} />
                    <span>Best: {Math.max(userStats.currentStreak, 7)} days</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Browse Categories */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-semibold text-white flex items-center gap-2">
                  <PieChart size={24} className="text-secondary-400" />
                  Browse by Category
                </h2>
                <Link 
                  to="/explore"
                  className="text-primary-400 hover:text-primary-300 flex items-center gap-1 text-sm font-medium"
                >
                  View All <ChevronRight size={16} />
                </Link>
              </div>

              <CategoryGrid 
                categories={topCategories} 
                loading={categoriesLoading} 
                error={null}
                className="grid-cols-4 md:grid-cols-8"
              />
            </section>

            {/* Content Sections with Tabs */}
            <section>
              <div className="bg-space-base/50 backdrop-blur-sm rounded-2xl border border-space-light/20 overflow-hidden">
                {/* Tab Navigation */}
                <div className="border-b border-space-light/20">
                  <div className="flex overflow-x-auto">
                    <button className="flex items-center gap-2 px-6 py-4 text-white bg-space-accent/50 border-b-2 border-accent-500 whitespace-nowrap">
                      <Star size={16} className="text-accent-400" />
                      Featured Stories
                    </button>
                    <button className="flex items-center gap-2 px-6 py-4 text-gray-400 hover:text-white hover:bg-space-light/20 transition-colors whitespace-nowrap">
                      <TrendingUp size={16} />
                      Trending
                    </button>
                    <button className="flex items-center gap-2 px-6 py-4 text-gray-400 hover:text-white hover:bg-space-light/20 transition-colors whitespace-nowrap">
                      <Clock size={16} />
                      Latest
                    </button>
                    <button className="flex items-center gap-2 px-6 py-4 text-gray-400 hover:text-white hover:bg-space-light/20 transition-colors whitespace-nowrap">
                      <Bookmark size={16} />
                      For You
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  <StoriesGrid
                    stories={featuredStories}
                    loading={featuredLoading}
                    error={null}
                    hasMore={false}
                    onLoadMore={() => {}}
                    onLike={user ? handleLikeStory : undefined}
                    onBookmark={user ? handleBookmarkStory : undefined}
                    emptyMessage="No featured stories available"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  />
                  
                  <div className="text-center mt-6">
                    <Link to="/explore?featured=true">
                      <Button variant="outline" size="lg">
                        View All Featured Stories
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Activity Timeline */}
            {user?.id && (
              <section>
                <h2 className="text-2xl font-display font-semibold text-white mb-6 flex items-center gap-2">
                  <Activity size={24} className="text-success-400" />
                  Recent Activity
                </h2>
                <ActivityFeed userId={user.id} />
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Real-time Stats */}
            {user?.id && <RealtimeStats userId={user.id} />}

            {/* My Drafts Preview */}
            <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
                  <BookText size={20} className="text-warning-400" />
                  My Drafts
                </h3>
                <Link to="/create">
                  <Button variant="ghost" size="sm">
                    <Plus size={16} />
                  </Button>
                </Link>
              </div>
              <DraftsList />
            </div>

            {/* Top Categories Stats */}
            <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
              <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-success-400" />
                Popular Categories
              </h3>
              
              <div className="space-y-3">
                {stats.topCategories.slice(0, 5).map((category, index) => (
                  <Link 
                    key={category.id}
                    to={`/category/${category.name.toLowerCase()}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-space-light/20 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-400 w-6">
                        #{index + 1}
                      </span>
                      <div>
                        <span className="text-white font-medium group-hover:text-primary-400 transition-colors">
                          {category.name}
                        </span>
                        <div className="text-xs text-gray-400">
                          {category.story_count} stories
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">
                        {category.total_views.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">views</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Reading Achievements */}
            <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
              <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                <Award size={20} className="text-warning-400" />
                Achievements
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-success-900/20 rounded-lg border border-success-500/30">
                  <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center">
                    <BookOpen size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">First Story Read</p>
                    <p className="text-xs text-gray-400">Welcome to StoryVerse!</p>
                  </div>
                </div>

                {userStats.currentStreak >= 7 && (
                  <div className="flex items-center gap-3 p-3 bg-warning-900/20 rounded-lg border border-warning-500/30">
                    <div className="w-8 h-8 bg-warning-500 rounded-full flex items-center justify-center">
                      <Activity size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Week Warrior</p>
                      <p className="text-xs text-gray-400">7+ day reading streak</p>
                    </div>
                  </div>
                )}

                {userStats.totalStoriesRead >= 10 && (
                  <div className="flex items-center gap-3 p-3 bg-primary-900/20 rounded-lg border border-primary-500/30">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                      <Star size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Story Explorer</p>
                      <p className="text-xs text-gray-400">Read 10+ stories</p>
                    </div>
                  </div>
                )}

                <div className="text-center pt-2">
                  <Link to="/achievements">
                    <Button variant="ghost" size="sm" className="text-xs">
                      View All Achievements
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Recommended for You */}
            <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
              <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-accent-400" />
                Recommended for You
              </h3>
              
              <div className="space-y-4">
                {userStats.favoriteGenres.slice(0, 3).map((genre, index) => (
                  <Link 
                    key={index}
                    to={`/explore?category=${genre.toLowerCase()}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-space-light/20 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                        <span className="text-lg">
                          {genre === 'Fantasy' ? '🧙‍♂️' : 
                           genre === 'Sci-Fi' ? '🚀' : 
                           genre === 'Mystery' ? '🔍' : '📖'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium group-hover:text-primary-400 transition-colors">
                          {genre} Stories
                        </p>
                        <p className="text-xs text-gray-400">Based on your reading history</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 group-hover:text-primary-400 transition-colors" />
                  </Link>
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