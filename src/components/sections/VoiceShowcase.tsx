import React, { useState } from 'react';
import VoiceOption from '../ui/VoiceOption';
import { mockVoiceOptions } from '../../data/mockData';
import { Headphones, Volume2, Sparkles } from 'lucide-react';
import Button from '../ui/Button';

const VoiceShowcase: React.FC = () => {
  const [selectedVoice, setSelectedVoice] = useState(mockVoiceOptions[0].id);
  const [isPremiumUser] = useState(true); // Simulating a premium user
  
  return (
    <section className="py-20 bg-cosmic-gradient relative overflow-hidden">
      {/* Background shape */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
        <svg viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg">
          <path 
            fill="none" 
            stroke="url(#grad1)" 
            strokeWidth="5"
            d="M0,400 C200,500 400,100 600,400 C800,650 1000,50 1200,300"
          ></path>
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6f5cd4" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Visualization Section */}
          <div className="w-full lg:w-1/2 order-2 lg:order-1">
            <div className="bg-space-base/50 backdrop-blur-md p-8 rounded-2xl border border-secondary-500/30 shadow-cosmic">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-secondary-600/50 flex items-center justify-center">
                  <Headphones size={24} className="text-white" />
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-semibold text-white">Voice Preview</h4>
                  <p className="text-gray-400 text-sm">
                    {mockVoiceOptions.find(v => v.id === selectedVoice)?.name || 'Select a voice'}
                  </p>
                </div>
              </div>
              
              {/* Audio Waveform (placeholder) */}
              <div className="w-full h-28 bg-space-dark rounded-lg overflow-hidden flex items-center justify-center p-4 mb-6">
                <div className="flex items-end justify-center space-x-1 h-full w-full">
                  {[...Array(100)].map((_, i) => (
                    <div 
                      key={i}
                      className="w-1 bg-secondary-400 rounded-full animate-pulse"
                      style={{ 
                        height: `${Math.abs(Math.sin(i * 0.2)) * 80 + 20}%`,
                        animationDelay: `${i * 0.01}s`,
                        opacity: Math.random() * 0.5 + 0.5
                      }}
                    ></div>
                  ))}
                </div>
              </div>
              
              {/* Audio Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button className="w-12 h-12 rounded-full bg-secondary-600 hover:bg-secondary-500 text-white flex items-center justify-center transition-colors">
                    <Volume2 size={20} />
                  </button>
                  <div className="flex-1 h-2 bg-space-dark rounded-full overflow-hidden">
                    <div className="h-full bg-secondary-500" style={{ width: '40%' }}></div>
                  </div>
                </div>
                
                <Button 
                  variant="secondary" 
                  size="sm"
                  leftIcon={<Sparkles size={14} />}
                >
                  Try with your story
                </Button>
              </div>
            </div>
          </div>
          
          {/* Text Content */}
          <div className="w-full lg:w-1/2 order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Voices That Bring Stories to Life
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Our advanced AI narration makes your stories sound like they're read by professional voice actors. Choose from a variety of voices or unlock premium options for the ultimate listening experience.
            </p>
            
            {/* Voice Options */}
            <div className="space-y-4">
              {mockVoiceOptions.slice(0, 4).map(voice => (
                <VoiceOption 
                  key={voice.id}
                  voice={voice}
                  isSelected={selectedVoice === voice.id}
                  onSelect={setSelectedVoice}
                  isPremiumUser={isPremiumUser}
                />
              ))}
            </div>
            
            <div className="mt-6">
              <Button 
                variant="outline" 
                size="md"
                className="w-full"
              >
                Explore All Voice Options
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VoiceShowcase;