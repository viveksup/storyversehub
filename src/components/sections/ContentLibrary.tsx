import React, { useState } from 'react';
import StoryCard from '../ui/StoryCard';
import CategoryCard from '../ui/CategoryCard';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { mockRecommendations, mockCategories } from '../../data/mockData';

interface SectionTitleProps {
  title: string;
  viewAllLink?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, viewAllLink }) => (
  <div className="flex items-center justify-between mb-6">
    <h3 className="text-2xl font-display font-semibold text-white">{title}</h3>
    {viewAllLink && (
      <a href={viewAllLink} className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center">
        View All <ChevronRight size={16} className="ml-1" />
      </a>
    )}
  </div>
);

const ContentLibrary: React.FC = () => {
  // State for each carousel
  const [activeSlides, setActiveSlides] = useState<Record<string, number>>({
    'Based on your reading history': 0,
    'Popular in your network': 0,
    'AI-Curated Cosmic Gems': 0,
    'New releases': 0
  });
  
  // Function to handle slide navigation
  const handleSlideChange = (section: string, direction: 'prev' | 'next') => {
    setActiveSlides(prev => {
      const currentSlide = prev[section];
      const maxSlides = Math.ceil(mockRecommendations.find(r => r.title === section)?.stories.length || 0 / 3) - 1;
      
      if (direction === 'next' && currentSlide < maxSlides) {
        return { ...prev, [section]: currentSlide + 1 };
      } else if (direction === 'prev' && currentSlide > 0) {
        return { ...prev, [section]: currentSlide - 1 };
      }
      
      return prev;
    });
  };
  
  return (
    <section className="py-16 bg-gradient-to-b from-space-base to-space-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Categories Section */}
        <SectionTitle title="Browse by Category" viewAllLink="/categories" />
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-16">
          {mockCategories.map(category => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
        
        {/* Recommendation Sections */}
        {mockRecommendations.map((section, index) => (
          <div key={index} className="mb-12">
            <SectionTitle title={section.title} viewAllLink={`/recommendations/${section.title.toLowerCase().replace(/\s+/g, '-')}`} />
            
            <div className="relative">
              {/* Navigation Buttons */}
              {activeSlides[section.title] > 0 && (
                <button 
                  onClick={() => handleSlideChange(section.title, 'prev')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 bg-space-light/80 text-white rounded-full p-2 hover:bg-space-accent transition-colors"
                  aria-label="Previous stories"
                >
                  <ChevronLeft size={24} />
                </button>
              )}
              
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${activeSlides[section.title] * 100}%)` }}
                >
                  <div className="flex space-x-6 min-w-full">
                    {section.stories.map((story, i) => (
                      <div key={i} className="w-72 flex-shrink-0">
                        <StoryCard story={story} showFull={true} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {activeSlides[section.title] < Math.ceil(section.stories.length / 3) - 1 && (
                <button 
                  onClick={() => handleSlideChange(section.title, 'next')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 bg-space-light/80 text-white rounded-full p-2 hover:bg-space-accent transition-colors"
                  aria-label="Next stories"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ContentLibrary;