import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Heart, MessageCircle, Bookmark, Share2, ArrowLeft,
  Eye, Clock, LogIn, Play, Pause, Volume2, Settings
} from 'lucide-react';
import Button from '../components/ui/Button';
import ReadingModeToggle from '../components/ui/ReadingModeToggle';
import AccessibilityFeatures from '../components/ui/AccessibilityFeatures';
import { mockStories, mockComments } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { useReadingAnalytics } from '../hooks/useReadingAnalytics';

const StoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState(mockStories.find(s => s.id === id));
  const [isReading, setIsReading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [comments, setComments] = useState(mockComments.filter(c => c.storyId === id));
  const [user, setUser] = useState<any>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState(0);

  const {
    analytics,
    currentSession,
    isTracking,
    startReadingSession,
    updateReadingProgress,
    endReadingSession
  } = useReadingAnalytics(user?.id);

  // Sample story content for demonstration
  const storyContent = `
    In the vast expanse of the cosmos, where stars whispered ancient secrets and nebulae painted the void with colors beyond human comprehension, Dr. Elara Voss stood at the precipice of discovery. The Quantum Nexus project—her life's work—hummed with anticipation in the laboratory behind her.

    The facility, buried deep beneath the Swiss Alps, housed the most advanced quantum computing array ever constructed. Its crystalline cores pulsed with an ethereal blue light, each pulse representing billions of calculations that pushed the boundaries of known physics.

    "Dr. Voss," called her assistant, Marcus Chen, his voice echoing through the cavernous chamber. "The quantum entanglement readings are off the charts. We're seeing correlations that shouldn't be possible."

    Elara turned from the observation window, her reflection ghostlike against the backdrop of swirling energy patterns. At forty-two, she had dedicated her entire career to understanding the fundamental nature of reality itself. Her dark hair, streaked with premature silver from years of intense research, was pulled back in a practical ponytail. Her eyes, a striking green that seemed to hold depths of their own, focused intently on the data streaming across the holographic displays.

    "Show me," she said, her voice steady despite the excitement building within her chest.

    Marcus gestured to the main display, where impossible patterns danced in three-dimensional space. "The particles aren't just entangled across space—they're showing temporal correlations. It's as if they're communicating across time itself."

    The implications hit Elara like a physical force. If particles could indeed maintain quantum entanglement across temporal boundaries, it would revolutionize not just physics, but humanity's understanding of causality, free will, and the very nature of existence.

    "Run the simulation again," she commanded, her scientific training warring with the part of her that wanted to believe they had stumbled upon something miraculous. "And this time, increase the temporal variance by a factor of ten."

    As the quantum cores spun up to full power, the air itself seemed to thicken with possibility. The boundary between the known and unknown had never felt thinner, and Dr. Elara Voss was about to step across it into a realm where the impossible became inevitable.
  `;

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

  useEffect(() => {
    setStory(mockStories.find(s => s.id === id));
    setComments(mockComments.filter(c => c.storyId === id));
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    // Start reading session when user begins reading
    if (user && story && !currentSession) {
      startReadingSession(story.id);
    }
  }, [user, story, currentSession, startReadingSession]);

  useEffect(() => {
    // Calculate estimated time left based on reading progress and speed
    if (story && analytics.averageReadingSpeed > 0) {
      const totalWords = storyContent.split(/\s+/).length;
      const wordsLeft = totalWords * (1 - readingProgress / 100);
      const timeLeft = Math.ceil(wordsLeft / analytics.averageReadingSpeed);
      setEstimatedTimeLeft(timeLeft);
    }
  }, [readingProgress, analytics.averageReadingSpeed, story]);

  const handleReadingProgress = (progress: number) => {
    setReadingProgress(progress);
    
    if (currentSession && isTracking) {
      const totalWords = storyContent.split(/\s+/).length;
      const wordsRead = Math.floor((progress / 100) * totalWords);
      updateReadingProgress(wordsRead);
    }
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    console.log(`Theme changed to: ${theme}`);
  };

  const handleVoiceChange = (voice: any) => {
    console.log(`Voice changed to: ${voice.name}`);
  };

  const toggleReadListen = () => {
    if (!user) return;
    
    if (isListening) {
      setIsListening(false);
      setIsReading(true);
    } else {
      setIsListening(true);
      setIsReading(false);
    }
  };

  if (!story) {
    return (
      <div className="min-h-screen bg-space-dark flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-display font-semibold text-white mb-4">Story not found</h2>
          <Link to="/explore">
            <Button variant="primary">Explore Stories</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-dark pt-16" id="main-content">
      {/* Accessibility Features */}
      <AccessibilityFeatures />

      {/* Story Header */}
      <div 
        className="relative h-[50vh] bg-cover bg-center flex items-end"
        style={{ backgroundImage: `url(${story.coverImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-space-dark via-space-dark/70 to-transparent"></div>
        
        <Link to="/explore" className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft size={18} />}
            className="bg-space-base/80 hover:bg-space-light/80"
          >
            Back to Stories
          </Button>
        </Link>
        
        <div className="container mx-auto px-4 relative z-10 pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between">
            <div>
              <p className="text-primary-400 text-sm font-medium mb-1">{story.category}</p>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                {story.title}
              </h1>
              <p className="text-gray-300">By {story.author} • {new Date(story.createdAt).toLocaleDateString()}</p>
              
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center text-gray-400 text-sm">
                  <Eye size={16} className="mr-1" />
                  {story.views} views
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <Clock size={16} className="mr-1" />
                  {story.readTime} min read
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <Heart size={16} className="mr-1 text-accent-400" />
                  {story.likes} likes
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="hidden md:flex items-center space-x-3 mt-4 md:mt-0">
              {user ? (
                <>
                  <Button 
                    variant="outline"
                    size="sm"
                    leftIcon={<Heart size={16} />}
                    aria-label="Like this story"
                  >
                    Like
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    leftIcon={<Bookmark size={16} />}
                    aria-label="Bookmark this story"
                  >
                    Save
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    leftIcon={<Share2 size={16} />}
                    aria-label="Share this story"
                  >
                    Share
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button 
                    variant="primary"
                    size="sm"
                    leftIcon={<LogIn size={16} />}
                  >
                    Sign In to Interact
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reading Progress Bar */}
      <div className="sticky top-16 z-20 bg-space-base/95 backdrop-blur-sm border-b border-space-light/20">
        <div className="h-1 bg-space-light/30">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300"
            style={{ width: `${readingProgress}%` }}
          ></div>
        </div>
        
        {/* Reading Stats */}
        {user && currentSession && (
          <div className="container mx-auto px-4 py-2">
            <div className="flex justify-between items-center text-sm text-gray-400">
              <div className="flex items-center gap-4">
                <span>Progress: {Math.round(readingProgress)}%</span>
                <span>Time left: ~{estimatedTimeLeft} min</span>
                {isTracking && (
                  <span className="text-primary-400">
                    • Reading session active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>Reading speed: {analytics.averageReadingSpeed} WPM</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reading Mode Toggle */}
      {user && (
        <div className="container mx-auto px-4 py-4">
          <ReadingModeToggle
            onThemeChange={handleThemeChange}
            onVoiceChange={handleVoiceChange}
            content={storyContent}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Reading Mode Selector */}
          {user && (
            <div className="flex justify-center mb-6">
              <div className="bg-space-base rounded-lg p-1 border border-space-light/20">
                <div className="flex">
                  <Button
                    variant={isReading ? "primary" : "ghost"}
                    size="sm"
                    leftIcon={<Eye size={16} />}
                    onClick={() => { setIsReading(true); setIsListening(false); }}
                    className="rounded-r-none"
                  >
                    Read
                  </Button>
                  <Button
                    variant={isListening ? "primary" : "ghost"}
                    size="sm"
                    leftIcon={<Volume2 size={16} />}
                    onClick={toggleReadListen}
                    className="rounded-l-none"
                  >
                    Listen
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Story Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            {isReading ? (
              <div 
                className="story-content"
                onScroll={(e) => {
                  const element = e.target as HTMLDivElement;
                  const scrollTop = element.scrollTop;
                  const scrollHeight = element.scrollHeight - element.clientHeight;
                  const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
                  handleReadingProgress(progress);
                }}
              >
                <p className="text-xl font-medium text-gray-300 mb-6">
                  {story.excerpt}
                </p>
                
                <div className="space-y-6">
                  {storyContent.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-gray-200 leading-relaxed">
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="audio-mode flex flex-col items-center justify-center py-12">
                <div className="bg-space-base rounded-2xl p-8 border border-space-light/20 max-w-md w-full">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-primary-500">
                      <img 
                        src={story.coverImage} 
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <h3 className="text-xl font-display font-semibold text-white mb-2">
                      {story.title}
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Narrated by AI Voice
                    </p>
                    
                    <div className="flex justify-center items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Previous chapter"
                      >
                        ⏮
                      </Button>
                      
                      <Button
                        variant="primary"
                        size="lg"
                        leftIcon={<Play size={20} />}
                        aria-label="Play story"
                      >
                        Play
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Next chapter"
                      >
                        ⏭
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="mt-12 border-t border-gray-800 pt-8">
            <h3 className="text-xl font-display font-semibold text-white mb-6">
              Comments ({comments.length})
            </h3>
            
            {user ? (
              <>
                {/* Comment Form */}
                <div className="mb-8">
                  <textarea 
                    placeholder="Share your thoughts on this story..."
                    className="w-full p-4 bg-space-base border border-space-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    rows={3}
                    aria-label="Write a comment"
                  ></textarea>
                  <div className="mt-3 flex justify-end">
                    <Button variant="primary" size="sm">
                      Post Comment
                    </Button>
                  </div>
                </div>
                
                {/* Comments List */}
                <div className="space-y-6">
                  {comments.map(comment => (
                    <article key={comment.id} className="bg-space-base p-6 rounded-lg border border-space-light/10">
                      <div className="flex items-start">
                        <img 
                          src={comment.userAvatar} 
                          alt={`${comment.userName}'s avatar`}
                          className="w-12 h-12 rounded-full object-cover mr-4"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-white">{comment.userName}</h4>
                            <time className="text-gray-500 text-sm">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </time>
                          </div>
                          <p className="text-gray-300 mb-3">{comment.content}</p>
                          <div className="flex items-center space-x-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<Heart size={14} />}
                              className="text-gray-400 hover:text-accent-400"
                              aria-label={`Like comment by ${comment.userName}`}
                            >
                              {comment.likes}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<MessageCircle size={14} />}
                              className="text-gray-400 hover:text-white"
                              aria-label={`Reply to ${comment.userName}`}
                            >
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">Sign in to read and post comments</p>
                <Link to="/auth">
                  <Button 
                    variant="primary"
                    size="lg"
                    leftIcon={<LogIn size={18} />}
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryPage;