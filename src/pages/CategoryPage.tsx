import React from 'react';
import { useParams } from 'react-router-dom';
import { mockStories, mockCategories } from '../data/mockData';
import StoryCard from '../components/ui/StoryCard';
import * as LucideIcons from 'lucide-react';

const CategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const category = mockCategories.find(c => c.id === id);
  const stories = mockStories.filter(story => story.category === category?.name);
  
  // Dynamically get the icon component
  const IconComponent = category 
    ? LucideIcons[category.icon as keyof typeof LucideIcons] 
    : LucideIcons.BookOpen;

  return (
    <div className="min-h-screen bg-space-dark pt-20">
      {/* Category Header */}
      <div className="bg-gradient-to-b from-space-light to-space-base py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-space-accent flex items-center justify-center mb-4">
              <IconComponent size={40} className="text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-display font-bold text-white text-center mb-4">
            {category?.name || 'Category Not Found'}
          </h1>
          <p className="text-xl text-gray-300 text-center max-w-2xl mx-auto">
            Explore {category?.count || 0} stories in the {category?.name} category, 
            from trending hits to hidden gems.
          </p>
        </div>
      </div>
      
      {/* Stories Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-display font-semibold text-white">
            {stories.length} Stories Found
          </h2>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Sort by:</span>
            <select className="bg-space-base border border-space-light/30 text-white rounded-lg py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>Trending</option>
              <option>Newest</option>
              <option>Most Viewed</option>
              <option>Top Rated</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {stories.map(story => (
            <StoryCard key={story.id} story={story} showFull={true} />
          ))}
        </div>
        
        {stories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No stories found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;