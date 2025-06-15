import React from 'react';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import Button from '../ui/Button';

const Hero: React.FC = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pb-20 pt-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-star-field opacity-30 bg-cover bg-center"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-space-dark via-space-base to-space-light opacity-90"></div>
      
      {/* Animated stars/particles (placeholder for a real particle effect) */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-70 animate-pulse-slow"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 5}s`
            }}
          ></div>
        ))}
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Small floating badge */}
          <div className="inline-block animate-float mb-4 bg-accent-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-neon">
            <div className="flex items-center space-x-2">
              <Sparkles size={16} className="text-accent-200" />
              <span className="text-sm font-medium">AI-Powered Storytelling Revolution</span>
            </div>
          </div>
          
          {/* Main headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight">
            <span className="block">The Galactic Nexus of</span>
            <span className="bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 text-transparent bg-clip-text">
              AI-Powered Storytelling
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Unleash your imagination in a universe where AI enhances your creativity. 
            Read, write, listen, and connect with stories that transcend boundaries.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              variant="primary" 
              size="lg"
              rightIcon={<ArrowRight size={18} />}
              className="px-8 py-4 text-lg shadow-neon"
            >
              Explore the StoryVerse
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              leftIcon={<BookOpen size={18} />}
              className="px-8 py-4 text-lg"
            >
              Start Creating
            </Button>
          </div>
          
          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: 'Stories Created', value: '150K+' },
              { label: 'Active Creators', value: '50K+' },
              { label: 'Daily Readers', value: '1M+' },
              { label: 'Audio Minutes', value: '30M+' }
            ].map((stat, index) => (
              <div key={index} className="bg-space-light/30 backdrop-blur-sm rounded-xl p-4 border border-space-accent/30">
                <p className="text-2xl md:text-3xl font-display font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;