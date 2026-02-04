import React, { useState } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import StoriesGrid from '../components/stories/StoriesGrid';
import CategoryGrid from '../components/stories/CategoryGrid';
import Button from '../components/ui/Button';
import { useStories } from '../hooks/useStories';
import { useCategories } from '../hooks/useCategories';
import { supabase } from '../lib/supabase';

const ExplorePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'title'>('created_at');
  const [user, setUser] = useState<any>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const { stories, loading, error, hasMore, loadMore } = useStories({
    search: searchQuery || undefined,
    sort_by: sortBy,
    sort_order: 'desc',
    limit: 20
  });

  const { categories, loading: categoriesLoading } = useCategories();

  const handleLike = async (storyId: string) => {
    if (!user) return;
    await supabase.from('user_story_interactions').upsert({
      user_id: user.id,
      story_id: storyId,
      interaction_type: 'like'
    });
  };

  const handleBookmark = async (storyId: string) => {
    if (!user) return;
    await supabase.from('user_story_interactions').upsert({
      user_id: user.id,
      story_id: storyId,
      interaction_type: 'bookmark'
    });
  };

  return (
    <div className="pt-20 bg-space-dark min-h-screen">
      <div className="bg-gradient-to-b from-space-light to-space-base py-16 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-display font-bold text-white mb-4">
            Explore Stories
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Discover amazing stories from creators around the world
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search stories, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 w-full rounded-xl bg-space-dark/40 text-white border border-space-light/30 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-space-base border border-space-light/30 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 md:w-40"
            >
              <option value="created_at">Latest</option>
              <option value="updated_at">Recently Updated</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold text-white">Browse Categories</h2>
          </div>
          <CategoryGrid
            categories={categories}
            loading={categoriesLoading}
            error={null}
          />
        </section>

        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-display font-bold text-white">
                {searchQuery ? 'Search Results' : 'All Stories'}
              </h2>
              <p className="text-gray-400 mt-1">{stories.length} stories found</p>
            </div>
          </div>

          <StoriesGrid
            stories={stories}
            loading={loading}
            error={error}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onLike={user ? handleLike : undefined}
            onBookmark={user ? handleBookmark : undefined}
            emptyMessage={searchQuery ? "No stories match your search" : "No stories available"}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          />
        </section>
      </div>
    </div>
  );
};

export default ExplorePage;
