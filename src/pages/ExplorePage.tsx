import React, { useState, useEffect } from 'react';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import StoriesGrid from '../components/stories/StoriesGrid';
import CategoryGrid from '../components/stories/CategoryGrid';
import Button from '../components/ui/Button';
import { useStories, StoryFilters } from '../hooks/useStories';
import { useCategories } from '../hooks/useCategories';
import { supabase } from '../lib/supabase';

const ExplorePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedContentType, setSelectedContentType] = useState<string>('');
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'title'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Build filters object
  const filters: StoryFilters = {
    search: searchQuery || undefined,
    categories: selectedCategory ? [selectedCategory] : undefined,
    content_type: selectedContentType as any || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
    limit: 20
  };

  const { stories, loading, error, hasMore, loadMore, refresh } = useStories(filters);
  const { categories, loading: categoriesLoading } = useCategories();

  useEffect(() => {
    // Check for authenticated user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleLike = async (storyId: string) => {
    if (!user) return;
    
    try {
      // Track like in bookmarks table for now
      await supabase
        .from('bookmarks')
        .upsert({
          user_id: user.id,
          content_id: storyId,
          content_type: 'story'
        });
      
      // Refresh stories to update counts
      refresh();
    } catch (error) {
      console.error('Error liking story:', error);
    }
  };

  const handleBookmark = async (storyId: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from('bookmarks')
        .upsert({
          user_id: user.id,
          content_id: storyId,
          content_type: 'story'
        });
      
      refresh();
    } catch (error) {
      console.error('Error bookmarking story:', error);
    }
  };

  const handleShare = async (storyId: string) => {
    if (!user) return;
    
    try {
      const story = stories.find(s => s.id === storyId);
      if (story) {
        const shareUrl = `${window.location.origin}/story/${story.id}`;
        await navigator.share({
          title: story.title,
          text: story.description,
          url: shareUrl
        });

        // Could track share in user activities if needed
      }
    } catch (error) {
      console.error('Error sharing story:', error);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedContentType('');
    setSortBy('created_at');
    setSortOrder('desc');
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedContentType;

  return (
    <div className="min-h-screen bg-space-dark pt-20">
      {/* Page Header */}
      <div className="bg-gradient-to-b from-space-light to-space-base py-16 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-display font-bold text-white mb-4">
            Explore the StoryVerse
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mb-8">
            Discover thousands of stories across genres, from sci-fi adventures to educational content. 
            Use the filters to find exactly what you're looking for.
          </p>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search stories, authors, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 w-full rounded-xl bg-space-dark/40 text-white border border-space-light/30 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            {/* Filter Toggle */}
            <Button
              variant="secondary"
              leftIcon={<SlidersHorizontal size={18} />}
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              Filters 
              {hasActiveFilters && (
                <span className="ml-1 bg-accent-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {[searchQuery, selectedCategory, ...selectedTags, contentRating].filter(Boolean).length}
                </span>
              )}
            </Button>

            {/* Sort Controls */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-space-base border border-space-light/30 text-white rounded-lg py-3 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="published_at">Latest</option>
                <option value="updated_at">Recently Updated</option>
                <option value="title">Title A-Z</option>
              </select>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3"
              >
                {sortOrder === 'desc' ? '↓' : '↑'}
              </Button>
            </div>
          </div>
          
          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-6 rounded-xl bg-space-base/90 backdrop-blur-md border border-space-light/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">Advanced Filters</h3>
                {hasActiveFilters && (
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-primary-400 hover:text-primary-300"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    placeholder="Enter category name"
                    className="w-full bg-space-dark border border-space-light/30 text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Content Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content Type
                  </label>
                  <select
                    value={selectedContentType}
                    onChange={(e) => setSelectedContentType(e.target.value)}
                    className="w-full bg-space-dark border border-space-light/30 text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Types</option>
                    <option value="story">Story</option>
                    <option value="comic">Comic</option>
                    <option value="educational">Educational</option>
                  </select>
                </div>

                {/* Published Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.is_published === undefined ? 'all' : filters.is_published ? 'published' : 'draft'}
                    onChange={(e) => {
                      // This would need to be handled in the filters state
                    }}
                    className="w-full bg-space-dark border border-space-light/30 text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Content</option>
                    <option value="published">Published Only</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        {/* Categories Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-display font-semibold text-white mb-6">
            Browse by Category
          </h2>
          <CategoryGrid 
            categories={categories} 
            loading={categoriesLoading} 
            error={null}
          />
        </section>
        
        {/* Results Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-display font-semibold text-white">
              {hasActiveFilters ? 'Search Results' : 'Latest Stories'}
              <span className="text-gray-400 text-lg ml-2">
                ({stories.length} {stories.length === 1 ? 'story' : 'stories'})
              </span>
            </h2>
          </div>
          
          <StoriesGrid
            stories={stories}
            loading={loading}
            error={error}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onLike={user ? handleLike : undefined}
            onBookmark={user ? handleBookmark : undefined}
            onShare={user ? handleShare : undefined}
            emptyMessage={hasActiveFilters ? "No stories match your search criteria" : "No stories available"}
          />
        </section>
      </div>
    </div>
  );
};

export default ExplorePage;