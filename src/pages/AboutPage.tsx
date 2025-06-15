import React from 'react';
import { Users, Target, Award, Heart, Rocket, Globe } from 'lucide-react';

const AboutPage: React.FC = () => {
  const teamMembers = [
    {
      name: 'Dr. Sarah Chen',
      role: 'CEO & Co-Founder',
      image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Former AI researcher at MIT with a passion for democratizing storytelling through technology.'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'CTO & Co-Founder',
      image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Full-stack engineer with 15+ years experience building scalable platforms for creative communities.'
    },
    {
      name: 'Elena Vasquez',
      role: 'Head of AI Research',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Leading expert in natural language processing and voice synthesis technologies.'
    },
    {
      name: 'David Kim',
      role: 'Head of Design',
      image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Award-winning UX designer focused on creating inclusive and accessible digital experiences.'
    }
  ];

  const values = [
    {
      icon: <Heart size={32} className="text-accent-400" />,
      title: 'Community First',
      description: 'We believe in the power of community to inspire, support, and elevate storytellers worldwide.'
    },
    {
      icon: <Rocket size={32} className="text-primary-400" />,
      title: 'Innovation',
      description: 'We push the boundaries of what\'s possible with AI to enhance human creativity, not replace it.'
    },
    {
      icon: <Globe size={32} className="text-secondary-400" />,
      title: 'Accessibility',
      description: 'Stories should be accessible to everyone, regardless of ability, language, or background.'
    },
    {
      icon: <Award size={32} className="text-success-400" />,
      title: 'Quality',
      description: 'We maintain the highest standards in content curation and platform reliability.'
    }
  ];

  return (
    <div className="min-h-screen bg-space-dark pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-space-light to-space-base py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            About StoryVerse Hub
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We're on a mission to democratize storytelling through AI-powered tools that enhance human creativity 
            and connect readers with stories that inspire, educate, and entertain.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-display font-bold text-white mb-6">Our Mission</h2>
            <p className="text-gray-300 mb-6">
              At StoryVerse Hub, we believe that everyone has a story to tell and every story deserves to be heard. 
              Our platform combines cutting-edge AI technology with human creativity to break down barriers in 
              storytelling and reading.
            </p>
            <p className="text-gray-300 mb-6">
              Whether you're a seasoned author, an aspiring writer, or someone who simply loves to read, 
              we provide the tools and community to help you discover, create, and share stories that matter.
            </p>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-600/30 rounded-lg">
                <Target size={24} className="text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Our Goal</h3>
                <p className="text-gray-400">To become the world's most inclusive storytelling platform</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=800" 
              alt="Team collaboration"
              className="rounded-xl shadow-cosmic"
            />
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-space-base py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-white text-center mb-12">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-space-light/20 rounded-xl p-6 text-center">
                <div className="flex justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-display font-semibold text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-400">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-display font-bold text-white text-center mb-12">
          Meet Our Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-space-base/50 rounded-xl p-6 text-center border border-space-light/20">
              <img 
                src={member.image} 
                alt={member.name}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-lg font-display font-semibold text-white mb-1">
                {member.name}
              </h3>
              <p className="text-primary-400 text-sm mb-3">
                {member.role}
              </p>
              <p className="text-gray-400 text-sm">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-space-light to-space-base py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                150K+
              </div>
              <div className="text-gray-400">Stories Created</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                50K+
              </div>
              <div className="text-gray-400">Active Creators</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                1M+
              </div>
              <div className="text-gray-400">Daily Readers</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                30M+
              </div>
              <div className="text-gray-400">Audio Minutes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;