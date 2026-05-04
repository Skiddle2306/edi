// src/services/api.js
const API_BASE_URL = 'http://localhost:3001/api';

export const fetchDashboardData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard-data`);
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

// Fetch user/session data for a specific client
export const fetchClientUsers = async (clientName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/client-users/${clientName}`);
    if (!response.ok) {
      throw new Error('Failed to fetch client users');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching client users:', error);
    throw error;
  }
};

// Calculate aggregate statistics from all clients
export const calculateAggregateStats = (data) => {
  const clients = Object.keys(data);
  let totalClients = clients.length;
  let onlineClients = 0;
  let totalCpuUsage = 0;

  clients.forEach(clientName => {
    const clientInfo = data[clientName];
    
    // Check if client is online using the backend's calculation
    if (clientInfo.isOnline) {
      onlineClients++;
    }
    
    // Calculate average CPU usage from online clients
    if (clientInfo.metrics && clientInfo.metrics.length > 0) {
      totalCpuUsage += parseFloat(clientInfo.metrics[0].cpu_usage) || 0;
    }
  });

  return {
    totalClients,
    onlineClients,
    offlineClients: totalClients - onlineClients,
    averageLoad: totalClients > 0 ? (totalCpuUsage / totalClients).toFixed(1) : 0
  };
};

export const fetchAlerts = async (clientName) => {
  const baseUrl = 'http://localhost:3001'; // SAME as your backend

  const url = clientName
    ? `${baseUrl}/api/alerts/${clientName}`
    : `${baseUrl}/api/alerts`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Failed to fetch alerts');
  }

  return res.json();
};