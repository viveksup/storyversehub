import React from 'react';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { Category } from '../../hooks/useCategories';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const { id, name, slug, icon, color, story_count, description } = category;
  
  // Dynamically get the icon component from lucide-react
  const IconComponent = LucideIcons[icon as keyof typeof LucideIcons] || LucideIcons.BookOpen;
  
  return (
    <Link 
      to={`/category/${slug}`}
      className="group flex flex-col items-center p-4 rounded-xl bg-space-base/50 hover:bg-space-light/30 transition-all duration-200 border border-space-light/20 hover:border-space-light/50 hover:transform hover:-translate-y-1"
    >
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-3"
        style={{ backgroundColor: `${color}20` }}
      >
        <IconComponent 
          size={24} 
          style={{ color }}
          className="transition-colors duration-300"
        />
      </div>
      
      <h3 className="font-medium text-white text-center text-sm leading-tight mb-1">
        {name}
      </h3>
      
      <p className="text-xs text-gray-400 text-center">
        {story_count || 0} stories
      </p>

      {description && (
        <p className="text-xs text-gray-500 text-center mt-1 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {description}
        </p>
      )}
    </Link>
  );
};

export default CategoryCard;