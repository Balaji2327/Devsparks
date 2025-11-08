import React, { useEffect, useState } from 'react';
import {
  Users,
  Activity,
  TrendingUp,
  Shield,
  Search,
  ScanLine,
  Download,
  RefreshCw,
  Calendar,
  BarChart3,
} from 'lucide-react';
import {
  getActivityStats,
  getRecentActivity,
  ActivityStats,
  RecentActivity,
} from '../../services/firestoreService';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, activityData] = await Promise.all([
        getActivityStats(),
        getRecentActivity(20),
      ]);
      setStats(statsData);
      setRecentActivity(activityData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ocr':
        return <ScanLine className="h-4 w-4 text-purple-600" />;
      case 'compliance':
        return <Shield className="h-4 w-4 text-green-600" />;
      case 'search':
        return <Search className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'ocr':
        return 'bg-purple-50 border-purple-200';
      case 'compliance':
        return 'bg-green-50 border-green-200';
      case 'search':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor platform activity and user engagement
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-xs text-gray-500">Last refreshed</p>
            <p className="text-sm font-medium text-gray-700">
              {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Users */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Users</p>
                <p className="text-4xl font-bold mt-2">{stats.totalUsers}</p>
                <p className="text-blue-100 text-xs mt-1">
                  {stats.activeUsersToday} active today
                </p>
              </div>
              <div className="bg-white/20 p-4 rounded-lg">
                <Users className="h-8 w-8" />
              </div>
            </div>
          </div>

          {/* OCR Scans */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">OCR Scans</p>
                <p className="text-4xl font-bold mt-2">{stats.totalOCRScans}</p>
                <p className="text-purple-100 text-xs mt-1">Total scans performed</p>
              </div>
              <div className="bg-white/20 p-4 rounded-lg">
                <ScanLine className="h-8 w-8" />
              </div>
            </div>
          </div>

          {/* Compliance Checks */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">
                  Compliance Checks
                </p>
                <p className="text-4xl font-bold mt-2">
                  {stats.totalComplianceChecks}
                </p>
                <p className="text-green-100 text-xs mt-1">
                  Avg score: {stats.averageComplianceScore}%
                </p>
              </div>
              <div className="bg-white/20 p-4 rounded-lg">
                <Shield className="h-8 w-8" />
              </div>
            </div>
          </div>

          {/* Product Searches */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">
                  Product Searches
                </p>
                <p className="text-4xl font-bold mt-2">{stats.totalSearches}</p>
                <p className="text-orange-100 text-xs mt-1">
                  Total search queries
                </p>
              </div>
              <div className="bg-white/20 p-4 rounded-lg">
                <Search className="h-8 w-8" />
              </div>
            </div>
          </div>

          {/* Average Compliance Score */}
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm font-medium">
                  Avg Compliance
                </p>
                <p className="text-4xl font-bold mt-2">
                  {stats.averageComplianceScore}%
                </p>
                <p className="text-cyan-100 text-xs mt-1">
                  Platform-wide average
                </p>
              </div>
              <div className="bg-white/20 p-4 rounded-lg">
                <TrendingUp className="h-8 w-8" />
              </div>
            </div>
          </div>

          {/* Active Users Today */}
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm font-medium">Active Today</p>
                <p className="text-4xl font-bold mt-2">
                  {stats.activeUsersToday}
                </p>
                <p className="text-pink-100 text-xs mt-1">
                  {Math.round((stats.activeUsersToday / stats.totalUsers) * 100)}%
                  engagement rate
                </p>
              </div>
              <div className="bg-white/20 p-4 rounded-lg">
                <Activity className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Activity
            </h2>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div
                key={index}
                className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${getActivityColor(
                  activity.type
                )}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">{getActivityIcon(activity.type)}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.userName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all text-left">
          <BarChart3 className="h-8 w-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">View Analytics</h3>
          <p className="text-sm text-gray-600">
            Detailed charts and trends analysis
          </p>
        </button>

        <button className="p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:border-green-300 hover:shadow-lg transition-all text-left">
          <Download className="h-8 w-8 text-green-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Export Data</h3>
          <p className="text-sm text-gray-600">
            Download activity logs and reports
          </p>
        </button>

        <button className="p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:border-purple-300 hover:shadow-lg transition-all text-left">
          <Calendar className="h-8 w-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Schedule Reports</h3>
          <p className="text-sm text-gray-600">
            Automated weekly and monthly reports
          </p>
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;