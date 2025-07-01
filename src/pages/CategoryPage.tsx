import React from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import StoriesGrid from '../components/stories/StoriesGrid';
import Button from '../components/ui/Button';
import { useStories } from '../hooks/useStories';
import { useCategory } from '../hooks/useCategories';
import { supabase } from '../lib/supabase';

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { category, loading: categoryLoading, error: categoryError } = useCategory(slug || '');
  const { stories, loading, error, hasMore, loadMore } = useStories({
    category: slug,
    sort_by: 'published_at',
    sort_order: 'desc'
  });

  const handleLike = async (storyId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      await supabase
        .from('user_story_interactions')
        .upsert({
          user_id: user.id,
          story_id: storyId,
          interaction_type: 'like'
        });
    } catch (error) {
      console.error('Error liking story:', error);
    }
  };

  const handleBookmark = async (storyId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      await supabase
        .from('user_story_interactions')
        .upsert({
          user_id: user.id,
          story_id: storyId,
          interaction_type: 'bookmark'
        });
    } catch (error) {
      console.error('Error bookmarking story:', error);
    }
  };

  const handleShare = async (storyId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const story = stories.find(s => s.id === storyId);
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
      }
    } catch (error) {
      console.error('Error sharing story:', error);
    }
  };

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-space-dark pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading category...</p>
        </div>
      </div>
    );
  }

  if (categoryError || !category) {
    return (
      <div className="min-h-screen bg-space-dark pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display font-semibold text-white mb-4">
            Category not found
          </h2>
          <p className="text-gray-400 mb-6">
            The category you're looking for doesn't exist or has been removed.
          </p>
          <Button 
            variant="primary" 
            leftIcon={<ArrowLeft size={18} />}
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Get category icon
  const IconComponent = LucideIcons[category.icon as keyof typeof LucideIcons] || LucideIcons.BookOpen;

  return (
    <div className="min-h-screen bg-space-dark pt-20">
      {/* Category Header */}
      <div className="bg-gradient-to-b from-space-light to-space-base py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-6">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <IconComponent size={40} style={{ color: category.color }} />
            </div>
          </div>
          
          <h1 className="text-4xl font-display font-bold text-white text-center mb-4">
            {category.name}
          </h1>
          
          {category.description && (
            <p className="text-xl text-gray-300 text-center max-w-2xl mx-auto mb-4">
              {category.description}
            </p>
          )}
          
          <p className="text-lg text-gray-400 text-center">
            Explore {stories.length} stories in the {category.name} category
          </p>
        </div>
      </div>
      
      {/* Stories Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="ghost" 
            leftIcon={<ArrowLeft size={18} />}
            onClick={() => window.history.back()}
          >
            Back
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Sort by:</span>
            <select className="bg-space-base border border-space-light/30 text-white rounded-lg py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="published_at">Latest</option>
              <option value="views_count">Most Viewed</option>
              <option value="likes_count">Most Liked</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>
        
        <StoriesGrid
          stories={stories}
          loading={loading}
          error={error}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onLike={handleLike}
          onBookmark={handleBookmark}
          onShare={handleShare}
          emptyMessage={`No stories found in the ${category.name} category`}
        />
      </div>
    </div>
  );
};

export default CategoryPage;