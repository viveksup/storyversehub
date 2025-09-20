import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import StoryCard from './StoryCard';
import Button from '../ui/Button';
import { Story } from '../../hooks/useStories';

interface StoriesGridProps {
  stories: Story[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  onLoadMore: () => void;
  onLike?: (storyId: string) => void;
  onBookmark?: (storyId: string) => void;
  onShare?: (storyId: string) => void;
  emptyMessage?: string;
  className?: string;
}

const StoriesGrid: React.FC<StoriesGridProps> = ({
  stories,
  loading,
  error,
  hasMore,
  onLoadMore,
  onLike,
  onBookmark,
  onShare,
  emptyMessage = "No stories found",
  className = ""
}) => {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle size={48} className="text-error-400 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Failed to load stories
        </h3>
        <p className="text-gray-400 text-center max-w-md">
          {error.message}
        </p>
      </div>
    );
  }

  if (!loading && stories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-space-light/30 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">📚</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-400 text-center max-w-md">
          Try adjusting your filters or check back later for new content.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Stories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {stories.map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            showFull={true}
            onLike={onLike}
            onBookmark={onBookmark}
            onShare={onShare}
          />
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 size={32} className="animate-spin text-primary-500" />
          <span className="ml-2 text-gray-400">Loading stories...</span>
        </div>
      )}

      {/* Load more button */}
      {!loading && hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={onLoadMore}
            className="px-8"
          >
            Load More Stories
          </Button>
        </div>
      )}

      {/* End of results indicator */}
      {!loading && !hasMore && stories.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">
            You've reached the end of the stories
          </p>
        </div>
      )}
    </div>
  );
};

export default StoriesGrid;