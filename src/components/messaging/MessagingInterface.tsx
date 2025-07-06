import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Paperclip, Smile, MoreVertical, Search, 
  Phone, Video, Info, ArrowLeft, Check, CheckCheck,
  Image, File, X, Reply, Edit, Trash2
} from 'lucide-react';
import Button from '../ui/Button';
import { useMessaging, Conversation, Message } from '../../hooks/useMessaging';
import { supabase } from '../../lib/supabase';

interface MessagingInterfaceProps {
  userId: string;
  initialConversationId?: string;
  onClose?: () => void;
}

const MessagingInterface: React.FC<MessagingInterfaceProps> = ({
  userId,
  initialConversationId,
  onClose
}) => {
  const {
    conversations,
    messages,
    userPresence,
    loading,
    sendMessage,
    loadMessages,
    createConversation,
    updatePresence
  } = useMessaging(userId);

  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    initialConversationId || null
  );
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConversation]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation, loadMessages]);

  // Handle typing indicators
  useEffect(() => {
    if (messageInput && selectedConversation && !isTyping) {
      setIsTyping(true);
      updatePresence('online', selectedConversation);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        updatePresence('online');
      }
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messageInput, selectedConversation, isTyping, updatePresence]);

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && attachments.length === 0) || !selectedConversation) return;

    try {
      await sendMessage(
        selectedConversation,
        messageInput.trim(),
        attachments.length > 0 ? 'file' : 'text',
        replyingTo?.id,
        attachments
      );

      setMessageInput('');
      setReplyingTo(null);
      setAttachments([]);
      setIsTyping(false);
      updatePresence('online');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getMessageStatus = (message: Message) => {
    switch (message.status) {
      case 'sent':
        return <Check size={14} className="text-gray-400" />;
      case 'delivered':
        return <CheckCheck size={14} className="text-gray-400" />;
      case 'read':
        return <CheckCheck size={14} className="text-primary-500" />;
      default:
        return null;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getPresenceStatus = (userId: string) => {
    const presence = userPresence[userId];
    if (!presence) return 'offline';
    return presence.status;
  };

  const getPresenceColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.other_participant?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentConversation = conversations.find(c => c.id === selectedConversation);
  const currentMessages = selectedConversation ? messages[selectedConversation] || [] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] bg-space-base rounded-xl border border-space-light/20 overflow-hidden">
      {/* Conversations Sidebar */}
      <div className={`w-80 border-r border-space-light/20 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 border-b border-space-light/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-white">Messages</h2>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X size={18} />
              </Button>
            )}
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-space-dark/50 border border-space-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No conversations found
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`p-4 border-b border-space-light/10 cursor-pointer hover:bg-space-light/20 transition-colors ${
                  selectedConversation === conversation.id ? 'bg-space-light/30' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={conversation.other_participant?.avatar_url || 'https://via.placeholder.com/40'}
                      alt={conversation.other_participant?.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-space-base ${
                      getPresenceColor(getPresenceStatus(conversation.other_participant?.id || ''))
                    }`}></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-white truncate">
                        {conversation.other_participant?.username}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {formatTime(conversation.last_message_at)}
                      </span>
                    </div>
                    
                    {conversation.last_message && (
                      <p className="text-sm text-gray-400 truncate">
                        {conversation.last_message.content || 'File attachment'}
                      </p>
                    )}
                  </div>
                  
                  {conversation.unread_count && conversation.unread_count > 0 && (
                    <div className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {conversation.unread_count}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-space-light/20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedConversation(null)}
                className="md:hidden"
              >
                <ArrowLeft size={18} />
              </Button>
              
              <div className="relative">
                <img
                  src={currentConversation?.other_participant?.avatar_url || 'https://via.placeholder.com/40'}
                  alt={currentConversation?.other_participant?.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-space-base ${
                  getPresenceColor(getPresenceStatus(currentConversation?.other_participant?.id || ''))
                }`}></div>
              </div>
              
              <div>
                <h3 className="font-medium text-white">
                  {currentConversation?.other_participant?.username}
                </h3>
                <p className="text-xs text-gray-400">
                  {getPresenceStatus(currentConversation?.other_participant?.id || '')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Phone size={18} />
              </Button>
              <Button variant="ghost" size="sm">
                <Video size={18} />
              </Button>
              <Button variant="ghost" size="sm">
                <Info size={18} />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {currentMessages.map((message) => {
              const isOwn = message.sender_id === userId;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                    {message.reply_to && (
                      <div className="mb-2 p-2 bg-space-light/20 rounded-lg border-l-2 border-primary-500">
                        <p className="text-xs text-gray-400">
                          Replying to {message.reply_to.sender?.username}
                        </p>
                        <p className="text-sm text-gray-300 truncate">
                          {message.reply_to.content}
                        </p>
                      </div>
                    )}
                    
                    <div
                      className={`rounded-lg p-3 ${
                        isOwn
                          ? 'bg-primary-600 text-white'
                          : 'bg-space-light/30 text-gray-200'
                      }`}
                    >
                      {message.content && (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                      
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center space-x-2">
                              {attachment.file_type.startsWith('image/') ? (
                                <img
                                  src={attachment.file_url}
                                  alt={attachment.file_name}
                                  className="max-w-full h-auto rounded"
                                />
                              ) : (
                                <div className="flex items-center space-x-2 p-2 bg-space-dark/30 rounded">
                                  <File size={16} />
                                  <span className="text-sm">{attachment.file_name}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className={`flex items-center justify-between mt-2 ${
                        isOwn ? 'text-primary-200' : 'text-gray-400'
                      }`}>
                        <span className="text-xs">{formatTime(message.created_at)}</span>
                        {isOwn && (
                          <div className="flex items-center space-x-1">
                            {getMessageStatus(message)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {!isOwn && (
                    <img
                      src={message.sender?.avatar_url || 'https://via.placeholder.com/32'}
                      alt={message.sender?.username}
                      className="w-8 h-8 rounded-full object-cover order-1 mr-2"
                    />
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Preview */}
          {replyingTo && (
            <div className="px-4 py-2 bg-space-light/20 border-t border-space-light/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Reply size={16} className="text-primary-400" />
                  <span className="text-sm text-gray-400">
                    Replying to {replyingTo.sender?.username}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(null)}
                >
                  <X size={16} />
                </Button>
              </div>
              <p className="text-sm text-gray-300 truncate mt-1">
                {replyingTo.content}
              </p>
            </div>
          )}

          {/* Attachment Preview */}
          {attachments.length > 0 && (
            <div className="px-4 py-2 bg-space-light/20 border-t border-space-light/20">
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-space-dark/30 rounded p-2">
                    <File size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-300">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="p-4 border-t border-space-light/20">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full p-3 bg-space-dark/50 border border-space-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              </div>
              
              <div className="flex items-center space-x-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip size={18} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile size={18} />
                </Button>
                
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() && attachments.length === 0}
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-space-light/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Select a conversation
            </h3>
            <p className="text-gray-400">
              Choose a conversation from the sidebar to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingInterface;