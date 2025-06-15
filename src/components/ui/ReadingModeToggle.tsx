import React, { useState, useEffect } from 'react';
import { Sun, Moon, Volume2, VolumeX, Play, Pause, SkipBack, SkipForward, Settings } from 'lucide-react';
import Button from './Button';

interface Voice {
  id: string;
  name: string;
  accent: string;
  gender: 'male' | 'female' | 'neutral';
  preview: string;
}

interface ReadingModeToggleProps {
  onThemeChange?: (theme: 'light' | 'dark') => void;
  onVoiceChange?: (voice: Voice) => void;
  content?: string;
}

const ReadingModeToggle: React.FC<ReadingModeToggleProps> = ({
  onThemeChange,
  onVoiceChange,
  content = ''
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);
  const [speechVolume, setSpeechVolume] = useState(0.8);

  // Available AI voice models
  const voices: Voice[] = [
    { id: 'neural-sarah', name: 'Sarah', accent: 'American', gender: 'female', preview: 'Hello, I\'m Sarah. I have a warm, friendly voice perfect for storytelling.' },
    { id: 'neural-james', name: 'James', accent: 'British', gender: 'male', preview: 'Good day, I\'m James. My voice carries a distinguished British accent.' },
    { id: 'neural-maria', name: 'Maria', accent: 'Spanish', gender: 'female', preview: 'Hola, soy Maria. I speak with a beautiful Spanish accent.' },
    { id: 'neural-alex', name: 'Alex', accent: 'Canadian', gender: 'neutral', preview: 'Hi there, I\'m Alex. I have a clear, neutral voice that\'s easy to understand.' },
    { id: 'neural-emma', name: 'Emma', accent: 'Australian', gender: 'female', preview: 'G\'day, I\'m Emma. I speak with a cheerful Australian accent.' },
    { id: 'neural-david', name: 'David', accent: 'American', gender: 'male', preview: 'Hello, I\'m David. I have a deep, resonant voice ideal for dramatic readings.' }
  ];

  useEffect(() => {
    // Load saved preferences
    const savedTheme = localStorage.getItem('reading-theme') as 'light' | 'dark' || 'dark';
    const savedVoice = localStorage.getItem('selected-voice');
    const savedRate = localStorage.getItem('speech-rate');
    const savedPitch = localStorage.getItem('speech-pitch');
    const savedVolume = localStorage.getItem('speech-volume');

    setTheme(savedTheme);
    if (savedVoice) {
      const voice = voices.find(v => v.id === savedVoice);
      if (voice) setSelectedVoice(voice);
    } else {
      setSelectedVoice(voices[0]); // Default to first voice
    }
    
    if (savedRate) setSpeechRate(parseFloat(savedRate));
    if (savedPitch) setSpeechPitch(parseFloat(savedPitch));
    if (savedVolume) setSpeechVolume(parseFloat(savedVolume));

    // Apply theme to document
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('reading-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    onThemeChange?.(newTheme);
  };

  const handleVoiceSelect = (voice: Voice) => {
    setSelectedVoice(voice);
    localStorage.setItem('selected-voice', voice.id);
    onVoiceChange?.(voice);
    setShowVoiceSettings(false);
  };

  const playVoicePreview = (voice: Voice) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(voice.preview);
      utterance.rate = speechRate;
      utterance.pitch = speechPitch;
      utterance.volume = speechVolume;
      
      // Try to find a matching system voice
      const systemVoices = window.speechSynthesis.getVoices();
      const matchingVoice = systemVoices.find(v => 
        v.name.toLowerCase().includes(voice.accent.toLowerCase()) ||
        v.lang.includes(voice.accent === 'British' ? 'en-GB' : 
                       voice.accent === 'Australian' ? 'en-AU' :
                       voice.accent === 'Spanish' ? 'es' : 'en-US')
      );
      
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const togglePlayback = () => {
    if (!content) return;

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else {
        const utterance = new SpeechSynthesisUtterance(content);
        utterance.rate = speechRate;
        utterance.pitch = speechPitch;
        utterance.volume = isMuted ? 0 : speechVolume;
        
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        
        window.speechSynthesis.speak(utterance);
      }
      setIsPlaying(true);
    }
  };

  const stopPlayback = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (isPlaying) {
      // Restart with new volume
      stopPlayback();
      setTimeout(togglePlayback, 100);
    }
  };

  const updateSpeechSettings = (setting: string, value: number) => {
    switch (setting) {
      case 'rate':
        setSpeechRate(value);
        localStorage.setItem('speech-rate', value.toString());
        break;
      case 'pitch':
        setSpeechPitch(value);
        localStorage.setItem('speech-pitch', value.toString());
        break;
      case 'volume':
        setSpeechVolume(value);
        localStorage.setItem('speech-volume', value.toString());
        break;
    }
  };

  return (
    <div className="reading-mode-controls">
      {/* Theme Toggle */}
      <div className="theme-toggle-container">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="theme-toggle-btn"
          leftIcon={theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </Button>
      </div>

      {/* Voice Controls */}
      <div className="voice-controls">
        <div className="playback-controls">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {/* Skip backward */}}
            title="Skip backward 10 seconds"
            disabled={!content}
          >
            <SkipBack size={16} />
          </Button>
          
          <Button
            variant={isPlaying ? "secondary" : "primary"}
            size="sm"
            onClick={togglePlayback}
            title={isPlaying ? "Pause reading" : "Start reading"}
            disabled={!content}
            leftIcon={isPlaying ? <Pause size={16} /> : <Play size={16} />}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {/* Skip forward */}}
            title="Skip forward 10 seconds"
            disabled={!content}
          >
            <SkipForward size={16} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            title={isMuted ? "Unmute" : "Mute"}
            leftIcon={isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          />
        </div>

        {/* Voice Settings */}
        <div className="voice-settings-container">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            leftIcon={<Settings size={16} />}
            title="Voice settings"
          >
            Voice: {selectedVoice?.name || 'Select'}
          </Button>

          {showVoiceSettings && (
            <div className="voice-settings-panel">
              <div className="voice-settings-header">
                <h3>Voice Settings</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVoiceSettings(false)}
                >
                  ×
                </Button>
              </div>

              {/* Voice Selection */}
              <div className="voice-selection">
                <h4>Select Voice</h4>
                <div className="voice-grid">
                  {voices.map((voice) => (
                    <div
                      key={voice.id}
                      className={`voice-option ${selectedVoice?.id === voice.id ? 'selected' : ''}`}
                      onClick={() => handleVoiceSelect(voice)}
                    >
                      <div className="voice-info">
                        <span className="voice-name">{voice.name}</span>
                        <span className="voice-accent">{voice.accent} • {voice.gender}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          playVoicePreview(voice);
                        }}
                        leftIcon={<Play size={14} />}
                        title="Preview voice"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Speech Controls */}
              <div className="speech-controls">
                <div className="control-group">
                  <label>Speed: {speechRate.toFixed(1)}x</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => updateSpeechSettings('rate', parseFloat(e.target.value))}
                    className="slider"
                  />
                </div>

                <div className="control-group">
                  <label>Pitch: {speechPitch.toFixed(1)}</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechPitch}
                    onChange={(e) => updateSpeechSettings('pitch', parseFloat(e.target.value))}
                    className="slider"
                  />
                </div>

                <div className="control-group">
                  <label>Volume: {Math.round(speechVolume * 100)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={speechVolume}
                    onChange={(e) => updateSpeechSettings('volume', parseFloat(e.target.value))}
                    className="slider"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReadingModeToggle;