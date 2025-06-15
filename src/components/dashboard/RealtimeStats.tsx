import React from 'react';
import { Clock, BookOpen, Target, TrendingUp, Activity } from 'lucide-react';
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
      {/* Online Status */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
        <span className="text-gray-400">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Current Reading Session */}
      {currentReadingSession && (
        <div className="bg-space-light/20 rounded-xl p-4 border border-primary-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} className="text-primary-400" />
            <span className="text-sm font-medium text-white">Currently Reading</span>
          </div>
          <div className="text-xs text-gray-400">
            Session: {Math.floor(currentReadingSession.duration / 60)}m {currentReadingSession.duration % 60}s
          </div>
          <div className="text-xs text-gray-400">
            Progress: {currentReadingSession.progressPercentage}%
          </div>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-4 border border-space-light/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-space-light/30 rounded-lg text-primary-400">
              <BookOpen size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Stories Read</p>
              <p className="text-xl font-display font-bold text-white">
                {userStats.totalStoriesRead}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-4 border border-space-light/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-space-light/30 rounded-lg text-secondary-400">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Reading Time</p>
              <p className="text-xl font-display font-bold text-white">
                {formatReadingTime(userStats.totalReadingTime)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-4 border border-space-light/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-space-light/30 rounded-lg text-accent-400">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Reading Streak</p>
              <p className="text-xl font-display font-bold text-white">
                {userStats.currentStreak} days
              </p>
            </div>
          </div>
        </div>

        <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-4 border border-space-light/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-space-light/30 rounded-lg text-success-400">
              <Target size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Weekly Goal</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-display font-bold text-white">
                  {Math.round(userStats.weeklyProgress)}%
                </p>
                <div className="flex-1 h-2 bg-space-dark rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-success-500 rounded-full transition-all duration-500"
                    style={{ width: `${userStats.weeklyProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Favorite Genres */}
      <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-4 border border-space-light/20">
        <h3 className="text-sm font-medium text-white mb-3">Favorite Genres</h3>
        <div className="flex flex-wrap gap-2">
          {userStats.favoriteGenres.map((genre, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-primary-600/20 text-primary-400 rounded-full text-xs"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>

      {/* Reading Speed */}
      <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-4 border border-space-light/20">
        <h3 className="text-sm font-medium text-white mb-2">Reading Speed</h3>
        <p className="text-2xl font-display font-bold text-primary-400">
          {userStats.readingSpeed} <span className="text-sm text-gray-400">WPM</span>
        </p>
      </div>
    </div>
  );
};

export default RealtimeStats;