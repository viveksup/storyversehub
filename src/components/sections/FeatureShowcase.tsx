import React from 'react';
import { 
  BookOpen, Headphones, Cpu, Users, Sparkles, 
  BookMarked, TrendingUp, BookText 
} from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureShowcase: React.FC = () => {
  const features: Feature[] = [
    {
      icon: <Cpu size={32} className="text-primary-400" />,
      title: "AI-Powered Recommendations",
      description: "Get personalized story suggestions based on your reading habits, emotions, and preferences."
    },
    {
      icon: <Headphones size={32} className="text-secondary-400" />,
      title: "Lifelike Voice Narration",
      description: "Experience stories read in voices so real, you'll forget they're AI-generated."
    },
    {
      icon: <BookMarked size={32} className="text-accent-400" />,
      title: "User-Generated Content",
      description: "Upload your own stories, get feedback, and build your following among readers worldwide."
    },
    {
      icon: <Sparkles size={32} className="text-success-400" />,
      title: "AI Creation Tools",
      description: "Enhance your writing with AI tools that help with plot development, character creation, and more."
    },
    {
      icon: <TrendingUp size={32} className="text-warning-400" />,
      title: "Engagement Analytics",
      description: "See how readers interact with your stories and get insights to improve your craft."
    },
    {
      icon: <Users size={32} className="text-error-400" />,
      title: "Global Community",
      description: "Connect with fellow creators and readers through forums, events, and collaborative projects."
    },
    {
      icon: <BookText size={32} className="text-primary-400" />,
      title: "Educational Content",
      description: "Access textbooks and learning materials enhanced with interactive elements and AI narration."
    },
    {
      icon: <BookOpen size={32} className="text-secondary-400" />,
      title: "Immersive Reading Experience",
      description: "Enjoy 3D immersive views, dark mode, and customizable reading preferences."
    }
  ];
  
  return (
    <section className="py-20 bg-space-base relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 bg-nebula-pattern opacity-10 bg-cover bg-center"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-space-base to-space-dark"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-primary-400 to-secondary-400 text-transparent bg-clip-text">
              Beyond Next-Level Features
            </span>
          </h2>
          <p className="text-xl text-gray-300">
            Discover the tools and experiences that make StoryVerse Hub the ultimate platform for storytelling and learning.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-space-light/20 backdrop-blur-sm rounded-xl p-6 border border-space-light/10 hover:border-space-light/30 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-cosmic group"
            >
              <div className="w-14 h-14 rounded-lg bg-space-dark flex items-center justify-center mb-4 group-hover:bg-space-accent/30 transition-colors duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-display font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;