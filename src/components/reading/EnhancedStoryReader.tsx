import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Headphones, Settings, Eye } from 'lucide-react';
import Button from '../ui/Button';
import ReadingModeToggle from '../ui/ReadingModeToggle';
import { mockStories } from '../../data/mockData';

interface ReadingProgress {
  currentPosition: number;
  totalWords: number;
  readingTime: number;
  wordsPerMinute: number;
}

const EnhancedStoryReader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState(mockStories.find(s => s.id === id));
  const [readingMode, setReadingMode] = useState<'text' | 'audio'>('text');
  const [readingProgress, setReadingProgress] = useState<ReadingProgress>({
    currentPosition: 0,
    totalWords: 0,
    readingTime: 0,
    wordsPerMinute: 200
  });
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [showSettings, setShowSettings] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

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

    The readings stabilized, and what they revealed would change everything. The particles weren't just communicating across time—they were creating a bridge, a nexus point where past, present, and future converged into a single, shimmering moment of infinite potential.

    "My God," Marcus whispered, his face pale in the blue glow of the quantum field. "Elara, what have we done?"

    But Dr. Voss was already reaching for the controls, her fingers dancing across the interface with practiced precision. She had spent her entire life preparing for this moment, though she had never dared to imagine it would actually arrive.

    "We've opened a door," she said softly, her voice filled with wonder and trepidation in equal measure. "The question now is: what's waiting on the other side?"
  `;

  useEffect(() => {
    if (story && contentRef.current) {
      const words = storyContent.split(/\s+/).length;
      setReadingProgress(prev => ({
        ...prev,
        totalWords: words
      }));
    }
  }, [story, storyContent]);

  useEffect(() => {
    // Track reading progress
    const handleScroll = () => {
      if (contentRef.current && progressRef.current) {
        const element = contentRef.current;
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight - element.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        
        progressRef.current.style.width = `${progress}%`;
        
        // Estimate current position in words
        const currentWords = Math.floor((progress / 100) * readingProgress.totalWords);
        setReadingProgress(prev => ({
          ...prev,
          currentPosition: currentWords
        }));
      }
    };

    const element = contentRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, [readingProgress.totalWords]);

  const handleThemeChange = (theme: 'light' | 'dark') => {
    // Theme change is handled by the ReadingModeToggle component
    console.log(`Theme changed to: ${theme}`);
  };

  const handleVoiceChange = (voice: any) => {
    console.log(`Voice changed to: ${voice.name}`);
  };

  const adjustFontSize = (delta: number) => {
    setFontSize(prev => Math.max(12, Math.min(24, prev + delta)));
  };

  const adjustLineHeight = (delta: number) => {
    setLineHeight(prev => Math.max(1.2, Math.min(2.0, prev + delta)));
  };

  if (!story) {
    return (
      <div className="min-h-screen bg-space-dark flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-display font-semibold text-white mb-4">Story not found</h2>
          <Button variant="primary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-story-reader">
      {/* Header */}
      <div className="reader-header">
        <div className="header-left">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft size={18} />}
            onClick={() => window.history.back()}
          >
            Back
          </Button>
          <div className="story-info">
            <h1 className="story-title">{story.title}</h1>
            <p className="story-author">By {story.author}</p>
          </div>
        </div>
        
        <div className="header-right">
          <div className="reading-mode-selector">
            <Button
              variant={readingMode === 'text' ? 'primary' : 'ghost'}
              size="sm"
              leftIcon={<BookOpen size={16} />}
              onClick={() => setReadingMode('text')}
            >
              Read
            </Button>
            <Button
              variant={readingMode === 'audio' ? 'primary' : 'ghost'}
              size="sm"
              leftIcon={<Headphones size={16} />}
              onClick={() => setReadingMode('audio')}
            >
              Listen
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Settings size={16} />}
            onClick={() => setShowSettings(!showSettings)}
          >
            Settings
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="reading-progress-bar">
        <div ref={progressRef} className="progress-fill"></div>
      </div>

      {/* Reading Mode Toggle */}
      <ReadingModeToggle
        onThemeChange={handleThemeChange}
        onVoiceChange={handleVoiceChange}
        content={storyContent}
      />

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel">
          <div className="settings-header">
            <h3>Reading Settings</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(false)}
            >
              ×
            </Button>
          </div>
          
          <div className="settings-content">
            <div className="setting-group">
              <label>Font Size: {fontSize}px</label>
              <div className="setting-controls">
                <Button size="sm" onClick={() => adjustFontSize(-1)}>-</Button>
                <Button size="sm" onClick={() => adjustFontSize(1)}>+</Button>
              </div>
            </div>
            
            <div className="setting-group">
              <label>Line Height: {lineHeight.toFixed(1)}</label>
              <div className="setting-controls">
                <Button size="sm" onClick={() => adjustLineHeight(-0.1)}>-</Button>
                <Button size="sm" onClick={() => adjustLineHeight(0.1)}>+</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="reader-content">
        {readingMode === 'text' ? (
          <div 
            ref={contentRef}
            className="text-content"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: lineHeight
            }}
          >
            <div className="story-text">
              {storyContent.split('\n\n').map((paragraph, index) => (
                <p key={index} className="story-paragraph">
                  {paragraph.trim()}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <div className="audio-content">
            <div className="audio-player">
              <div className="audio-cover">
                <img src={story.coverImage} alt={story.title} />
              </div>
              <div className="audio-info">
                <h3>{story.title}</h3>
                <p>Narrated by AI Voice</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reading Stats */}
      <div className="reading-stats">
        <div className="stat-item">
          <span className="stat-label">Progress</span>
          <span className="stat-value">
            {readingProgress.currentPosition} / {readingProgress.totalWords} words
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Reading Time</span>
          <span className="stat-value">
            {Math.ceil((readingProgress.totalWords - readingProgress.currentPosition) / readingProgress.wordsPerMinute)} min left
          </span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStoryReader;