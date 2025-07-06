import React, { useState, useEffect } from 'react';
import { Bell, X, MessageCircle, Check } from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';

interface MessageNotification {
  id: string;
  user_id: string;
  message_id: string;
  notification_type: 'message' | 'mention' | 'system';
  is_read: boolean;
  sent_email: boolean;
  sent_push: boolean;
  created_at: string;
  message?: {
    id: string;
    content: string;
    sender: {
      id: string;
      username: string;
      avatar_url: string;
    };
    conversation: {
      id: string;
    };
  };
}

interface MessageNotificationsProps {
  userId: string;
  onNotificationClick?: (conversationId: string) => void;
}

const MessageNotifications: React.FC<MessageNotificationsProps> = ({
  userId,
  onNotificationClick
}) => {
  const [notifications, setNotifications] = useState<MessageNotification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    setupRealtimeSubscription();
  }, [userId]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('message_notifications')
        .select(`
          *,
          message:messages(
            id,
            content,
            sender:profiles!messages_sender_id_fkey(id, username, avatar_url),
            conversation:conversations!messages_conversation_id_fkey(id)
          )
        `)
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('message_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotification = payload.new as MessageNotification;
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            showBrowserNotification(newNotification);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'message_notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const updatedNotification = payload.new as MessageNotification;
          setNotifications(prev =>
            prev.map(notif =>
              notif.id === updatedNotification.id ? updatedNotification : notif
            )
          );
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const showBrowserNotification = (notification: MessageNotification) => {
    if (!notification.message) return;

    const title = `New message from ${notification.message.sender.username}`;
    const body = notification.message.content || 'Sent an attachment';
    const icon = notification.message.sender.avatar_url || '/default-avatar.png';

    const browserNotification = new Notification(title, {
      body,
      icon,
      tag: notification.message.conversation.id // Prevent duplicate notifications
    });

    browserNotification.onclick = () => {
      window.focus();
      if (onNotificationClick) {
        onNotificationClick(notification.message!.conversation.id);
      }
      browserNotification.close();
    };

    // Auto-close after 5 seconds
    setTimeout(() => {
      browserNotification.close();
    }, 5000);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('message_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('message_notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications([]);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification: MessageNotification) => {
    if (notification.message && onNotificationClick) {
      onNotificationClick(notification.message.conversation.id);
      markAsRead(notification.id);
      setShowDropdown(false);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-space-base border border-space-light/30 rounded-xl shadow-cosmic z-50">
          <div className="p-4 border-b border-space-light/20">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-white">Message Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDropdown(false)}
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p>No new notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="p-4 border-b border-space-light/10 hover:bg-space-light/20 cursor-pointer transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={notification.message?.sender.avatar_url || 'https://via.placeholder.com/32'}
                      alt={notification.message?.sender.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white">
                          {notification.message?.sender.username}
                        </p>
                        <span className="text-xs text-gray-400">
                          {new Date(notification.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-300 truncate">
                        {notification.message?.content || 'Sent an attachment'}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-primary-400">
                          {notification.notification_type === 'message' ? 'New message' : 
                           notification.notification_type === 'mention' ? 'Mentioned you' : 
                           'System notification'}
                        </span>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Check size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-space-light/20 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowDropdown(false);
                  // Navigate to full messages page
                }}
                className="text-primary-400 hover:text-primary-300"
              >
                View all messages
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageNotifications;