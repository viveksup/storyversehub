import React from 'react';
import { Heart, BookOpen, Bookmark, MessageCircle, UserPlus, Clock, Activity, TrendingUp } from 'lucide-react';
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
    <div className="bg-space-base/50 backdrop-blur-sm rounded-xl border border-space-light/20 overflow-hidden">
      <div className="p-6 border-b border-space-light/20">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-display font-semibold text-white flex items-center gap-2">
            <Activity size={20} className="text-success-400" />
            Recent Activity
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <TrendingUp size={14} />
            <span>Last 7 days</span>
          </div>
        </div>
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        {recentActivity.length === 0 ? (
          <div className="text-center py-12">
            <Activity size={48} className="mx-auto mb-4 text-gray-400 opacity-50" />
            <p className="text-gray-400">No recent activity</p>
            <p className="text-sm text-gray-500 mt-1">Start reading stories to see your activity here</p>
          </div>
        ) : (
          <div className="divide-y divide-space-light/10">
            {recentActivity.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-start gap-4 p-4 hover:bg-space-light/10 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-space-dark flex items-center justify-center border border-space-light/30">
                  {getActivityIcon(activity.activityType)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">
                    {getActivityMessage(activity)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTimeAgo(activity.createdAt)}
                  </p>
                </div>
                
                <div className="text-xs text-gray-500">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;