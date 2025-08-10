import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Sparkles, TrendingUp, Star, Users } from 'lucide-react';
import Button from '../components/ui/Button';
import StoriesGrid from '../components/stories/StoriesGrid';
import CategoryGrid from '../components/stories/CategoryGrid';
import FeatureShowcase from '../components/sections/FeatureShowcase';
import VoiceShowcase from '../components/sections/VoiceShowcase';
import PricingSection from '../components/sections/PricingSection';
import CallToAction from '../components/sections/CallToAction';
import { useStories } from '../hooks/useStories';
import { useCategories } from '../hooks/useCategories';
import { useDashboardData } from '../hooks/useDashboardData';
import { supabase } from '../lib/supabase';

const HomePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  // Fetch featured stories
  const { stories: featuredStories, loading: featuredLoading, refresh: refreshFeatured } = useStories({
    is_featured: true,
    limit: 6
  });

  // Fetch popular stories
  const { stories: popularStories, loading: popularLoading, refresh: refreshPopular } = useStories({
    sort_by: 'published_at', // Fallback to date sorting since analytics sorting needs work
    sort_order: 'desc',
    limit: 6
  });

  // Fetch recent stories
  const { stories: recentStories, loading: recentLoading, refresh: refreshRecent } = useStories({
    sort_by: 'published_at',
    sort_order: 'desc',
    limit: 6
  });

  // Fetch categories
  const { categories, loading: categoriesLoading } = useCategories();

  // Fetch platform stats
  const { stats, loading: statsLoading } = useDashboardData();

  useEffect(() => {
    // Check for authenticated user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleLike = async (storyId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_story_interactions')
        .upsert({
          user_id: user.id,
          story_id: storyId,
          interaction_type: 'like'
        });
        
      if (error) {
        console.error('Error liking story:', error);
      }
    } catch (error) {
      console.error('Error liking story:', error);
    }
  };

  const handleBookmark = async (storyId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_story_interactions')
        .upsert({
          user_id: user.id,
          story_id: storyId,
          interaction_type: 'bookmark'
        });
        
      if (error) {
        console.error('Error bookmarking story:', error);
      }
    } catch (error) {
      console.error('Error bookmarking story:', error);
    }
  };

  const handleShare = async (storyId: string) => {
    if (!user) return;
    
    try {
      const story = [...featuredStories, ...popularStories, ...recentStories].find(s => s.id === storyId);
      if (story) {
        const shareUrl = `${window.location.origin}/story/${story.slug}`;
        await navigator.share({
          title: story.title,
          text: story.excerpt,
          url: shareUrl
        });

        await supabase
          .from('user_story_interactions')
          .upsert({
            user_id: user.id,
            story_id: storyId,
            interaction_type: 'share'
          });
          
        if (shareError) {
          console.error('Error tracking share:', shareError);
        }
      }
    } catch (error) {
      console.error('Error sharing story:', error);
    }
  };

  return (
    <div className="min-h-screen bg-space-dark">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden pb-20 pt-20">
        {/* Background effects */}
        <div className="absolute inset-0 bg-star-field opacity-30 bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-space-dark via-space-base to-space-light opacity-90"></div>
        
        {/* Animated stars/particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white opacity-70 animate-pulse-slow"
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 5}s`
              }}
            ></div>
          ))}
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Small floating badge */}
            <div className="inline-block animate-float mb-4 bg-accent-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-neon">
              <div className="flex items-center space-x-2">
                <Sparkles size={16} className="text-accent-200" />
                <span className="text-sm font-medium">AI-Powered Storytelling Revolution</span>
              </div>
            </div>
            
            {/* Main headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight">
              <span className="block">The Galactic Nexus of</span>
              <span className="bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 text-transparent bg-clip-text">
                AI-Powered Storytelling
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Unleash your imagination in a universe where AI enhances your creativity. 
              Read, write, listen, and connect with stories that transcend boundaries.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to={user ? "/dashboard" : "/explore"}>
                <Button 
                  variant="primary" 
                  size="lg"
                  rightIcon={<ArrowRight size={18} />}
                  className="px-8 py-4 text-lg shadow-neon"
                >
                  {user ? "Go to Dashboard" : "Explore the StoryVerse"}
                </Button>
              </Link>
              <Link to="/create">
                <Button 
                  variant="outline" 
                  size="lg"
                  leftIcon={<BookOpen size={18} />}
                  className="px-8 py-4 text-lg"
                >
                  Start Creating
                </Button>
              </Link>
            </div>
            
            {/* Real-time Stats */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="bg-space-light/30 backdrop-blur-sm rounded-xl p-4 border border-space-accent/30">
                <p className="text-2xl md:text-3xl font-display font-bold text-white">
                  {statsLoading ? '...' : stats.totalStories.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">Stories Created</p>
              </div>
              <div className="bg-space-light/30 backdrop-blur-sm rounded-xl p-4 border border-space-accent/30">
                <p className="text-2xl md:text-3xl font-display font-bold text-white">
                  {statsLoading ? '...' : stats.totalUsers.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">Active Creators</p>
              </div>
              <div className="bg-space-light/30 backdrop-blur-sm rounded-xl p-4 border border-space-accent/30">
                <p className="text-2xl md:text-3xl font-display font-bold text-white">
                  {statsLoading ? '...' : stats.totalViews.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">Total Views</p>
              </div>
              <div className="bg-space-light/30 backdrop-blur-sm rounded-xl p-4 border border-space-accent/30">
                <p className="text-2xl md:text-3xl font-display font-bold text-white">
                  {statsLoading ? '...' : Math.floor(stats.totalViews / 60).toLocaleString()}K+
                </p>
                <p className="text-sm text-gray-400">Reading Hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Stories Section */}
      <section className="py-20 bg-gradient-to-b from-space-base to-space-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block mb-4 bg-accent-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-full">
              <div className="flex items-center space-x-2">
                <Star size={16} className="text-accent-200" />
                <span className="text-sm font-medium">Editor's Choice</span>
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 text-transparent bg-clip-text">
                Featured Stories
              </span>
            </h2>
            <p className="text-xl text-gray-300">
              Discover handpicked stories that showcase the best of our community's creativity.
            </p>
          </div>

          <StoriesGrid
            stories={featuredStories}
            loading={featuredLoading}
            error={null}
            hasMore={false}
            onLoadMore={() => {}}
            onLike={user ? handleLike : undefined}
            onBookmark={user ? handleBookmark : undefined}
            onShare={user ? handleShare : undefined}
            emptyMessage="No featured stories available"
          />

          <div className="text-center mt-8">
            <Link to="/explore?featured=true">
              <Button variant="outline" size="lg">
                View All Featured Stories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-space-base">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Explore by Category
            </h2>
            <p className="text-xl text-gray-300">
              From sci-fi adventures to educational content, find stories that match your interests.
            </p>
          </div>

          <CategoryGrid 
            categories={categories.slice(0, 12)} 
            loading={categoriesLoading} 
            error={null}
          />

          <div className="text-center mt-8">
            <Link to="/explore">
              <Button variant="outline" size="lg">
                Browse All Categories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Stories Section */}
      <section className="py-20 bg-gradient-to-b from-space-dark to-space-base">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block mb-4 bg-success-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-full">
              <div className="flex items-center space-x-2">
                <TrendingUp size={16} className="text-success-200" />
                <span className="text-sm font-medium">Trending Now</span>
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-success-400 to-primary-400 text-transparent bg-clip-text">
                Popular Stories
              </span>
            </h2>
            <p className="text-xl text-gray-300">
              See what the community is reading and loving right now.
            </p>
          </div>

          <StoriesGrid
            stories={popularStories}
            loading={popularLoading}
            error={null}
            hasMore={false}
            onLoadMore={() => {}}
            onLike={user ? handleLike : undefined}
            onBookmark={user ? handleBookmark : undefined}
            onShare={user ? handleShare : undefined}
            emptyMessage="No popular stories available"
          />

          <div className="text-center mt-8">
            <Link to="/explore?sort=views">
              <Button variant="outline" size="lg">
                View All Trending Stories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Stories Section */}
      <section className="py-20 bg-space-base">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Latest Stories
            </h2>
            <p className="text-xl text-gray-300">
              Fresh content from our talented community of storytellers.
            </p>
          </div>

          <StoriesGrid
            stories={recentStories}
            loading={recentLoading}
            error={null}
            hasMore={false}
            onLoadMore={() => {}}
            onLike={user ? handleLike : undefined}
            onBookmark={user ? handleBookmark : undefined}
            onShare={user ? handleShare : undefined}
            emptyMessage="No recent stories available"
          />

          <div className="text-center mt-8">
            <Link to="/explore">
              <Button variant="outline" size="lg">
                Explore All Stories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <FeatureShowcase />

      {/* Voice Showcase */}
      <VoiceShowcase />

      {/* Pricing Section */}
      <PricingSection />

      {/* Call to Action */}
      <CallToAction />
    </div>
  );
};

export default HomePage;