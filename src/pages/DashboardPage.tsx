import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Clock, TrendingUp, Star, 
  History, Bookmark, Heart, Plus,
  ChevronRight, Sparkles, BookText
} from 'lucide-react';
import StoryCard from '../components/ui/StoryCard';
import CategoryCard from '../components/ui/CategoryCard';
import Button from '../components/ui/Button';
import RealtimeStats from '../components/dashboard/RealtimeStats';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import { supabase } from '../lib/supabase';
import { useRealtimeUserData } from '../hooks/useRealtimeUserData';
import { mockStories, mockCategories } from '../data/mockData';

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [readingList, setReadingList] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

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

      // Load reading list
      const { data: bookmarks } = await supabase
        .from('bookmarks')
        .select('content_id')
        .eq('user_id', user.id)
        .limit(4);

      // Load recently viewed
      const { data: history } = await supabase
        .from('reading_history')
        .select('content_id')
        .eq('user_id', user.id)
        .order('last_read_at', { ascending: false })
        .limit(4);

      // For demo, using mock data
      setReadingList(mockStories.slice(0, 4));
      setRecentlyViewed(mockStories.slice(2, 6));
      setRecommendations(mockStories.slice(4, 8));
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
      await logUserActivity('story_liked', storyId);
    }
  };

  const handleBookmarkStory = async (storyId: string) => {
    if (user?.id) {
      await logUserActivity('story_bookmarked', storyId);
    }
  };

  const handleGoalUpdate = async (newGoal: number) => {
    await updateWeeklyGoal(newGoal);
  };

  // Get top categories for quick access
  const topCategories = mockCategories
    .sort((a, b) => b.count - a.count)
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
                <span>🔥 {userStats.currentStreak} day streak</span>
                <span>📚 {userStats.totalStoriesRead} stories read</span>
                <span>⏱️ {Math.floor(userStats.totalReadingTime / 60)}h reading time</span>
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
            {/* Popular Categories Quick Access */}
            <div>
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

              <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
                {topCategories.map(category => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </div>

            {/* Continue Reading */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-semibold text-white">
                  Continue Reading
                </h2>
                <Link 
                  to="/library"
                  className="text-primary-400 hover:text-primary-300 flex items-center"
                >
                  View All <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {recentlyViewed.slice(0, 2).map(story => (
                  <div key={story.id} onClick={() => handleStoryClick(story.id)}>
                    <StoryCard story={story} showFull={true} />
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended for You */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-semibold text-white">
                  Recommended for You
                </h2>
                <Link 
                  to="/explore"
                  className="text-primary-400 hover:text-primary-300 flex items-center"
                >
                  Explore More <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {recommendations.slice(0, 4).map(story => (
                  <div key={story.id} className="group">
                    <div onClick={() => handleStoryClick(story.id)}>
                      <StoryCard story={story} showFull={true} />
                    </div>
                    <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost"
                        size="sm"
                        leftIcon={<Heart size={14} />}
                        onClick={() => handleLikeStory(story.id)}
                      >
                        Like
                      </Button>
                      <Button 
                        variant="ghost"
                        size="sm"
                        leftIcon={<Bookmark size={14} />}
                        onClick={() => handleBookmarkStory(story.id)}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
                <Button 
                  variant="secondary"
                  size="sm"
                  leftIcon={<BookText size={16} />}
                  className="w-full"
                >
                  My Stories
                </Button>
                <Button 
                  variant="secondary"
                  size="sm"
                  leftIcon={<Bookmark size={16} />}
                  className="w-full"
                >
                  Reading List
                </Button>
                <Button 
                  variant="secondary"
                  size="sm"
                  leftIcon={<History size={16} />}
                  className="w-full"
                >
                  History
                </Button>
                <Button 
                  variant="secondary"
                  size="sm"
                  leftIcon={<Heart size={16} />}
                  className="w-full"
                >
                  Liked
                </Button>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;