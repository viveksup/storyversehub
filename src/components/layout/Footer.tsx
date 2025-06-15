import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, Twitter, Facebook, Instagram, Github as GitHub, Youtube, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

const Footer: React.FC = () => {
  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    
    if (email) {
      // Handle newsletter subscription
      console.log('Newsletter subscription for:', email);
      // In a real app, you would send this to your backend
      alert('Thank you for subscribing to our newsletter!');
      e.currentTarget.reset();
    }
  };

  const handleSocialClick = (platform: string) => {
    // Analytics tracking for social media clicks
    console.log(`Social media click: ${platform}`);
  };

  return (
    <footer className="bg-space-dark pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-secondary-900 to-primary-900 rounded-2xl p-8 mb-12 shadow-cosmic">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h3 className="text-2xl font-display font-bold text-white">Join the StoryVerse Newsletter</h3>
              <p className="text-gray-300 mt-2">Get weekly curated stories and AI generation tips delivered to your inbox</p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="w-full md:w-auto flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <input 
                type="email" 
                name="email"
                placeholder="Enter your email" 
                required
                className="px-4 py-3 rounded-lg bg-space-dark/30 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[250px]"
                aria-label="Email address for newsletter subscription"
              />
              <Button 
                type="submit"
                variant="accent" 
                size="lg"
                rightIcon={<ArrowRight size={16} />}
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="rounded-lg bg-secondary-600 p-1.5">
                <BookOpen size={20} className="text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">StoryVerse</span>
            </Link>
            <p className="text-gray-400 mb-4 max-w-md">
              The ultimate universe for storytellers, learners, and creators—where AI-driven creativity meets community-powered interaction.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://twitter.com/storyversehub" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => handleSocialClick('Twitter')}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow us on Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="https://facebook.com/storyversehub" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => handleSocialClick('Facebook')}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow us on Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://instagram.com/storyversehub" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => handleSocialClick('Instagram')}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://youtube.com/@storyversehub" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => handleSocialClick('YouTube')}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Subscribe to our YouTube channel"
              >
                <Youtube size={20} />
              </a>
              <a 
                href="https://github.com/storyversehub" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => handleSocialClick('GitHub')}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="View our GitHub repository"
              >
                <GitHub size={20} />
              </a>
            </div>
          </div>
          
          {/* Links Columns */}
          <div>
            <h4 className="font-display font-semibold text-white text-lg mb-4">Explore</h4>
            <ul className="space-y-2">
              <li><Link to="/explore" className="text-gray-400 hover:text-white transition-colors">Browse Stories</Link></li>
              <li><Link to="/explore?filter=categories" className="text-gray-400 hover:text-white transition-colors">Categories</Link></li>
              <li><Link to="/explore?sort=popular" className="text-gray-400 hover:text-white transition-colors">Top Authors</Link></li>
              <li><Link to="/explore?filter=trending" className="text-gray-400 hover:text-white transition-colors">Trending Now</Link></li>
              <li><Link to="/explore?filter=new" className="text-gray-400 hover:text-white transition-colors">New Releases</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display font-semibold text-white text-lg mb-4">Community</h4>
            <ul className="space-y-2">
              <li><Link to="/community/forums" className="text-gray-400 hover:text-white transition-colors">Forums</Link></li>
              <li><Link to="/community/events" className="text-gray-400 hover:text-white transition-colors">Events</Link></li>
              <li><Link to="/community/contests" className="text-gray-400 hover:text-white transition-colors">Writing Contests</Link></li>
              <li>
                <a 
                  href="https://discord.gg/storyversehub" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Discord Server
                </a>
              </li>
              <li><Link to="/community/contribute" className="text-gray-400 hover:text-white transition-colors">Contribute</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display font-semibold text-white text-lg mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/support" className="text-gray-400 hover:text-white transition-colors">Help & Support</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Footer */}
        <div className="pt-8 mt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} StoryVerse Hub. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center space-x-4">
            <Link to="/legal/terms" className="text-gray-500 hover:text-white text-sm transition-colors">Terms of Service</Link>
            <Link to="/legal/privacy" className="text-gray-500 hover:text-white text-sm transition-colors">Privacy Policy</Link>
            <Link to="/legal/cookies" className="text-gray-500 hover:text-white text-sm transition-colors">Cookie Policy</Link>
            <Link to="/legal/accessibility" className="text-gray-500 hover:text-white text-sm transition-colors">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;