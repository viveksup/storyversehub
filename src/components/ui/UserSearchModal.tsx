import React, { useEffect, useRef } from 'react';
import { Search, X, Users, UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './Button';
import { UserProfile } from '../../hooks/useUserInteractions';

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: UserProfile[];
  searchLoading: boolean;
  onFollowToggle: (userId: string) => Promise<boolean>;
  currentUserId?: string;
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  searchResults,
  searchLoading,
  onFollowToggle,
  currentUserId
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFollowClick = async (e: React.MouseEvent, userId: string) => {
    e.preventDefault();
    e.stopPropagation();
    await onFollowToggle(userId);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-20">
      <div className="bg-space-base rounded-xl w-full max-w-2xl border border-space-light/20 shadow-cosmic">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-space-light/20">
          <h2 className="text-xl font-display font-semibold text-white">
            Search Users
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close search"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-space-light/20">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for users by username..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-space-dark/50 border border-space-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {searchLoading && (
              <Loader2 size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 animate-spin" />
            )}
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {searchQuery.length < 2 ? (
            <div className="p-8 text-center">
              <Users size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400">
                Type at least 2 characters to search for users
              </p>
            </div>
          ) : searchLoading ? (
            <div className="p-8 text-center">
              <Loader2 size={32} className="mx-auto mb-4 text-primary-400 animate-spin" />
              <p className="text-gray-400">Searching users...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center">
              <Users size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400">
                No users found for "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="divide-y divide-space-light/10">
              {searchResults.map((user) => (
                <Link
                  key={user.id}
                  to={`/profile/${user.id}`}
                  onClick={onClose}
                  className="block p-4 hover:bg-space-light/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar_url || 'https://via.placeholder.com/48'}
                        alt={user.username}
                        className="w-12 h-12 rounded-full object-cover border-2 border-space-light/30"
                      />
                      <div>
                        <h3 className="font-medium text-white">
                          {user.username}
                        </h3>
                        {user.bio && (
                          <p className="text-sm text-gray-400 line-clamp-1">
                            {user.bio}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">
                            {user.follower_count || 0} followers
                          </span>
                          <span className="text-xs text-gray-500">
                            {user.following_count || 0} following
                          </span>
                        </div>
                      </div>
                    </div>

                    {currentUserId && user.id !== currentUserId && (
                      <Button
                        variant={user.is_following ? "outline" : "primary"}
                        size="sm"
                        onClick={(e) => handleFollowClick(e, user.id)}
                        leftIcon={
                          user.is_following ? (
                            <UserCheck size={16} />
                          ) : (
                            <UserPlus size={16} />
                          )
                        }
                      >
                        {user.is_following ? 'Following' : 'Follow'}
                      </Button>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-space-light/20 text-center">
          <p className="text-xs text-gray-500">
            Press <kbd className="px-1 py-0.5 bg-space-dark rounded text-xs">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;