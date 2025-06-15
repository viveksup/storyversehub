import React from 'react';
import { Category } from '../../types';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const { id, name, icon, count } = category;
  
  // Dynamically get the icon component from lucide-react
  const IconComponent = LucideIcons[icon as keyof typeof LucideIcons] || LucideIcons.BookOpen;
  
  return (
    <Link 
      to={`/category/${id}`}
      className="flex flex-col items-center p-4 rounded-xl bg-space-base hover:bg-space-light/30 transition-all duration-200 group border border-space-light/20 hover:border-space-light/50"
    >
      <div className="w-12 h-12 rounded-full bg-space-light flex items-center justify-center group-hover:bg-space-accent transition-colors duration-300">
        <IconComponent size={24} className="text-secondary-300 group-hover:text-white transition-colors duration-300" />
      </div>
      <h3 className="mt-3 font-medium text-white text-center">{name}</h3>
      <p className="text-sm text-gray-400 mt-1">{count} stories</p>
    </Link>
  );
};

export default CategoryCard;