import React from 'react';
import { Heart, BookOpen, Bookmark, MessageCircle, UserPlus, Clock } from 'lucide-react';
import { useRealtimeUserData } from '../../hooks/useRealtimeUserData';

interface ActivityFeedProps {
  userId: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ userId }) => {
  const { recentActivity } = useRealtimeUserData(userId);

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'story_read':
        return <BookOpen size={16} className="text-primary-400" />;
      case 'story_liked':
        return <Heart size={16} className="text-accent-400" />;
      case 'story_bookmarked':
        return <Bookmark size={16} className="text-secondary-400" />;
      case 'comment_posted':
        return <MessageCircle size={16} className="text-success-400" />;
      case 'user_followed':
        return <UserPlus size={16} className="text-warning-400" />;
      case 'reading_session_start':
      case 'reading_session_end':
        return <Clock size={16} className="text-primary-400" />;
      default:
        return <BookOpen size={16} className="text-gray-400" />;
    }
  };

  const getActivityMessage = (activity: any) => {
    switch (activity.activity_type) {
      case 'story_read':
        return 'Started reading a story';
      case 'story_liked':
        return 'Liked a story';
      case 'story_bookmarked':
        return 'Bookmarked a story';
      case 'comment_posted':
        return 'Posted a comment';
      case 'user_followed':
        return 'Followed a user';
      case 'reading_session_start':
        return 'Started a reading session';
      case 'reading_session_end':
        const duration = activity.metadata?.duration || 0;
        const minutes = Math.floor(duration / 60);
        return `Finished reading session (${minutes}m)`;
      default:
        return 'Activity recorded';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - activityTime.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  return (
    <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
      <h3 className="text-xl font-display font-semibold text-white mb-4">
        Recent Activity
      </h3>
      
      {recentActivity.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div 
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-space-light/10 hover:bg-space-light/20 transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-space-dark flex items-center justify-center">
                {getActivityIcon(activity.activityType)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">
                  {getActivityMessage(activity)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatTimeAgo(activity.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;