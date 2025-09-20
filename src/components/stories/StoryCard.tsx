import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, Clock, Star, Bookmark, Share2 } from 'lucide-react';
import { Story } from '../../hooks/useStories';

interface StoryCardProps {
  story: Story;
  size?: 'sm' | 'md' | 'lg';
  showFull?: boolean;
  onLike?: (storyId: string) => void;
  onBookmark?: (storyId: string) => void;
  onShare?: (storyId: string) => void;
}

const StoryCard: React.FC<StoryCardProps> = ({ 
  story, 
  size = 'md',
  showFull = false,
  onLike,
  onBookmark,
  onShare
}) => {
  const sizeClasses = {
    sm: 'w-56 h-72',
    md: 'w-64 h-80',
    lg: 'w-72 h-96'
  };

  const handleInteraction = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <div className={`relative ${sizeClasses[size]} group rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-cosmic`}>
      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-space-accent/30 to-transparent transition-opacity duration-300 z-0"></div>
      
      {/* Content Type badge */}
      <div className="absolute top-2 right-2 z-20 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
        {story.content_type}
      </div>
      
      {/* Cover image */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src={story.cover_image || 'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=400'} 
          alt={story.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent"></div>
      </div>
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
        <div className="space-y-1">
          {/* Category */}
          {story.categories && story.categories.length > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <span className="font-medium text-primary-400">
                {story.categories[0]}
              </span>
            </div>
          )}
          
          {/* Title */}
          <h3 className="font-display font-bold text-white text-lg leading-tight line-clamp-2">
            {story.title}
          </h3>
          
          {/* Author */}
          <p className="text-sm text-gray-300">
            By {story.author?.username || 'Unknown Author'}
          </p>
          
          {/* Excerpt */}
          {showFull && story.description && (
            <p className="text-sm text-gray-400 mt-2 line-clamp-2">
              {story.description}
            </p>
          )}
          
          {/* Stats */}
          <div className="flex items-center space-x-3 mt-2">
            {story.pages && (
              <div className="flex items-center text-gray-400 text-xs">
                <BookOpen size={12} className="mr-1" />
                {story.pages.length} pages
              </div>
            )}
          </div>
          
          {/* Tags */}
          {showFull && story.categories && story.categories.length > 1 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {story.categories.slice(1, 4).map((category, index) => (
                <span 
                  key={index} 
                  className="text-xs bg-gray-800/70 text-gray-300 px-2 py-0.5 rounded-full"
                >
                  {category}
                </span>
              ))}
              {story.categories.length > 4 && (
                <span className="text-xs text-gray-500">
                  +{story.categories.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action buttons (visible on hover) */}
        <div className="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2">
            {onLike && (
              <button
                onClick={(e) => handleInteraction(e, () => onLike(story.id))}
                className="p-1.5 bg-black/50 rounded-full hover:bg-accent-600 transition-colors"
                aria-label="Like story"
              >
                <Heart size={14} />
              </button>
            )}
            {onBookmark && (
              <button
                onClick={(e) => handleInteraction(e, () => onBookmark(story.id))}
                className="p-1.5 bg-black/50 rounded-full hover:bg-primary-600 transition-colors"
                aria-label="Bookmark story"
              >
                <Bookmark size={14} />
              </button>
            )}
            {onShare && (
              <button
                onClick={(e) => handleInteraction(e, () => onShare(story.id))}
                className="p-1.5 bg-black/50 rounded-full hover:bg-secondary-600 transition-colors"
                aria-label="Share story"
              >
                <Share2 size={14} />
              </button>
            )}
          </div>
          
          <div className="text-xs text-gray-400">
            {new Date(story.created_at).toLocaleDateString()}
          </div>
        </div>
        
        {/* Link overlay */}
        <Link 
          to={`/story/${story.id}`}
          className="absolute inset-0"
          aria-label={`Read ${story.title}`}
        />
      </div>
    </div>
  );
};

export default StoryCard;