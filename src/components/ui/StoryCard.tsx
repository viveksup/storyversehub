import React from 'react';
import { Story } from '../../types';
import { Heart, Eye, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StoryCardProps {
  story: Story;
  size?: 'sm' | 'md' | 'lg';
  showFull?: boolean;
}

const StoryCard: React.FC<StoryCardProps> = ({ 
  story, 
  size = 'md',
  showFull = false
}) => {
  const { id, title, author, coverImage, excerpt, readTime, likes, views, category, tags, isFeatured } = story;
  
  const sizeClasses = {
    sm: 'w-56 h-72',
    md: 'w-64 h-80',
    lg: 'w-72 h-96'
  };

  return (
    <div className={`relative ${sizeClasses[size]} group rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-cosmic`}>
      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-space-accent/30 to-transparent transition-opacity duration-300 z-0"></div>
      
      {/* Featured badge */}
      {isFeatured && (
        <div className="absolute top-2 right-2 z-20 bg-accent-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
          <Star size={12} className="mr-1" />
          Featured
        </div>
      )}
      
      {/* Cover image */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src={coverImage} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent"></div>
      </div>
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
        <div className="space-y-1">
          <p className="text-xs text-primary-300 font-medium">{category}</p>
          <h3 className="font-display font-bold text-white text-lg leading-tight">{title}</h3>
          <p className="text-sm text-gray-300">By {author}</p>
          
          {showFull && (
            <p className="text-sm text-gray-400 mt-2 line-clamp-2">{excerpt}</p>
          )}
          
          <div className="flex items-center space-x-3 mt-2">
            <div className="flex items-center text-gray-400 text-xs">
              <Clock size={12} className="mr-1" />
              {readTime} min
            </div>
            <div className="flex items-center text-gray-400 text-xs">
              <Eye size={12} className="mr-1" />
              {views}
            </div>
            <div className="flex items-center text-gray-400 text-xs">
              <Heart size={12} className="mr-1 text-accent-400" fill="#f472b6" />
              {likes}
            </div>
          </div>
          
          {showFull && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <Link 
          to={`/story/${id}`}
          className="absolute inset-0"
          aria-label={`Read ${title}`}
        />
      </div>
    </div>
  );
};

export default StoryCard;