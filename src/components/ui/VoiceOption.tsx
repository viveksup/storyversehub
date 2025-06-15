import React, { useState } from 'react';
import { VoiceOption as VoiceOptionType } from '../../types';
import { Play, Pause, Lock } from 'lucide-react';

interface VoiceOptionProps {
  voice: VoiceOptionType;
  isSelected: boolean;
  onSelect: (voiceId: string) => void;
  isPremiumUser: boolean;
}

const VoiceOption: React.FC<VoiceOptionProps> = ({ 
  voice, 
  isSelected, 
  onSelect,
  isPremiumUser
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { id, name, sample, isPremium } = voice;
  
  const handlePlaySample = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would play/pause the audio sample
  };
  
  const isLocked = isPremium && !isPremiumUser;
  
  return (
    <div 
      className={`
        flex items-center justify-between p-4 rounded-xl transition-all duration-200
        ${isSelected 
          ? 'bg-space-light border-2 border-secondary-500 shadow-neon' 
          : 'bg-space-base hover:bg-space-light/60 border-2 border-transparent'
        }
        ${isLocked ? 'opacity-70' : ''}
      `}
    >
      <div className="flex items-center">
        <button
          onClick={handlePlaySample}
          disabled={isLocked}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center
            ${isLocked 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-secondary-600 text-white hover:bg-secondary-500'
            }
          `}
          aria-label={isPlaying ? 'Pause sample' : 'Play sample'}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        
        <div className="ml-4">
          <div className="flex items-center">
            <h4 className="font-medium text-white">{name}</h4>
            {isPremium && (
              <span className="ml-2 bg-accent-700 text-xs px-2 py-0.5 rounded-full text-white">Premium</span>
            )}
          </div>
          
          {/* Audio visualization (placeholder) */}
          {isPlaying && (
            <div className="mt-1 flex items-center space-x-1">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i}
                  className="w-1 bg-secondary-400 rounded-full animate-pulse"
                  style={{ 
                    height: `${Math.random() * 12 + 4}px`,
                    animationDelay: `${i * 0.1}s` 
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center">
        {isLocked ? (
          <div className="text-gray-500 flex items-center mr-2">
            <Lock size={14} className="mr-1" />
            <span className="text-xs">Premium only</span>
          </div>
        ) : (
          <button
            onClick={() => onSelect(id)}
            disabled={isLocked}
            className={`
              p-2 rounded-full transition-colors
              ${isSelected 
                ? 'bg-secondary-600 text-white' 
                : 'bg-transparent text-gray-400 hover:text-white hover:bg-secondary-700'
              }
            `}
            aria-label={isSelected ? 'Selected voice' : 'Select voice'}
          >
            <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center">
              {isSelected && <div className="w-2 h-2 rounded-full bg-current"></div>}
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceOption;