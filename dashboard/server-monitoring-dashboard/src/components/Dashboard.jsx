// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { fetchDashboardData, calculateAggregateStats } from '../services/api';
import MetricCard from './MetricCard';

const Dashboard = ({ onClientSelect }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    
    // Refresh data every 5 seconds
    const interval = setInterval(() => {
      loadDashboardData();
    }, 5000);

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const data = await fetchDashboardData();
      console.log('=== Dashboard Data Received ===', data);
      
      // Debug: Check first client
      const firstClient = Object.keys(data)[0];
      if (firstClient && data[firstClient].metrics.length > 0) {
        console.log('First Client Latest Metric:', data[firstClient].metrics[0]);
      }
      
      setDashboardData(data);
      setStats(calculateAggregateStats(data));
      setLoading(false);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      setLoading(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800 font-semibold mb-2">Error</p>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                SM
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Server Monitoring</h1>
                <p className="text-sm text-gray-500">Enterprise Infrastructure Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Connected
                  </span>
                  {isRefreshing && (
                    <span className="text-xs text-gray-500 animate-pulse">Updating...</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{formatTime(currentTime)}</p>
              </div>
              <div className="relative">
                <button className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold relative">
                  🔔
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    0
                  </span>
                </button>
              </div>
              <button className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                S
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <p className="text-gray-600">Dashboard</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="TOTAL CLIENTS"
            value={stats.totalClients}
            subtitle="Connected servers"
            color="blue"
          />
          <MetricCard
            title="ONLINE"
            value={stats.onlineClients}
            subtitle="Active connections"
            color="green"
          />
          <MetricCard
            title="OFFLINE"
            value={stats.offlineClients}
            subtitle="Disconnected servers"
            color="red"
          />
          <MetricCard
            title="AVERAGE LOAD"
            value={`${stats.averageLoad}%`}
            subtitle="System utilization"
            color="purple"
          />
        </div>

        {/* Server Table */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Server Fleet</h2>
            <div className="flex gap-2">
              <button 
                onClick={loadDashboardData}
                className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
              >
                🔄 Refresh
              </button>
              <button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
                📊 Export Data
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Client Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">CPU Usage</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Memory Usage</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Memory Total</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Memory %</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Uptime</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Last Update</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(dashboardData).map((clientName) => {
                  const metrics = dashboardData[clientName].metrics;
                  if (!metrics || metrics.length === 0) return null;
                  
                  const latest = metrics[0];
                  const clientInfo = dashboardData[clientName];
                  const isOnline = clientInfo.isOnline;
                  
                  const cpuUsage = parseFloat(latest.cpu_usage).toFixed(2);
                  const memoryUsed = parseFloat(latest.memory_used) || 0;
                  const memoryTotal = parseFloat(latest.memory_total) || 0;
                  const memoryPercent = latest.memory_percentage 
                    ? parseFloat(latest.memory_percentage).toFixed(0)
                    : (memoryTotal > 0 ? ((memoryUsed / memoryTotal) * 100).toFixed(0) : '0');
                  
                  const uptimeHours = Math.floor(clientInfo.uptimeSinceLastOffline / 3600);
                  const uptimeMinutes = Math.floor((clientInfo.uptimeSinceLastOffline % 3600) / 60);
                  
                  const now = new Date();
                  const then = new Date(latest.timestamp);
                  const diffMs = now - then;
                  const diffSecs = Math.floor(diffMs / 1000);
                  const diffMins = Math.floor(diffSecs / 60);
                  const diffHours = Math.floor(diffMins / 60);
                  let timeAgo;
                  if (diffSecs < 60) timeAgo = `${diffSecs}s ago`;
                  else if (diffMins < 60) timeAgo = `${diffMins}m ago`;
                  else if (diffHours < 24) timeAgo = `${diffHours}h ago`;
                  else timeAgo = `${Math.floor(diffHours / 24)}d ago`;

                  return (
                    <tr 
                      key={clientName}
                      onClick={() => onClientSelect(clientName)}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition"
                    >
                      <td className="py-4 px-4 font-medium text-gray-800">{clientName}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          isOnline 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            isOnline ? 'bg-green-500' : 'bg-red-500'
                          }`}></span>
                          {isOnline ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-green-600 font-medium">{cpuUsage}%</td>
                      <td className="py-4 px-4 text-gray-700">{memoryUsed} MB</td>
                      <td className="py-4 px-4 text-gray-700">{memoryTotal} MB</td>
                      <td className="py-4 px-4 text-green-600 font-medium">{memoryPercent}%</td>
                      <td className="py-4 px-4 text-blue-600">{uptimeHours}h {uptimeMinutes}m</td>
                      <td className="py-4 px-4 text-gray-500 text-sm">{timeAgo}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;