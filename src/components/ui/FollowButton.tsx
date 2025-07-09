import React, { useState } from 'react';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import Button from './Button';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  onToggleFollow: (userId: string) => Promise<boolean>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  isFollowing,
  onToggleFollow,
  size = 'md',
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onToggleFollow(userId);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? "outline" : "primary"}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={className}
      leftIcon={
        isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : isFollowing ? (
          <UserCheck size={16} />
        ) : (
          <UserPlus size={16} />
        )
      }
    >
      {isLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
};

export default FollowButton;