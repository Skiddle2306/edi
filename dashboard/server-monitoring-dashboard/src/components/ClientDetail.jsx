// src/components/ClientDetail.jsx
import React, { useState, useEffect } from 'react';
import { fetchDashboardData, fetchClientUsers } from '../services/api';
import TimeSeriesChart from './TimeSeriesChart';

const ClientDetail = ({ clientName, onBack }) => {
  const [clientData, setClientData] = useState(null);
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('resources'); // 'resources' or 'users'
  const [groupByIP, setGroupByIP] = useState(false);

  useEffect(() => {
    loadClientData();
    loadUsersData();
    
    // Refresh data every 5 seconds
    const interval = setInterval(() => {
      loadClientData();
      loadUsersData();
    }, 5000);

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, [clientName]);

  const loadClientData = async () => {
    try {
      const allData = await fetchDashboardData();
      if (allData[clientName]) {
        setClientData(allData[clientName]);
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to load client data:', err);
    }
  };

  const loadUsersData = async () => {
    try {
      const users = await fetchClientUsers(clientName);
      setUsersData(users);
      setUsersLoading(false);
    } catch (err) {
      console.error('Failed to load users data:', err);
      setUsersLoading(false);
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

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatUptime = (uptimeSeconds) => {
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'Active';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getBrowserFromUserAgent = (userAgent) => {
    if (!userAgent) return 'Unknown';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  };

  const getOSFromUserAgent = (userAgent) => {
    if (!userAgent) return 'Unknown';
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Other';
  };

  if (loading || !clientData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const latest = clientData.metrics[0];
  const isOnline = clientData.isOnline;
  const uptimeSinceLastOffline = clientData.uptimeSinceLastOffline;
  
  const cpuUsage = parseFloat(latest.cpu_usage).toFixed(2);
  const memoryUsed = parseFloat(latest.memory_used) || 0;
  const memoryTotal = parseFloat(latest.memory_total) || 0;
  const memoryPercent = latest.memory_percentage 
    ? parseFloat(latest.memory_percentage).toFixed(0)
    : (memoryTotal > 0 ? ((memoryUsed / memoryTotal) * 100).toFixed(0) : '0');

  // Calculate active sessions
  const activeSessions = usersData.filter(user => !user.end_time).length;

  // Group users by IP address
  const groupedByIP = usersData.reduce((acc, user) => {
    const ip = user.ip || 'Unknown';
    if (!acc[ip]) {
      acc[ip] = {
        ip: ip,
        count: 0,
        sessions: [],
        browsers: new Set(),
        os: new Set(),
        paths: new Set()
      };
    }
    acc[ip].count++;
    acc[ip].sessions.push(user);
    acc[ip].browsers.add(getBrowserFromUserAgent(user.user_agent));
    acc[ip].os.add(getOSFromUserAgent(user.user_agent));
    if (user.path) acc[ip].paths.add(user.path);
    return acc;
  }, {});

  const groupedIPArray = Object.values(groupedByIP).sort((a, b) => b.count - a.count);

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
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Connected
                </span>
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
        <div className="mb-6 flex items-center gap-2 text-gray-600">
          <button onClick={onBack} className="hover:text-blue-600">
            Dashboard
          </button>
          <span>{'>'}</span>
          <span className="text-gray-900 font-medium">{clientName}</span>
        </div>

        {/* Client Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{clientName}</h2>
              <p className="text-gray-600">Real-time performance monitoring for {clientName}</p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                isOnline 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}></span>
                {isOnline ? 'Online' : 'Offline'}
              </span>
              <p className="text-sm text-gray-600">
                Last Updated: <span className="font-medium">{formatTime(new Date(latest.timestamp))} ({getTimeAgo(latest.timestamp)})</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('resources')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition ${
                  activeTab === 'resources'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                📊 Resources
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition ${
                  activeTab === 'users'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                👥 User Activity ({usersData.length})
              </button>
            </div>
          </div>
        </div>

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">CPU USAGE</p>
                  <span className="text-2xl">💻</span>
                </div>
                <p className="text-3xl font-bold text-blue-600 mb-2">{cpuUsage}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${cpuUsage}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">MEMORY USAGE</p>
                  <span className="text-2xl">💾</span>
                </div>
                <p className="text-3xl font-bold text-green-600 mb-2">{memoryPercent}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${memoryPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">MEMORY USED</p>
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-3xl font-bold text-purple-600 mb-1">{memoryUsed} MB</p>
                <p className="text-sm text-gray-600">Total: {memoryTotal} MB</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">UPTIME</p>
                  <span className="text-2xl">⏱️</span>
                </div>
                <p className="text-3xl font-bold text-orange-600 mb-1">
                  {formatUptime(uptimeSinceLastOffline)}
                </p>
                <p className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {isOnline ? 'Running' : 'Offline'}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TimeSeriesChart
                data={clientData.metrics}
                dataKey="cpu_usage"
                title="CPU Usage Over Time"
                subtitle="Real-time updates"
                color="#3b82f6"
                type="line"
              />
              
              <TimeSeriesChart
                data={clientData.metrics}
                dataKey="memory_used"
                title="Memory Usage Over Time"
                subtitle="Percentage usage"
                color="#10b981"
                type="area"
              />
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Activity Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">TOTAL SESSIONS</p>
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-3xl font-bold text-blue-600">{usersData.length}</p>
                <p className="text-sm text-gray-600 mt-1">All time</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">UNIQUE IPs</p>
                  <span className="text-2xl">🌐</span>
                </div>
                <p className="text-3xl font-bold text-green-600">{groupedIPArray.length}</p>
                <p className="text-sm text-gray-600 mt-1">Different addresses</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">MOST ACTIVE IP</p>
                  <span className="text-2xl">🔥</span>
                </div>
                <p className="text-xl font-bold text-purple-600">
                  {groupedIPArray[0]?.ip || 'N/A'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {groupedIPArray[0]?.count || 0} session{groupedIPArray[0]?.count !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* User Activity Table */}
            <div className="bg-white rounded-lg shadow-sm">
              {usersLoading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading user activity...</p>
                </div>
              ) : usersData.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-600 text-lg mb-2">No user activity found</p>
                  <p className="text-gray-500 text-sm">User activity data will appear here when available</p>
                </div>
              ) : (
                <>
                  <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">User Sessions</h3>
                      <p className="text-gray-600 text-sm mt-1">
                        Tracking {usersData.length} session{usersData.length !== 1 ? 's' : ''} {groupByIP ? `from ${groupedIPArray.length} unique IP${groupedIPArray.length !== 1 ? 's' : ''}` : `with ${activeSessions} active`}
                      </p>
                    </div>
                    <button
                      onClick={() => setGroupByIP(!groupByIP)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        groupByIP
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {groupByIP ? '📊 Grouped by IP' : '📋 Group by IP'}
                    </button>
                  </div>

                  {!groupByIP ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">IP Address</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Browser</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">OS</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Path</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Start Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usersData.map((user) => {
                            const browser = getBrowserFromUserAgent(user.user_agent);
                            const os = getOSFromUserAgent(user.user_agent);
                            
                            return (
                              <tr 
                                key={user.id}
                                className="border-b border-gray-100 hover:bg-gray-50 transition"
                              >
                                <td className="py-4 px-4 font-medium text-gray-800">
                                  {user.ip || 'N/A'}
                                </td>
                                <td className="py-4 px-4 text-gray-700">
                                  {browser}
                                </td>
                                <td className="py-4 px-4 text-gray-700">
                                  {os}
                                </td>
                                <td className="py-4 px-4 text-blue-600 font-mono text-sm">
                                  {user.path || '/'}
                                </td>
                                <td className="py-4 px-4 text-gray-700 text-sm">
                                  {formatDateTime(user.start_time)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">IP Address</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Session Count</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Browsers Used</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Operating Systems</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Paths Accessed</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Latest Activity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedIPArray.map((ipGroup, index) => {
                            const latestSession = ipGroup.sessions[0];
                            
                            return (
                              <tr 
                                key={ipGroup.ip}
                                className="border-b border-gray-100 hover:bg-gray-50 transition"
                              >
                                <td className="py-4 px-4 font-medium text-gray-800">
                                  {ipGroup.ip}
                                </td>
                                <td className="py-4 px-4">
                                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                    {ipGroup.count} session{ipGroup.count !== 1 ? 's' : ''}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-gray-700">
                                  {Array.from(ipGroup.browsers).join(', ')}
                                </td>
                                <td className="py-4 px-4 text-gray-700">
                                  {Array.from(ipGroup.os).join(', ')}
                                </td>
                                <td className="py-4 px-4 text-gray-700 font-mono text-sm">
                                  {Array.from(ipGroup.paths).slice(0, 3).join(', ')}
                                  {ipGroup.paths.size > 3 && ` +${ipGroup.paths.size - 3} more`}
                                </td>
                                <td className="py-4 px-4 text-gray-700 text-sm">
                                  {formatDateTime(latestSession.start_time)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientDetail;