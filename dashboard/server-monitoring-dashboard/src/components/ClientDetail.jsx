// src/components/ClientDetail.jsx
import React, { useState, useEffect } from 'react';
import { fetchDashboardData } from '../services/api';
import TimeSeriesChart from './TimeSeriesChart';

const ClientDetail = ({ clientName, onBack }) => {
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadClientData();
    
    // Refresh data every 5 seconds
    const interval = setInterval(() => {
      loadClientData();
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

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
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

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffSecs = Math.floor(diffMs / 1000);
    return `${diffSecs}s ago`;
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
      </main>
    </div>
  );
};

export default ClientDetail;