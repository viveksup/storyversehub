import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageCircle, Users, Search, Plus } from 'lucide-react';
import MessagingInterface from '../components/messaging/MessagingInterface';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';

const MessagesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [searchUsers, setSearchUsers] = useState('');
  const [foundUsers, setFoundUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const conversationId = searchParams.get('conversation');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchForUsers = async (query: string) => {
    if (!query.trim()) {
      setFoundUsers([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${query}%`)
        .neq('id', user?.id)
        .limit(10);

      if (error) throw error;
      setFoundUsers(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchForUsers(searchUsers);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchUsers, user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-space-dark pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-space-dark pt-20 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle size={64} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-display font-semibold text-white mb-4">
            Sign in to access messages
          </h2>
          <p className="text-gray-400 mb-6">
            Connect with other users and start conversations
          </p>
          <Button variant="primary" onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-dark pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-white mb-2">
                Messages
              </h1>
              <p className="text-gray-400">
                Connect and communicate with other users in real-time
              </p>
            </div>
            
            <Button
              variant="primary"
              leftIcon={<Plus size={18} />}
              onClick={() => setShowNewConversation(true)}
            >
              New Conversation
            </Button>
          </div>

          {/* New Conversation Modal */}
          {showNewConversation && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-space-base rounded-xl p-6 w-full max-w-md border border-space-light/20">
                <h3 className="text-lg font-display font-semibold text-white mb-4">
                  Start New Conversation
                </h3>
                
                <div className="relative mb-4">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for users..."
                    value={searchUsers}
                    onChange={(e) => setSearchUsers(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-space-dark/50 border border-space-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Search Results */}
                <div className="max-h-60 overflow-y-auto mb-4">
                  {foundUsers.length === 0 && searchUsers ? (
                    <p className="text-gray-400 text-center py-4">No users found</p>
                  ) : (
                    foundUsers.map((foundUser) => (
                      <div
                        key={foundUser.id}
                        onClick={() => {
                          // Create conversation and navigate
                          setShowNewConversation(false);
                          setSearchUsers('');
                          setFoundUsers([]);
                        }}
                        className="flex items-center space-x-3 p-3 hover:bg-space-light/20 rounded-lg cursor-pointer transition-colors"
                      >
                        <img
                          src={foundUser.avatar_url || 'https://via.placeholder.com/40'}
                          alt={foundUser.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-medium text-white">{foundUser.username}</h4>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNewConversation(false);
                      setSearchUsers('');
                      setFoundUsers([]);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Messaging Interface */}
          <div className="bg-space-base/50 backdrop-blur-sm rounded-xl border border-space-light/20 overflow-hidden">
            <MessagingInterface
              userId={user.id}
              initialConversationId={conversationId || undefined}
            />
          </div>

          {/* Features Info */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-space-base/50 rounded-xl p-6 border border-space-light/20">
              <div className="w-12 h-12 bg-primary-600/30 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle size={24} className="text-primary-400" />
              </div>
              <h3 className="text-lg font-display font-semibold text-white mb-2">
                Real-time Messaging
              </h3>
              <p className="text-gray-400">
                Send and receive messages instantly with real-time delivery and read receipts.
              </p>
            </div>

            <div className="bg-space-base/50 rounded-xl p-6 border border-space-light/20">
              <div className="w-12 h-12 bg-secondary-600/30 rounded-lg flex items-center justify-center mb-4">
                <Users size={24} className="text-secondary-400" />
              </div>
              <h3 className="text-lg font-display font-semibold text-white mb-2">
                User Presence
              </h3>
              <p className="text-gray-400">
                See when users are online, away, or busy with real-time presence indicators.
              </p>
            </div>

            <div className="bg-space-base/50 rounded-xl p-6 border border-space-light/20">
              <div className="w-12 h-12 bg-accent-600/30 rounded-lg flex items-center justify-center mb-4">
                <Search size={24} className="text-accent-400" />
              </div>
              <h3 className="text-lg font-display font-semibold text-white mb-2">
                Message Search
              </h3>
              <p className="text-gray-400">
                Find any message or conversation quickly with our powerful search functionality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;