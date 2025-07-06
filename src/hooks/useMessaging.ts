import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  status: 'sent' | 'delivered' | 'read';
  reply_to_id?: string;
  edited_at?: string;
  deleted_at?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    username: string;
    avatar_url: string;
  };
  attachments?: MessageAttachment[];
  reply_to?: Message;
}

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_id?: string;
  last_message_at: string;
  participant_1_last_read: string;
  participant_2_last_read: string;
  created_at: string;
  updated_at: string;
  other_participant?: {
    id: string;
    username: string;
    avatar_url: string;
  };
  last_message?: Message;
  unread_count?: number;
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  thumbnail_url?: string;
  created_at: string;
}

export interface UserPresence {
  user_id: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  last_seen: string;
  typing_in_conversation?: string;
  typing_started_at?: string;
  updated_at: string;
}

export const useMessaging = (userId?: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [userPresence, setUserPresence] = useState<Record<string, UserPresence>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant_1_profile:profiles!conversations_participant_1_fkey(id, username, avatar_url),
          participant_2_profile:profiles!conversations_participant_2_fkey(id, username, avatar_url),
          last_message:messages!conversations_last_message_id_fkey(*)
        `)
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const transformedConversations: Conversation[] = (data || []).map(conv => ({
        ...conv,
        other_participant: conv.participant_1 === userId 
          ? conv.participant_2_profile 
          : conv.participant_1_profile,
        unread_count: 0 // Will be calculated separately
      }));

      setConversations(transformedConversations);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load conversations'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, username, avatar_url),
          attachments:message_attachments(*),
          reply_to:messages!messages_reply_to_id_fkey(*)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(prev => ({
        ...prev,
        [conversationId]: data || []
      }));

      // Mark messages as read
      await markMessagesAsRead(conversationId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load messages'));
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    messageType: 'text' | 'image' | 'file' = 'text',
    replyToId?: string,
    attachments?: File[]
  ) => {
    if (!userId) return;

    try {
      // Create the message
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          content,
          message_type: messageType,
          reply_to_id: replyToId
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Handle file attachments
      if (attachments && attachments.length > 0) {
        for (const file of attachments) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${message.id}/${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('message-attachments')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('message-attachments')
            .getPublicUrl(fileName);

          await supabase
            .from('message_attachments')
            .insert({
              message_id: message.id,
              file_name: file.name,
              file_size: file.size,
              file_type: file.type,
              file_url: publicUrl
            });
        }
      }

      return message;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send message'));
      throw err;
    }
  }, [userId]);

  // Create or get conversation
  const createConversation = useCallback(async (otherUserId: string) => {
    if (!userId) return;

    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(participant_1.eq.${userId},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${userId})`)
        .single();

      if (existing) return existing;

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          participant_1: userId,
          participant_2: otherUserId
        })
        .select()
        .single();

      if (error) throw error;

      await loadConversations();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create conversation'));
      throw err;
    }
  }, [userId, loadConversations]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (conversationId: string) => {
    try {
      const { error } = await supabase.rpc('mark_messages_as_read', {
        conversation_uuid: conversationId
      });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  }, []);

  // Update user presence
  const updatePresence = useCallback(async (
    status: 'online' | 'away' | 'busy' | 'offline',
    typingInConversation?: string
  ) => {
    try {
      const { error } = await supabase.rpc('update_user_presence', {
        new_status: status,
        typing_conversation: typingInConversation
      });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to update presence:', err);
    }
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!userId) return;

    // Subscribe to conversations
    const conversationsSubscription = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `participant_1=eq.${userId},participant_2=eq.${userId}`
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    // Subscribe to messages
    const messagesSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => ({
            ...prev,
            [newMessage.conversation_id]: [
              ...(prev[newMessage.conversation_id] || []),
              newMessage
            ]
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages(prev => ({
            ...prev,
            [updatedMessage.conversation_id]: (prev[updatedMessage.conversation_id] || []).map(msg =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          }));
        }
      )
      .subscribe();

    // Subscribe to user presence
    const presenceSubscription = supabase
      .channel('user_presence')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        (payload) => {
          const presence = payload.new as UserPresence;
          setUserPresence(prev => ({
            ...prev,
            [presence.user_id]: presence
          }));
        }
      )
      .subscribe();

    return () => {
      conversationsSubscription.unsubscribe();
      messagesSubscription.unsubscribe();
      presenceSubscription.unsubscribe();
    };
  }, [userId, loadConversations]);

  // Load initial data
  useEffect(() => {
    if (userId) {
      loadConversations();
      updatePresence('online');
    }
  }, [userId, loadConversations, updatePresence]);

  // Update presence on page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (userId) {
        updatePresence(document.hidden ? 'away' : 'online');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [userId, updatePresence]);

  return {
    conversations,
    messages,
    userPresence,
    loading,
    error,
    loadMessages,
    sendMessage,
    createConversation,
    markMessagesAsRead,
    updatePresence
  };
};