import React from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Package, 
  Eye,
  Download,
  Globe
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const complianceData = [
    { date: '2024-01', compliant: 78, violations: 22 },
    { date: '2024-02', compliant: 82, violations: 18 },
    { date: '2024-03', compliant: 85, violations: 15 },
    { date: '2024-04', compliant: 87, violations: 13 },
    { date: '2024-05', compliant: 89, violations: 11 },
    { date: '2024-06', compliant: 91, violations: 9 },
  ];

  const platformData = [
    { platform: 'Amazon', violations: 45, color: '#FF9933' },
    { platform: 'Flipkart', violations: 32, color: '#138808' },
    { platform: 'Myntra', violations: 28, color: '#000080' },
    { platform: 'Nykaa', violations: 21, color: '#FF6B6B' },
    { platform: 'BigBasket', violations: 16, color: '#4ECDC4' },
  ];

  const violationTypes = [
    { type: 'Missing MRP', count: 89, color: '#FF6B6B' },
    { type: 'Incorrect Units', count: 67, color: '#FFE66D' },
    { type: 'Missing Country of Origin', count: 54, color: '#FF9933' },
    { type: 'No Manufacturer Address', count: 43, color: '#4ECDC4' },
    { type: 'Missing Net Quantity', count: 31, color: '#95E1D3' },
  ];

  const stats = [
    { label: 'Total Products Scanned', value: '2,847,392', icon: Package, color: 'bg-blue-500', change: '+12.3%' },
    { label: 'Compliance Rate', value: '91.2%', icon: CheckCircle, color: 'bg-green-500', change: '+2.1%' },
    { label: 'Violations Detected', value: '142', icon: AlertTriangle, color: 'bg-red-500', change: '-8.4%' },
    { label: 'Platforms Monitored', value: '47', icon: Globe, color: 'bg-purple-500', change: '+3.2%' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Compliance Overview</h2>
          <p className="text-gray-600 mt-1">Real-time monitoring of Legal Metrology compliance across e-commerce platforms</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Eye className="h-4 w-4" />
            <span>Live Monitor</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <span className={`text-sm font-medium ${
                stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Trend */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={complianceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="compliant" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="violations" 
                stroke="#EF4444" 
                strokeWidth={3}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Violations */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Violations by Platform</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platformData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="platform" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="violations" fill="#FF9933" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Violation Types */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Common Violation Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {violationTypes.map((violation, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: violation.color }}
                  ></div>
                  <span className="font-medium text-gray-900">{violation.type}</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{violation.count}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={violationTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                >
                  {violationTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { time: '2 minutes ago', action: 'New violation detected on Amazon', severity: 'high', product: 'Organic Tea Leaves - 250g' },
              { time: '15 minutes ago', action: 'Compliance check completed for Flipkart', severity: 'low', product: 'Bulk scan of 1,247 products' },
              { time: '1 hour ago', action: 'OCR extraction successful', severity: 'medium', product: 'Baby Food - Cerelac 300g' },
              { time: '3 hours ago', action: 'Rule engine updated', severity: 'low', product: 'New MRP validation rules' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  activity.severity === 'high' ? 'bg-red-500' : 
                  activity.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.product}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;