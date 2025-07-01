import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Category } from '../../hooks/useCategories';

interface CategoryGridProps {
  categories: Category[];
  loading: boolean;
  error: Error | null;
  className?: string;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  loading,
  error,
  className = ""
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 size={32} className="animate-spin text-primary-500" />
        <span className="ml-2 text-gray-400">Loading categories...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle size={48} className="text-error-400 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Failed to load categories
        </h3>
        <p className="text-gray-400 text-center max-w-md">
          {error.message}
        </p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-space-light/30 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">📂</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          No categories found
        </h3>
        <p className="text-gray-400 text-center max-w-md">
          Categories will appear here once they are created.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 ${className}`}>
      {categories.map((category) => {
        const IconComponent = LucideIcons[category.icon as keyof typeof LucideIcons] || LucideIcons.BookOpen;
        
        return (
          <Link 
            key={category.id}
            to={`/category/${category.slug}`}
            className="group flex flex-col items-center p-4 rounded-xl bg-space-base/50 hover:bg-space-light/30 transition-all duration-200 border border-space-light/20 hover:border-space-light/50 hover:transform hover:-translate-y-1"
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-3"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <IconComponent 
                size={24} 
                style={{ color: category.color }}
                className="transition-colors duration-300"
              />
            </div>
            
            <h3 className="font-medium text-white text-center text-sm leading-tight mb-1">
              {category.name}
            </h3>
            
            <p className="text-xs text-gray-400 text-center">
              {category.story_count || 0} stories
            </p>

            {category.description && (
              <p className="text-xs text-gray-500 text-center mt-1 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {category.description}
              </p>
            )}
          </Link>
        );
      })}
    </div>
  );
};

export default CategoryGrid;