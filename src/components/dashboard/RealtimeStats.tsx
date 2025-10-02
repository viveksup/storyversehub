import React from 'react';
import { Clock, BookOpen, Target, TrendingUp, Activity, Zap, Eye, Heart } from 'lucide-react';
import { useRealtimeUserData } from '../../hooks/useRealtimeUserData';

interface RealtimeStatsProps {
  userId: string;
}

const RealtimeStats: React.FC<RealtimeStatsProps> = ({ userId }) => {
  const { userStats, isOnline, currentReadingSession } = useRealtimeUserData(userId);

  const formatReadingTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-4 border border-space-light/20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-display font-semibold text-white">Status</h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
            <span className="text-sm text-gray-400">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        
        {currentReadingSession && (
          <div className="bg-primary-900/20 rounded-lg p-3 border border-primary-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className="text-primary-400" />
              <span className="text-sm font-medium text-white">Currently Reading</span>
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <div>Session: {Math.floor(currentReadingSession.duration / 60)}m {currentReadingSession.duration % 60}s</div>
              <div>Progress: {currentReadingSession.progressPercentage}%</div>
            </div>
          </div>
        )}
      </div>

      {/* Personal Insights */}
      <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-4 border border-space-light/20">
        <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
          <Zap size={20} className="text-warning-400" />
          Your Insights
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-primary-400" />
              <span className="text-sm text-gray-400">Reading Speed</span>
            </div>
            <span className="text-white font-semibold">
              {userStats.readingSpeed} WPM
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-secondary-400" />
              <span className="text-sm text-gray-400">Avg Session</span>
            </div>
            <span className="text-white font-semibold">
              {Math.floor(userStats.totalReadingTime / Math.max(userStats.totalStoriesRead, 1))}m
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-accent-400" />
              <span className="text-sm text-gray-400">Favorite Time</span>
            </div>
            <span className="text-white font-semibold">
              {userStats.readingPatterns.preferredTimeOfDay}
            </span>
          </div>
        </div>
      </div>

      {/* Favorite Genres */}
      <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-4 border border-space-light/20">
        <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
          <Star size={20} className="text-accent-400" />
          Favorite Genres
        </h3>
        <div className="flex flex-wrap gap-2">
          {userStats.favoriteGenres.map((genre, index) => (
            <span 
              key={index}
              className="px-3 py-1.5 bg-primary-600/20 text-primary-400 rounded-full text-sm font-medium"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RealtimeStats;