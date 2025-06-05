import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Video,
  Users,
  Eye,
  Download,
  Share2,
  Calendar,
  Filter,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import useProjectStore from '../stores/projectStore';

const Analytics = () => {
  const { projects, isLoading } = useProjectStore();
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('views');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Analytics data derived from projects - full analytics require backend integration
  const analyticsData = {
    overview: {
      totalProjects: projects.length,
      totalVideos: projects.reduce((sum, p) => sum + (p.videos?.length || 0), 0),
      totalClips: projects.reduce((sum, p) => sum + (p.clips?.length || 0), 0),
      totalViews: 0, // Requires backend analytics
      totalWatchTime: 0, // Requires backend analytics
      avgEngagement: 0 // Requires backend analytics
    },
    trends: {
      views: { value: 0, change: 0, trend: 'neutral' },
      watchTime: { value: 0, change: 0, trend: 'neutral' },
      engagement: { value: 0, change: 0, trend: 'neutral' },
      clips: { value: projects.reduce((sum, p) => sum + (p.clips?.length || 0), 0), change: 0, trend: 'neutral' }
    },
    chartData: {
      views: [],
      watchTime: []
    },
    topPerformers: []
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const MetricCard = ({ title, value, change, trend, icon: Icon, format = 'number' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex items-center gap-1">
          {getTrendIcon(trend)}
          <span className={`text-sm font-medium ${getTrendColor(trend)}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {format === 'duration' ? formatDuration(value) : formatNumber(value)}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
      </div>
    </motion.div>
  );

  const SimpleChart = ({ data, color = 'blue' }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="flex items-end gap-1 h-20">
        {data.map((point, index) => (
          <div
            key={index}
            className={`flex-1 bg-${color}-500 rounded-t opacity-70 hover:opacity-100 transition-opacity`}
            style={{ height: `${(point.value / maxValue) * 100}%` }}
            title={`${point.date}: ${formatNumber(point.value)}`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track performance and insights for your video content
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
        
        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Views"
            value={analyticsData.trends.views.value}
            change={analyticsData.trends.views.change}
            trend={analyticsData.trends.views.trend}
            icon={Eye}
          />
          <MetricCard
            title="Watch Time"
            value={analyticsData.trends.watchTime.value}
            change={analyticsData.trends.watchTime.change}
            trend={analyticsData.trends.watchTime.trend}
            icon={Clock}
            format="duration"
          />
          <MetricCard
            title="Engagement Rate"
            value={analyticsData.trends.engagement.value}
            change={analyticsData.trends.engagement.change}
            trend={analyticsData.trends.engagement.trend}
            icon={TrendingUp}
          />
          <MetricCard
            title="Total Clips"
            value={analyticsData.trends.clips.value}
            change={analyticsData.trends.clips.change}
            trend={analyticsData.trends.clips.trend}
            icon={Video}
          />
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Views Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Views Over Time
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Views</span>
              </div>
            </div>
            <SimpleChart data={analyticsData.chartData.views} color="blue" />
          </motion.div>
          
          {/* Watch Time Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Watch Time
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Minutes</span>
              </div>
            </div>
            <SimpleChart data={analyticsData.chartData.watchTime} color="green" />
          </motion.div>
        </div>
        
        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Top Performing Content
          </h3>
          
          <div className="space-y-4">
            {analyticsData.topPerformers.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatNumber(item.views)} views
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {item.engagement}% engagement
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.type === 'video' 
                          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                      }`}>
                        {item.type}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center"
          >
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full w-fit mx-auto mb-4">
              <Video className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {analyticsData.overview.totalProjects}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Total Projects</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center"
          >
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full w-fit mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {analyticsData.overview.totalVideos}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Total Videos</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center"
          >
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full w-fit mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {analyticsData.overview.avgEngagement}%
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Avg Engagement</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;