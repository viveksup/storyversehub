import React, { useState } from 'react';
import StoryCard from '../components/ui/StoryCard';
import CategoryCard from '../components/ui/CategoryCard';
import { Search, Filter, X } from 'lucide-react';
import { mockStories, mockCategories } from '../data/mockData';
import Button from '../components/ui/Button';

const ExplorePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Filter stories based on search query and selected categories
  const filteredStories = mockStories.filter(story => {
    const matchesSearch = 
      searchQuery === '' || 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = 
      selectedCategories.length === 0 || 
      selectedCategories.includes(story.category);
      
    return matchesSearch && matchesCategory;
  });
  
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery('');
  };
  
  return (
    <div className="min-h-screen bg-space-dark pt-20">
      {/* Page Header */}
      <div className="bg-gradient-to-b from-space-light to-space-base py-16 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-display font-bold text-white mb-4">
            Explore the StoryVerse
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Discover thousands of stories across genres, from sci-fi adventures to educational content. 
            Use the filters to find exactly what you're looking for.
          </p>
          
          {/* Search and Filter */}
          <div className="mt-8 flex flex-col md:flex-row gap-4">
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
            
            <Button
              variant="secondary"
              leftIcon={<Filter size={18} />}
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              Filters {selectedCategories.length > 0 && `(${selectedCategories.length})`}
            </Button>
          </div>
          
          {/* Filter Section */}
          {filtersOpen && (
            <div className="mt-4 p-4 rounded-xl bg-space-base/90 backdrop-blur-md border border-space-light/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">Filters</h3>
                <button 
                  onClick={clearFilters}
                  className="text-sm text-primary-400 hover:text-primary-300"
                >
                  Clear all filters
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {mockCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.name)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selectedCategories.includes(category.name)
                        ? 'bg-secondary-600 text-white'
                        : 'bg-space-light/30 text-gray-300 hover:bg-space-light/50'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        {/* Categories Section */}
        <h2 className="text-2xl font-display font-semibold text-white mb-6">
          Popular Categories
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-12">
          {mockCategories.map(category => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
        
        {/* Results Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display font-semibold text-white">
            {filteredStories.length} {filteredStories.length === 1 ? 'Story' : 'Stories'} Found
          </h2>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Sort by:</span>
            <select className="bg-space-base border border-space-light/30 text-white rounded-lg py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>Trending</option>
              <option>Newest</option>
              <option>Highest Rated</option>
              <option>Most Viewed</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredStories.map(story => (
            <StoryCard key={story.id} story={story} showFull={true} />
          ))}
        </div>
        
        {filteredStories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">No stories found matching your criteria.</p>
            <Button variant="secondary" size="md" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
        
        {filteredStories.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Button variant="outline" size="lg">
              Load More Stories
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;