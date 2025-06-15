import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp } from 'lucide-react';
import CategoryCard from '../ui/CategoryCard';
import StoryCard from '../ui/StoryCard';
import { mockCategories, mockStories } from '../../data/mockData';

const PopularCategories: React.FC = () => {
  // Get trending stories for each category
  const getCategoryStories = (categoryName: string) => {
    return mockStories
      .filter(story => story.category === categoryName)
      .sort((a, b) => b.views - a.views)
      .slice(0, 3);
  };

  const topCategories = mockCategories
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <section className="py-20 bg-gradient-to-b from-space-base to-space-dark relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-star-field opacity-10 bg-cover bg-center"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-600 rounded-full filter blur-[120px] opacity-20 animate-pulse-slow"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary-600 rounded-full filter blur-[120px] opacity-20 animate-pulse-slow" style={{ animationDelay: '3s' }}></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block mb-4 bg-accent-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-full">
            <div className="flex items-center space-x-2">
              <TrendingUp size={16} className="text-accent-200" />
              <span className="text-sm font-medium">Trending Categories</span>
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-primary-400 to-secondary-400 text-transparent bg-clip-text">
              Popular Categories
            </span>
          </h2>
          <p className="text-xl text-gray-300">
            Discover the most loved genres and find your next favorite story across diverse categories.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 mb-16">
          {topCategories.map(category => (
            <div key={category.id} className="group">
              <CategoryCard category={category} />
              <div className="mt-2 text-center">
                <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                  {category.count} stories
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Category Sections */}
        <div className="space-y-16">
          {topCategories.slice(0, 3).map((category) => {
            const categoryStories = getCategoryStories(category.name);
            
            if (categoryStories.length === 0) return null;

            return (
              <div key={category.id} className="category-showcase">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center shadow-neon">
                      <span className="text-2xl">
                        {category.name === 'Sci-Fi' ? '🚀' : 
                         category.name === 'Fantasy' ? '🧙‍♂️' : 
                         category.name === 'Mystery' ? '🔍' : 
                         category.name === 'Romance' ? '💕' : 
                         category.name === 'Horror' ? '👻' : 
                         category.name === 'Educational' ? '📚' : '📖'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-display font-semibold text-white">
                        Trending in {category.name}
                      </h3>
                      <p className="text-gray-400">
                        {category.count} stories • Most popular this week
                      </p>
                    </div>
                  </div>
                  
                  <Link 
                    to={`/category/${category.id}`}
                    className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center group"
                  >
                    View All 
                    <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {categoryStories.map((story, index) => (
                    <div key={story.id} className="relative">
                      <div className="absolute -top-2 -left-2 z-10 bg-accent-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {index + 1}
                      </div>
                      <StoryCard story={story} showFull={true} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Category Stats */}
        <div className="mt-16 bg-space-base/50 backdrop-blur-sm rounded-2xl p-8 border border-space-light/20">
          <h3 className="text-xl font-display font-semibold text-white mb-6 text-center">
            Category Statistics
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {mockCategories.slice(0, 4).map((category, index) => (
              <div key={category.id} className="text-center">
                <div className="text-3xl mb-2">
                  {category.name === 'Sci-Fi' ? '🚀' : 
                   category.name === 'Fantasy' ? '🧙‍♂️' : 
                   category.name === 'Mystery' ? '🔍' : 
                   category.name === 'Romance' ? '💕' : '📖'}
                </div>
                <h4 className="font-medium text-white mb-1">{category.name}</h4>
                <p className="text-2xl font-display font-bold text-primary-400 mb-1">
                  {category.count}
                </p>
                <p className="text-xs text-gray-400">stories</p>
                <div className="mt-2 h-1 bg-space-dark rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                    style={{ width: `${(category.count / Math.max(...mockCategories.map(c => c.count))) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-space-dark/90 to-space-dark/80 backdrop-blur-md rounded-2xl p-8 border border-space-light/20 max-w-2xl mx-auto">
            <h3 className="text-2xl font-display font-bold text-white mb-4">
              Can't Find Your Genre?
            </h3>
            <p className="text-gray-300 mb-6">
              Explore our complete collection of categories or suggest a new one for the community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/explore">
                <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
                  Browse All Categories
                </button>
              </Link>
              <Link to="/suggest-category">
                <button className="px-6 py-3 bg-transparent border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white rounded-lg font-medium transition-colors">
                  Suggest New Category
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularCategories;