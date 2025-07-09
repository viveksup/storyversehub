import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  User, Mail, Lock, Camera, Bell, Shield, Search,
  LogOut, Loader2, AlertCircle, Check, Users, UserPlus,
  MessageCircle, Settings as SettingsIcon, Calendar
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import FollowButton from '../components/ui/FollowButton';
import UserSearchModal from '../components/ui/UserSearchModal';
import { useUserInteractions } from '../hooks/useUserInteractions';
import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { userId: profileUserId } = useParams<{ userId?: string }>();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [showUserSearch, setShowUserSearch] = useState(false);
  
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    followStats,
    loadFollowStats,
    toggleFollow
  } = useUserInteractions(currentUser?.id);
  
  // Profile State
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    avatar_url: '',
    bio: '',
  });
  
  // Security State
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  
  // Preferences State
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true,
    publicProfile: true,
    showActivity: true,
  });
  
  useEffect(() => {
    loadUserData();
  }, [profileUserId]);
  
  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      setCurrentUser(user);
      
      // Determine if this is the user's own profile or someone else's
      const targetUserId = profileUserId || user.id;
      const isOwn = !profileUserId || profileUserId === user.id;
      setIsOwnProfile(isOwn);
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();
        
      if (error) throw error;
      
      if (!profiles) {
        throw new Error('Profile not found');
      }
      
      const userProfile = {
        ...profiles,
        username: profiles.username || (isOwn ? user.email?.split('@')[0] : 'Unknown User') || '',
        avatar_url: '',
        bio: '',
        email_notifications: true,
        push_notifications: true,
        weekly_digest: true,
        public_profile: true,
        show_activity: true,
      };
      
      setProfileUser(userProfile);
      
      setProfile({
        username: userProfile.username || '',
        email: isOwn ? user.email || '' : '',
        avatar_url: userProfile.avatar_url || '',
        bio: userProfile.bio || '',
      });
      
      setPreferences({
        emailNotifications: userProfile.email_notifications || true,
        pushNotifications: userProfile.push_notifications || true,
        weeklyDigest: userProfile.weekly_digest || true,
        publicProfile: userProfile.public_profile || true,
        showActivity: userProfile.show_activity || true,
      });
      
      // Load follow stats for the profile being viewed
      if (!isOwn) {
        await loadFollowStats(targetUserId);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: profile.username,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });
        
      if (error) throw error;
      
      setSuccess('Profile updated successfully');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (passwords.new !== passwords.confirm) {
        throw new Error('New passwords do not match');
      }
      
      passwordSchema.parse(passwords.new);
      
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });
      
      if (error) throw error;
      
      setSuccess('Password updated successfully');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email_notifications: preferences.emailNotifications,
          push_notifications: preferences.pushNotifications,
          weekly_digest: preferences.weeklyDigest,
          public_profile: preferences.publicProfile,
          show_activity: preferences.showActivity,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });
        
      if (error) throw error;
      
      setSuccess('Preferences updated successfully');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/');
    }
  };
  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB');
      return;
    }
    
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      
      // Create bucket if it doesn't exist (this will be handled by RLS)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          upsert: true,
          cacheControl: '3600'
        });
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });
        
      if (updateError) throw updateError;
      
      setSuccess('Avatar updated successfully');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // If viewing someone else's profile, show their profile view
  if (!isOwnProfile) {
    const stats = followStats[profileUserId!] || { followerCount: 0, followingCount: 0, isFollowing: false };
    
    return (
      <div className="min-h-screen bg-space-dark pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="bg-space-base/90 backdrop-blur-sm rounded-2xl p-8 border border-space-light/20 shadow-cosmic mb-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={profileUser?.avatar_url || 'https://via.placeholder.com/120'}
                    alt={profileUser?.username}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary-500"
                  />
                </div>
                
                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-display font-bold text-white mb-2">
                    {profileUser?.username || 'Unknown User'}
                  </h1>
                  
                  {profileUser?.bio && (
                    <p className="text-gray-300 mb-4 max-w-2xl">
                      {profileUser.bio}
                    </p>
                  )}
                  
                  {/* Stats */}
                  <div className="flex justify-center md:justify-start gap-8 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-display font-bold text-white">
                        {stats.followerCount}
                      </div>
                      <div className="text-sm text-gray-400">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-display font-bold text-white">
                        {stats.followingCount}
                      </div>
                      <div className="text-sm text-gray-400">Following</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-display font-bold text-white">
                        {new Date(profileUser?.created_at).getFullYear()}
                      </div>
                      <div className="text-sm text-gray-400">Joined</div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <FollowButton
                      userId={profileUserId!}
                      isFollowing={stats.isFollowing}
                      onToggleFollow={toggleFollow}
                      size="lg"
                    />
                    <Button
                      variant="outline"
                      size="lg"
                      leftIcon={<MessageCircle size={18} />}
                      onClick={() => navigate(`/messages?user=${profileUserId}`)}
                    >
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* User's Content/Activity could go here */}
            <div className="bg-space-base/90 backdrop-blur-sm rounded-2xl p-8 border border-space-light/20 shadow-cosmic">
              <h2 className="text-2xl font-display font-semibold text-white mb-6">
                Recent Activity
              </h2>
              <div className="text-center py-12">
                <Users size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400">
                  No recent activity to display
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Own profile view (existing settings interface)
  return (
    <div className="min-h-screen bg-space-dark pt-20">
      {/* User Search Modal */}
      <UserSearchModal
        isOpen={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={searchResults}
        searchLoading={searchLoading}
        onFollowToggle={toggleFollow}
        currentUserId={currentUser?.id}
      />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header with Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-white mb-2">
                Profile Settings
              </h1>
              <p className="text-gray-400">
                Manage your account settings and preferences
              </p>
            </div>
            
            <Button
              variant="primary"
              leftIcon={<Search size={18} />}
              onClick={() => setShowUserSearch(true)}
            >
              Find Users
            </Button>
          </div>
          
          <div className="bg-space-base/90 backdrop-blur-sm rounded-2xl p-8 border border-space-light/20 shadow-cosmic">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Sidebar Navigation */}
              <div className="md:w-64">
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full px-4 py-2 rounded-lg flex items-center ${
                      activeTab === 'profile'
                        ? 'bg-space-accent text-white'
                        : 'text-gray-400 hover:bg-space-light/20 hover:text-white'
                    }`}
                  >
                    <User size={18} className="mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`w-full px-4 py-2 rounded-lg flex items-center ${
                      activeTab === 'security'
                        ? 'bg-space-accent text-white'
                        : 'text-gray-400 hover:bg-space-light/20 hover:text-white'
                    }`}
                  >
                    <Shield size={18} className="mr-2" />
                    Security
                  </button>
                  <button
                    onClick={() => setActiveTab('preferences')}
                    className={`w-full px-4 py-2 rounded-lg flex items-center ${
                      activeTab === 'preferences'
                        ? 'bg-space-accent text-white'
                        : 'text-gray-400 hover:bg-space-light/20 hover:text-white'
                    }`}
                  >
                    <Bell size={18} className="mr-2" />
                    Preferences
                  </button>
                </div>
                
                <hr className="my-6 border-gray-800" />
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mb-4"
                  leftIcon={<Users size={18} />}
                  onClick={() => setShowUserSearch(true)}
                >
                  Find Users
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  leftIcon={<LogOut size={18} />}
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
              
              {/* Main Content */}
              <div className="flex-1">
                {/* Status Messages */}
                {error && (
                  <div className="mb-6 bg-error-900/50 border border-error-500/50 rounded-lg p-3 flex items-start">
                    <AlertCircle size={18} className="text-error-400 flex-shrink-0 mt-0.5 mr-2" />
                    <p className="text-sm text-error-400">{error}</p>
                  </div>
                )}
                
                {success && (
                  <div className="mb-6 bg-success-900/50 border border-success-500/50 rounded-lg p-3 flex items-start">
                    <Check size={18} className="text-success-400 flex-shrink-0 mt-0.5 mr-2" />
                    <p className="text-sm text-success-400">{success}</p>
                  </div>
                )}
                
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-display font-semibold text-white">Profile Settings</h2>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Users size={16} />
                          <span>{followStats[currentUser?.id]?.followerCount || 0} followers</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <UserPlus size={16} />
                          <span>{followStats[currentUser?.id]?.followingCount || 0} following</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Avatar Upload */}
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={profile.avatar_url || 'https://via.placeholder.com/100'}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover"
                        />
                        <label className="absolute bottom-0 right-0 bg-space-accent rounded-full p-2 cursor-pointer">
                          <Camera size={16} className="text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarUpload}
                          />
                        </label>
                      </div>
                      <div>
                        <h3 className="text-white font-medium">Profile Picture</h3>
                        <p className="text-sm text-gray-400">
                          JPG, GIF or PNG. Max size of 2MB.
                        </p>
                      </div>
                    </div>
                    
                    {/* Username Field */}
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                        Username
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="username"
                          value={profile.username}
                          onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                          className="w-full px-4 py-3 bg-space-dark/50 border border-space-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 pl-10"
                          placeholder="Enter your username"
                        />
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                    
                    {/* Email Field */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          value={profile.email}
                          disabled
                          className="w-full px-4 py-3 bg-space-dark/50 border border-space-light/30 rounded-lg text-gray-400 pl-10 cursor-not-allowed"
                        />
                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Contact support to change your email address
                      </p>
                    </div>
                    
                    {/* Bio Field */}
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-3 bg-space-dark/50 border border-space-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </form>
                )}
                
                {/* Security Tab */}
                {activeTab === 'security' && (
                  <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-display font-semibold text-white">Security Settings</h2>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar size={16} />
                        <span>Joined {new Date(profileUser?.created_at || currentUser?.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Current Password */}
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-1">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          id="currentPassword"
                          value={passwords.current}
                          onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                          className="w-full px-4 py-3 bg-space-dark/50 border border-space-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 pl-10"
                          placeholder="Enter your current password"
                        />
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                    
                    {/* New Password */}
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          id="newPassword"
                          value={passwords.new}
                          onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                          className="w-full px-4 py-3 bg-space-dark/50 border border-space-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 pl-10"
                          placeholder="Enter your new password"
                        />
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                    
                    {/* Confirm New Password */}
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          id="confirmPassword"
                          value={passwords.confirm}
                          onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                          className="w-full px-4 py-3 bg-space-dark/50 border border-space-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 pl-10"
                          placeholder="Confirm your new password"
                        />
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                    
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin mr-2" />
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                  </form>
                )}
                
                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <form onSubmit={handleUpdatePreferences} className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-display font-semibent text-white">Preferences</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<SettingsIcon size={16} />}
                      >
                        Advanced
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <label className="flex items-center justify-between">
                        <span className="text-gray-300">Email Notifications</span>
                        <input
                          type="checkbox"
                          checked={preferences.emailNotifications}
                          onChange={(e) => setPreferences(prev => ({ 
                            ...prev, 
                            emailNotifications: e.target.checked 
                          }))}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between">
                        <span className="text-gray-300">Push Notifications</span>
                        <input
                          type="checkbox"
                          checked={preferences.pushNotifications}
                          onChange={(e) => setPreferences(prev => ({ 
                            ...prev, 
                            pushNotifications: e.target.checked 
                          }))}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between">
                        <span className="text-gray-300">Weekly Digest</span>
                        <input
                          type="checkbox"
                          checked={preferences.weeklyDigest}
                          onChange={(e) => setPreferences(prev => ({ 
                            ...prev, 
                            weeklyDigest: e.target.checked 
                          }))}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                      
                      <hr className="border-gray-800" />
                      
                      <label className="flex items-center justify-between">
                        <span className="text-gray-300">Public Profile</span>
                        <input
                          type="checkbox"
                          checked={preferences.publicProfile}
                          onChange={(e) => setPreferences(prev => ({ 
                            ...prev, 
                            publicProfile: e.target.checked 
                          }))}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between">
                        <span className="text-gray-300">Show Activity</span>
                        <input
                          type="checkbox"
                          checked={preferences.showActivity}
                          onChange={(e) => setPreferences(prev => ({ 
                            ...prev, 
                            showActivity: e.target.checked 
                          }))}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                    </div>
                    
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        'Save Preferences'
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;