import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, BookOpen, TrendingUp, AlertCircle, 
  Settings, Database, Shield, Activity,
  BarChart3, PieChart, Calendar, Bell,
  Plus, Search, Filter, RefreshCw
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';

interface AdminStats {
  totalUsers: number;
  totalStories: number;
  activeUsers: number;
  revenueThisMonth: number;
  newUsersToday: number;
  storiesPublishedToday: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  serverUptime: string;
}

interface RecentActivity {
  id: string;
  type: 'user_signup' | 'story_published' | 'payment_completed' | 'system_alert';
  description: string;
  timestamp: string;
  severity?: 'low' | 'medium' | 'high';
}

const AdminHomePage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalStories: 0,
    activeUsers: 0,
    revenueThisMonth: 0,
    newUsersToday: 0,
    storiesPublishedToday: 0,
    systemHealth: 'healthy',
    serverUptime: '99.9%'
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(loadAdminData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      
      // Load user statistics
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Load content statistics
      const { count: storyCount } = await supabase
        .from('content')
        .select('*', { count: 'exact', head: true });

      // Load today's new users
      const today = new Date().toISOString().split('T')[0];
      const { count: newUsersToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      // Load today's published stories
      const { count: storiesPublishedToday } = await supabase
        .from('content')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)
        .gte('created_at', today);

      // Mock data for demonstration
      setStats({
        totalUsers: userCount || 12453,
        totalStories: storyCount || 8742,
        activeUsers: Math.floor((userCount || 12453) * 0.15),
        revenueThisMonth: 45780,
        newUsersToday: newUsersToday || 23,
        storiesPublishedToday: storiesPublishedToday || 8,
        systemHealth: 'healthy',
        serverUptime: '99.9%'
      });

      // Mock recent activity
      setRecentActivity([
        {
          id: '1',
          type: 'user_signup',
          description: 'New user registered: cosmic_reader_42',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'story_published',
          description: 'Story published: "The Quantum Paradox" by Elara Voss',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'payment_completed',
          description: 'Premium subscription purchased: $12.99',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          type: 'system_alert',
          description: 'Database backup completed successfully',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          severity: 'low'
        }
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup':
        return <Users size={16} className="text-success-400" />;
      case 'story_published':
        return <BookOpen size={16} className="text-primary-400" />;
      case 'payment_completed':
        return <TrendingUp size={16} className="text-accent-400" />;
      case 'system_alert':
        return <AlertCircle size={16} className="text-warning-400" />;
      default:
        return <Activity size={16} className="text-gray-400" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen bg-space-dark pt-20">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-space-light to-space-base py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-white mb-2">
                Admin Control Center
              </h1>
              <p className="text-gray-300">
                Monitor and manage your StoryVerse Hub platform
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className={`flex items-center gap-1 ${
                  stats.systemHealth === 'healthy' ? 'text-success-400' : 
                  stats.systemHealth === 'warning' ? 'text-warning-400' : 'text-error-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    stats.systemHealth === 'healthy' ? 'bg-success-500' : 
                    stats.systemHealth === 'warning' ? 'bg-warning-500' : 'bg-error-500'
                  }`}></div>
                  System {stats.systemHealth}
                </span>
                <span className="text-gray-400">Uptime: {stats.serverUptime}</span>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button 
                variant="outline"
                size="lg"
                leftIcon={<RefreshCw size={18} />}
                onClick={loadAdminData}
                disabled={isLoading}
              >
                {isLoading ? 'Refreshing...' : 'Refresh Data'}
              </Button>
              <Link to="/admin/dashboard">
                <Button 
                  variant="primary"
                  size="lg"
                  leftIcon={<BarChart3 size={18} />}
                >
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Key Metrics */}
            <div>
              <h2 className="text-2xl font-display font-semibold text-white mb-6">
                Key Metrics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-primary-600/30 rounded-lg">
                      <Users size={24} className="text-primary-400" />
                    </div>
                    <span className="text-xs text-success-400 bg-success-900/30 px-2 py-1 rounded-full">
                      +{stats.newUsersToday} today
                    </span>
                  </div>
                  <h3 className="text-sm text-gray-400 mb-1">Total Users</h3>
                  <p className="text-2xl font-display font-bold text-white">
                    {stats.totalUsers.toLocaleString()}
                  </p>
                </div>

                <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-secondary-600/30 rounded-lg">
                      <BookOpen size={24} className="text-secondary-400" />
                    </div>
                    <span className="text-xs text-success-400 bg-success-900/30 px-2 py-1 rounded-full">
                      +{stats.storiesPublishedToday} today
                    </span>
                  </div>
                  <h3 className="text-sm text-gray-400 mb-1">Total Stories</h3>
                  <p className="text-2xl font-display font-bold text-white">
                    {stats.totalStories.toLocaleString()}
                  </p>
                </div>

                <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-accent-600/30 rounded-lg">
                      <Activity size={24} className="text-accent-400" />
                    </div>
                    <span className="text-xs text-gray-400">
                      {Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of total
                    </span>
                  </div>
                  <h3 className="text-sm text-gray-400 mb-1">Active Users</h3>
                  <p className="text-2xl font-display font-bold text-white">
                    {stats.activeUsers.toLocaleString()}
                  </p>
                </div>

                <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-success-600/30 rounded-lg">
                      <TrendingUp size={24} className="text-success-400" />
                    </div>
                    <span className="text-xs text-success-400 bg-success-900/30 px-2 py-1 rounded-full">
                      +12.5%
                    </span>
                  </div>
                  <h3 className="text-sm text-gray-400 mb-1">Revenue (MTD)</h3>
                  <p className="text-2xl font-display font-bold text-white">
                    ${stats.revenueThisMonth.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-2xl font-display font-semibold text-white mb-6">
                Quick Actions
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link to="/admin/users" className="group">
                  <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20 hover:border-primary-500/50 transition-all duration-300 hover:transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-primary-600/30 rounded-lg group-hover:bg-primary-600/50 transition-colors">
                        <Users size={24} className="text-primary-400" />
                      </div>
                      <span className="text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </span>
                    </div>
                    <h3 className="text-lg font-display font-semibold text-white mb-2">
                      Manage Users
                    </h3>
                    <p className="text-gray-400 text-sm">
                      View, edit, and manage user accounts and permissions
                    </p>
                  </div>
                </Link>

                <Link to="/admin/content" className="group">
                  <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20 hover:border-secondary-500/50 transition-all duration-300 hover:transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-secondary-600/30 rounded-lg group-hover:bg-secondary-600/50 transition-colors">
                        <BookOpen size={24} className="text-secondary-400" />
                      </div>
                      <span className="text-secondary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </span>
                    </div>
                    <h3 className="text-lg font-display font-semibold text-white mb-2">
                      Content Management
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Review, moderate, and manage published content
                    </p>
                  </div>
                </Link>

                <Link to="/admin/analytics" className="group">
                  <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20 hover:border-accent-500/50 transition-all duration-300 hover:transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-accent-600/30 rounded-lg group-hover:bg-accent-600/50 transition-colors">
                        <BarChart3 size={24} className="text-accent-400" />
                      </div>
                      <span className="text-accent-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </span>
                    </div>
                    <h3 className="text-lg font-display font-semibold text-white mb-2">
                      Analytics
                    </h3>
                    <p className="text-gray-400 text-sm">
                      View detailed analytics and performance metrics
                    </p>
                  </div>
                </Link>

                <Link to="/admin/payments" className="group">
                  <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20 hover:border-success-500/50 transition-all duration-300 hover:transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-success-600/30 rounded-lg group-hover:bg-success-600/50 transition-colors">
                        <TrendingUp size={24} className="text-success-400" />
                      </div>
                      <span className="text-success-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </span>
                    </div>
                    <h3 className="text-lg font-display font-semibold text-white mb-2">
                      Payments
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Monitor transactions and subscription management
                    </p>
                  </div>
                </Link>

                <Link to="/admin/settings" className="group">
                  <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20 hover:border-warning-500/50 transition-all duration-300 hover:transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-warning-600/30 rounded-lg group-hover:bg-warning-600/50 transition-colors">
                        <Settings size={24} className="text-warning-400" />
                      </div>
                      <span className="text-warning-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </span>
                    </div>
                    <h3 className="text-lg font-display font-semibold text-white mb-2">
                      System Settings
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Configure platform settings and preferences
                    </p>
                  </div>
                </Link>

                <Link to="/admin/security" className="group">
                  <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20 hover:border-error-500/50 transition-all duration-300 hover:transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-error-600/30 rounded-lg group-hover:bg-error-600/50 transition-colors">
                        <Shield size={24} className="text-error-400" />
                      </div>
                      <span className="text-error-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </span>
                    </div>
                    <h3 className="text-lg font-display font-semibold text-white mb-2">
                      Security
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Monitor security events and manage access controls
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-display font-semibold text-white">
                  Recent Activity
                </h3>
                <Button variant="ghost" size="sm" leftIcon={<Bell size={16} />}>
                  View All
                </Button>
              </div>
              
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-space-light/10 hover:bg-space-light/20 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-space-dark flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
              <h3 className="text-xl font-display font-semibold text-white mb-4">
                System Status
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Database</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success-500"></div>
                    <span className="text-success-400 text-sm">Healthy</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">API Services</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success-500"></div>
                    <span className="text-success-400 text-sm">Operational</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Storage</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-warning-500"></div>
                    <span className="text-warning-400 text-sm">85% Used</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">CDN</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success-500"></div>
                    <span className="text-success-400 text-sm">Optimal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
              <h3 className="text-xl font-display font-semibold text-white mb-4">
                Today's Summary
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">New Signups</span>
                  <span className="text-white font-semibold">{stats.newUsersToday}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Stories Published</span>
                  <span className="text-white font-semibold">{stats.storiesPublishedToday}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Revenue</span>
                  <span className="text-white font-semibold">$1,247</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Support Tickets</span>
                  <span className="text-white font-semibold">3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;