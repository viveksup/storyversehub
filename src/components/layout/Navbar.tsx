import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, Search, Bell, Menu, X, User, Settings, 
  LogOut, ChevronDown, Sparkles, Moon, Sun, MessageCircle
} from 'lucide-react';
import Button from '../ui/Button';
import MessageNotifications from '../messaging/MessageNotifications';
import { supabase } from '../../lib/supabase';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check for authenticated user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle scroll event to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close menus when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location]);
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  const getNavLinks = () => {
    if (user) {
      return [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Explore', path: '/explore' },
        { name: 'Messages', path: '/messages' },
        { name: 'Create', path: '/create' },
        { name: 'Pricing', path: '/pricing' },
      ];
    }
    return [
      { name: 'Home', path: '/' },
      { name: 'Explore', path: '/explore' },
      { name: 'Create', path: '/create' },
      { name: 'Pricing', path: '/pricing' },
    ];
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/');
    }
  };

  const handleMessageNotificationClick = (conversationId: string) => {
    navigate(`/messages?conversation=${conversationId}`);
  };
  
  const navLinks = getNavLinks();
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-space-base/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center space-x-2">
            <div className="rounded-lg bg-secondary-600 p-1.5">
              <BookOpen size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">StoryVerse</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search */}
            <button 
              className="p-2 text-gray-300 hover:text-white transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 text-gray-300 hover:text-white transition-colors"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* Message Notifications */}
            {user && (
              <MessageNotifications
                userId={user.id}
                onNotificationClick={handleMessageNotificationClick}
              />
            )}
            
            {/* Regular Notifications */}
            {user && (
              <button 
                className="p-2 text-gray-300 hover:text-white transition-colors relative"
                aria-label="Notifications"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            )}
            
            {/* User Menu (if logged in) */}
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-space-light/30 transition-colors"
                >
                  <img 
                    src={user.avatar_url || 'https://via.placeholder.com/32'} 
                    alt={user.email}
                    className="w-8 h-8 rounded-full object-cover border-2 border-secondary-500"
                  />
                  <ChevronDown size={16} className="text-gray-300" />
                </button>
                
                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-space-base border border-space-light/30 shadow-cosmic overflow-hidden">
                    <div className="p-3 border-b border-gray-800">
                      <p className="text-sm font-medium text-white">{user.email}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <Link 
                        to="/profile" 
                        className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-space-light/20 rounded-lg transition-colors"
                      >
                        <User size={16} className="mr-2" />
                        Profile
                      </Link>
                      <Link 
                        to="/profile" 
                        className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-space-light/20 rounded-lg transition-colors"
                      >
                        <Users size={16} className="mr-2" />
                        Find Users
                      </Link>
                      <Link 
                        to="/messages" 
                        className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-space-light/20 rounded-lg transition-colors"
                      >
                        <MessageCircle size={16} className="mr-2" />
                        Messages
                      </Link>
                      <Link 
                        to="/settings" 
                        className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-space-light/20 rounded-lg transition-colors"
                      >
                        <Settings size={16} className="mr-2" />
                        Settings
                      </Link>
                      {user.isPremium ? (
                        <div className="flex items-center px-3 py-2 text-sm text-accent-400 bg-accent-900/20 rounded-lg my-1">
                          <Sparkles size={16} className="mr-2" />
                          Premium Active
                        </div>
                      ) : (
                        <Link 
                          to="/pricing" 
                          className="flex items-center px-3 py-2 text-sm text-accent-400 hover:bg-accent-900/20 rounded-lg transition-colors my-1"
                        >
                          <Sparkles size={16} className="mr-2" />
                          Upgrade to Premium
                        </Link>
                      )}
                      <hr className="border-gray-800 my-1" />
                      <button 
                        onClick={handleSignOut}
                        className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-space-light/20 rounded-lg transition-colors w-full text-left"
                      >
                        <LogOut size={16} className="mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/auth">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/auth">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white transition-colors"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-space-base/95 backdrop-blur-md shadow-lg border-t border-gray-800">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2 rounded-lg text-base font-medium ${
                  location.pathname === link.path
                    ? 'bg-space-light text-white'
                    : 'text-gray-300 hover:bg-space-light/20 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <hr className="border-gray-800 my-2" />
            
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm text-gray-400">Dark Mode</span>
              <button 
                onClick={toggleDarkMode}
                className="p-2 text-gray-300 hover:text-white transition-colors"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
            
            {!user && (
              <div className="pt-2 flex flex-col space-y-2">
                <Link to="/auth">
                  <Button variant="outline" size="md" className="w-full">Sign In</Button>
                </Link>
                <Link to="/auth">
                  <Button variant="primary" size="md" className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;