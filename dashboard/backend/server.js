const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'dashboard',
  host: 'localhost',
  database: 'servermanager',
  password: 'password',
  port: 5432,
});

/**
 * Fetches the system metrics and user activity logs for a specific client.
 * Calculates memory percentage and determines online status based on last update.
 */
async function getClientData(clientName) {
  // Query 1: System Metrics
  const metricsQuery = 'SELECT * FROM system_metrics WHERE client_name = $1 ORDER BY timestamp DESC;';
  const metricsResult = await pool.query(metricsQuery, [clientName]);
  
  // Add memory percentage to each metric and convert bytes to MB
  const metricsWithPercentage = metricsResult.rows.map(metric => {
    // Convert from bytes to MB (divide by 1024 * 1024)
    const memoryUsedMB = metric.used_ram ? (metric.used_ram / (1024 * 1024)).toFixed(0) : 0;
    const memoryTotalMB = metric.total_ram ? (metric.total_ram / (1024 * 1024)).toFixed(0) : 0;
    
    const memoryUsed = parseFloat(memoryUsedMB);
    const memoryTotal = parseFloat(memoryTotalMB);
    const memoryPercentage = memoryTotal > 0 
      ? ((memoryUsed / memoryTotal) * 100).toFixed(2)
      : '0.00';
    
    return {
      ...metric,
      memory_used: memoryUsed,
      memory_total: memoryTotal,
      memory_percentage: memoryPercentage
    };
  });

  // Query 2: Activity Logs
  const activityQuery = 'SELECT * FROM user_activity WHERE client_name = $1 ORDER BY start_time DESC;';
  const activityResult = await pool.query(activityQuery, [clientName]);

  // Determine if client is currently online (updated within last 20 seconds)
  const isOnline = metricsWithPercentage.length > 0 && 
    (new Date() - new Date(metricsWithPercentage[0].timestamp)) < 20000;

  // Calculate uptime since last offline
  let uptimeSinceLastOffline = 0;
  if (isOnline && metricsWithPercentage.length > 0) {
    // Find the last time the server went offline (gap > 20 seconds between updates)
    let lastOnlineStart = new Date(metricsWithPercentage[0].timestamp);
    
    // Look back through metrics to find gaps
    for (let i = 0; i < metricsWithPercentage.length - 1; i++) {
      const current = new Date(metricsWithPercentage[i].timestamp);
      const next = new Date(metricsWithPercentage[i + 1].timestamp);
      const gap = (current - next) / 1000; // gap in seconds
      
      if (gap > 20) {
        // Found a gap, this is when it came back online
        lastOnlineStart = current;
        break;
      }
      // If no gap found, keep going back
      lastOnlineStart = next;
      
      // Safety limit: don't look back more than 1000 records
      if (i >= 999) break;
    }
    
    uptimeSinceLastOffline = Math.floor((new Date() - lastOnlineStart) / 1000);
  }

  return {
    metrics: metricsWithPercentage,
    activities: activityResult.rows,
    isOnline,
    uptimeSinceLastOffline
  };
}

const app = express();
const PORT = 3001;

app.use(cors());

// Middleware to get real IP address
app.set('trust proxy', true);

// Helper function to get client IP
function getClientIP(req) {
  // Check various headers for real IP (useful behind proxies)
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         req.ip ||
         '127.0.0.1';
}

app.get('/', (req, res) => {
  res.send('Server Manager API is running.');
});

app.get('/api/dashboard-data', async (req, res) => {
  try {
    const clientsResult = await pool.query('SELECT DISTINCT client_name FROM system_metrics;');
    const clientNames = clientsResult.rows.map(row => row.client_name);

    let allData = {};

    for (const name of clientNames) {
      allData[name] = await getClientData(name);
    }

    // Debug: Log first client's data
    if (clientNames.length > 0) {
      const firstClient = clientNames[0];
      console.log('\n=== DEBUG: First Client Data ===');
      console.log('Client Name:', firstClient);
      if (allData[firstClient].metrics.length > 0) {
        console.log('Latest Metric:', allData[firstClient].metrics[0]);
      }
      console.log('================================\n');
    }

    res.json(allData);
  } catch (err) {
    console.error('Database query error:', err.message);
    res.status(500).json({ 
      error: 'Server Error during data retrieval. Check database connection and table names.' 
    });
  }
});

// New endpoint to fetch user activity data for a specific client
app.get('/api/client-users/:clientName', async (req, res) => {
  try {
    const { clientName } = req.params;
    
    console.log(`\n=== Fetching user activity for: ${clientName} ===`);
    
    // Query user_activity table for this client, excluding localhost IPs
    const activityQuery = `
      SELECT * FROM user_activity 
      WHERE client_name = $1 
        
      ORDER BY id DESC 
      LIMIT 10000;
    `;
    const activityResult = await pool.query(activityQuery, [clientName]);
    
    console.log(`Found ${activityResult.rows.length} user activity records (excluding localhost)`);
    
    if (activityResult.rows.length > 0) {
      console.log('Sample record:', activityResult.rows[0]);
      console.log('First 3 IPs:', activityResult.rows.slice(0, 3).map(r => r.ip));
    }
    
    res.json(activityResult.rows);
  } catch (err) {
    console.error('Error fetching user activity:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch user activity data',
      details: err.message 
    });
  }
});

// Alternative endpoint if your data is in system_metrics table
app.get('/api/client-metrics/:clientName', async (req, res) => {
  try {
    const { clientName } = req.params;
    
    console.log(`\n=== Fetching system metrics for: ${clientName} ===`);
    
    // Query system_metrics table for this client
    const metricsQuery = 'SELECT * FROM system_metrics WHERE client_name = $1 ORDER BY timestamp DESC LIMIT 100;';
    const metricsResult = await pool.query(metricsQuery, [clientName]);
    
    console.log(`Found ${metricsResult.rows.length} system metric records`);
    
    if (metricsResult.rows.length > 0) {
      console.log('Sample record:', metricsResult.rows[0]);
    }
    
    res.json(metricsResult.rows);
  } catch (err) {
    console.error('Error fetching system metrics:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch system metrics data',
      details: err.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n✅ Node.js API listening on http://localhost:${PORT}`);
  console.log(`   (Run 'npm install' first if you haven't already.)\n`);
});