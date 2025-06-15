import React from 'react';
import { useParams } from 'react-router-dom';
import { mockStories } from '../data/mockData';
import StoryCard from '../components/ui/StoryCard';
import { User, BookOpen, Star, Users, Award } from 'lucide-react';
import Button from '../components/ui/Button';

const AuthorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const authorStories = mockStories.filter(story => story.authorId === id);
  const author = {
    id,
    name: authorStories[0]?.author || 'Unknown Author',
    avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    bio: 'Visionary storyteller exploring the boundaries between science and imagination. Specializing in quantum fiction and mind-bending narratives that challenge our understanding of reality.',
    stats: {
      stories: authorStories.length,
      followers: 12453,
      totalViews: authorStories.reduce((acc, story) => acc + story.views, 0),
      awards: ['Rising Star 2024', 'Best Quantum Fiction Series']
    }
  };

  return (
    <div className="min-h-screen bg-space-dark pt-20">
      {/* Author Header */}
      <div className="bg-gradient-to-b from-space-light to-space-base py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-secondary-500 shadow-neon">
              <img 
                src={author.avatar} 
                alt={author.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                {author.name}
              </h1>
              <p className="text-gray-300 mb-6 max-w-2xl">
                {author.bio}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-space-base/50 p-4 rounded-xl border border-space-light/20">
                  <div className="flex items-center text-secondary-400 mb-1">
                    <BookOpen size={16} className="mr-2" />
                    Stories
                  </div>
                  <div className="text-2xl font-display font-bold text-white">
                    {author.stats.stories}
                  </div>
                </div>
                
                <div className="bg-space-base/50 p-4 rounded-xl border border-space-light/20">
                  <div className="flex items-center text-secondary-400 mb-1">
                    <Users size={16} className="mr-2" />
                    Followers
                  </div>
                  <div className="text-2xl font-display font-bold text-white">
                    {author.stats.followers.toLocaleString()}
                  </div>
                </div>
                
                <div className="bg-space-base/50 p-4 rounded-xl border border-space-light/20">
                  <div className="flex items-center text-secondary-400 mb-1">
                    <Eye size={16} className="mr-2" />
                    Total Views
                  </div>
                  <div className="text-2xl font-display font-bold text-white">
                    {author.stats.totalViews.toLocaleString()}
                  </div>
                </div>
                
                <div className="bg-space-base/50 p-4 rounded-xl border border-space-light/20">
                  <div className="flex items-center text-secondary-400 mb-1">
                    <Award size={16} className="mr-2" />
                    Awards
                  </div>
                  <div className="text-2xl font-display font-bold text-white">
                    {author.stats.awards.length}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  variant="primary"
                  size="lg"
                  leftIcon={<User size={18} />}
                >
                  Follow
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  leftIcon={<Star size={18} />}
                >
                  Support Creator
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Author's Stories */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-display font-semibold text-white mb-6">
          Stories by {author.name}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {authorStories.map(story => (
            <StoryCard key={story.id} story={story} showFull={true} />
          ))}
        </div>
        
        {authorStories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No stories found for this author.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorPage;