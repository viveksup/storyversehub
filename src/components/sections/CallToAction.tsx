import React from 'react';
import Button from '../ui/Button';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';

const CallToAction: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-space-light to-space-base relative overflow-hidden">
      {/* Animated glow elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-secondary-600 rounded-full filter blur-[100px] opacity-20 animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent-600 rounded-full filter blur-[100px] opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-r from-space-dark/90 to-space-dark/80 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-cosmic border border-space-light/20 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Icon/Image Section */}
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="w-40 h-40 rounded-full bg-space-accent/30 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-4 border-secondary-500/50 animate-glow"></div>
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-secondary-600 to-accent-600 flex items-center justify-center shadow-neon">
                  <BookOpen size={56} className="text-white" />
                </div>
              </div>
            </div>
            
            {/* Text Content */}
            <div className="w-full md:w-2/3 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                Begin Your Journey in the StoryVerse Today
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of creators and millions of readers exploring the infinite possibilities of AI-powered storytelling.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                <Button 
                  variant="primary" 
                  size="lg"
                  rightIcon={<ArrowRight size={16} />}
                >
                  Get Started for Free
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg"
                  leftIcon={<Sparkles size={16} />}
                >
                  Explore Premium Features
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;