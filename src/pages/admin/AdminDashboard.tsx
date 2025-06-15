import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, TrendingUp, DollarSign,
  Calendar, Filter, Download, RefreshCw,
  BarChart3, PieChart, LineChart, Activity,
  ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';

interface DashboardData {
  userGrowth: Array<{ month: string; users: number; growth: number }>;
  contentStats: Array<{ category: string; count: number; percentage: number }>;
  revenueData: Array<{ month: string; revenue: number; subscriptions: number }>;
  engagementMetrics: {
    dailyActiveUsers: number;
    averageSessionTime: number;
    storiesPerUser: number;
    retentionRate: number;
  };
}

const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    userGrowth: [],
    contentStats: [],
    revenueData: [],
    engagementMetrics: {
      dailyActiveUsers: 0,
      averageSessionTime: 0,
      storiesPerUser: 0,
      retentionRate: 0
    }
  });

  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [selectedTimeRange]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Mock data for demonstration - in production, this would come from your analytics service
      const mockData: DashboardData = {
        userGrowth: [
          { month: 'Jan', users: 8500, growth: 12.5 },
          { month: 'Feb', users: 9200, growth: 8.2 },
          { month: 'Mar', users: 10100, growth: 9.8 },
          { month: 'Apr', users: 11300, growth: 11.9 },
          { month: 'May', users: 12100, growth: 7.1 },
          { month: 'Jun', users: 12453, growth: 2.9 }
        ],
        contentStats: [
          { category: 'Sci-Fi', count: 2847, percentage: 32.6 },
          { category: 'Fantasy', count: 2183, percentage: 25.0 },
          { category: 'Mystery', count: 1542, percentage: 17.6 },
          { category: 'Romance', count: 1195, percentage: 13.7 },
          { category: 'Horror', count: 975, percentage: 11.1 }
        ],
        revenueData: [
          { month: 'Jan', revenue: 38500, subscriptions: 2890 },
          { month: 'Feb', revenue: 42300, subscriptions: 3120 },
          { month: 'Mar', revenue: 45100, subscriptions: 3380 },
          { month: 'Apr', revenue: 48900, subscriptions: 3650 },
          { month: 'May', revenue: 52200, subscriptions: 3920 },
          { month: 'Jun', revenue: 55780, subscriptions: 4180 }
        ],
        engagementMetrics: {
          dailyActiveUsers: 1847,
          averageSessionTime: 23.5,
          storiesPerUser: 4.2,
          retentionRate: 78.3
        }
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (growth: number) => {
    if (growth > 0) return <ArrowUp size={16} className="text-success-400" />;
    if (growth < 0) return <ArrowDown size={16} className="text-error-400" />;
    return <Minus size={16} className="text-gray-400" />;
  };

  const getTrendColor = (growth: number) => {
    if (growth > 0) return 'text-success-400';
    if (growth < 0) return 'text-error-400';
    return 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-space-dark pt-20">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-space-light to-space-base py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-white mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-gray-300">
                Comprehensive insights into your platform's performance
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex bg-space-base rounded-lg p-1 border border-space-light/20">
                {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedTimeRange(range)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedTimeRange === range
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {range === '7d' ? '7 Days' : 
                     range === '30d' ? '30 Days' : 
                     range === '90d' ? '90 Days' : '1 Year'}
                  </button>
                ))}
              </div>
              
              <Button 
                variant="outline"
                size="md"
                leftIcon={<Download size={18} />}
              >
                Export Data
              </Button>
              
              <Button 
                variant="primary"
                size="md"
                leftIcon={<RefreshCw size={18} />}
                onClick={loadDashboardData}
                disabled={isLoading}
              >
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary-600/30 rounded-lg">
                <Users size={24} className="text-primary-400" />
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(12.5)}
                <span className={`text-sm font-medium ${getTrendColor(12.5)}`}>
                  +12.5%
                </span>
              </div>
            </div>
            <h3 className="text-sm text-gray-400 mb-1">Total Users</h3>
            <p className="text-2xl font-display font-bold text-white">
              {dashboardData.userGrowth[dashboardData.userGrowth.length - 1]?.users.toLocaleString() || '0'}
            </p>
            <p className="text-xs text-gray-500 mt-1">vs last period</p>
          </div>

          <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-secondary-600/30 rounded-lg">
                <BookOpen size={24} className="text-secondary-400" />
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(8.7)}
                <span className={`text-sm font-medium ${getTrendColor(8.7)}`}>
                  +8.7%
                </span>
              </div>
            </div>
            <h3 className="text-sm text-gray-400 mb-1">Total Stories</h3>
            <p className="text-2xl font-display font-bold text-white">
              {dashboardData.contentStats.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">published content</p>
          </div>

          <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-accent-600/30 rounded-lg">
                <DollarSign size={24} className="text-accent-400" />
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(15.3)}
                <span className={`text-sm font-medium ${getTrendColor(15.3)}`}>
                  +15.3%
                </span>
              </div>
            </div>
            <h3 className="text-sm text-gray-400 mb-1">Monthly Revenue</h3>
            <p className="text-2xl font-display font-bold text-white">
              ${dashboardData.revenueData[dashboardData.revenueData.length - 1]?.revenue.toLocaleString() || '0'}
            </p>
            <p className="text-xs text-gray-500 mt-1">recurring revenue</p>
          </div>

          <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-success-600/30 rounded-lg">
                <Activity size={24} className="text-success-400" />
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(5.2)}
                <span className={`text-sm font-medium ${getTrendColor(5.2)}`}>
                  +5.2%
                </span>
              </div>
            </div>
            <h3 className="text-sm text-gray-400 mb-1">Daily Active Users</h3>
            <p className="text-2xl font-display font-bold text-white">
              {dashboardData.engagementMetrics.dailyActiveUsers.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">active today</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth Chart */}
          <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display font-semibold text-white">
                User Growth
              </h3>
              <div className="flex items-center gap-2">
                <BarChart3 size={20} className="text-primary-400" />
                <span className="text-sm text-gray-400">Monthly</span>
              </div>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-2">
              {dashboardData.userGrowth.map((data, index) => (
                <div key={data.month} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-md transition-all duration-500 hover:from-primary-500 hover:to-primary-300"
                    style={{ 
                      height: `${(data.users / Math.max(...dashboardData.userGrowth.map(d => d.users))) * 200}px`,
                      minHeight: '20px'
                    }}
                  ></div>
                  <span className="text-xs text-gray-400 mt-2">{data.month}</span>
                  <span className="text-xs text-white font-medium">{data.users.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display font-semibold text-white">
                Revenue Trend
              </h3>
              <div className="flex items-center gap-2">
                <LineChart size={20} className="text-accent-400" />
                <span className="text-sm text-gray-400">Monthly</span>
              </div>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-2">
              {dashboardData.revenueData.map((data, index) => (
                <div key={data.month} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-gradient-to-t from-accent-600 to-accent-400 rounded-t-md transition-all duration-500 hover:from-accent-500 hover:to-accent-300"
                    style={{ 
                      height: `${(data.revenue / Math.max(...dashboardData.revenueData.map(d => d.revenue))) * 200}px`,
                      minHeight: '20px'
                    }}
                  ></div>
                  <span className="text-xs text-gray-400 mt-2">{data.month}</span>
                  <span className="text-xs text-white font-medium">${(data.revenue / 1000).toFixed(0)}k</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Distribution and Engagement Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Content Distribution */}
          <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display font-semibold text-white">
                Content Distribution
              </h3>
              <PieChart size={20} className="text-secondary-400" />
            </div>
            
            <div className="space-y-4">
              {dashboardData.contentStats.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ 
                        backgroundColor: [
                          '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444'
                        ][index] 
                      }}
                    ></div>
                    <span className="text-white font-medium">{category.category}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400">{category.count.toLocaleString()}</span>
                    <span className="text-sm text-gray-500 w-12 text-right">
                      {category.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display font-semibold text-white">
                Engagement Metrics
              </h3>
              <Activity size={20} className="text-success-400" />
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Average Session Time</span>
                  <span className="text-white font-semibold">
                    {dashboardData.engagementMetrics.averageSessionTime} min
                  </span>
                </div>
                <div className="h-2 bg-space-dark rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                    style={{ width: `${(dashboardData.engagementMetrics.averageSessionTime / 60) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Stories per User</span>
                  <span className="text-white font-semibold">
                    {dashboardData.engagementMetrics.storiesPerUser}
                  </span>
                </div>
                <div className="h-2 bg-space-dark rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-secondary-500 to-accent-500 rounded-full"
                    style={{ width: `${(dashboardData.engagementMetrics.storiesPerUser / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Retention Rate</span>
                  <span className="text-white font-semibold">
                    {dashboardData.engagementMetrics.retentionRate}%
                  </span>
                </div>
                <div className="h-2 bg-space-dark rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent-500 to-success-500 rounded-full"
                    style={{ width: `${dashboardData.engagementMetrics.retentionRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;