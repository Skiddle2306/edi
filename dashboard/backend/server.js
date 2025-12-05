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

app.listen(PORT, () => {
  console.log(`\n✅ Node.js API listening on http://localhost:${PORT}`);
  console.log(`   (Run 'npm install' first if you haven't already.)\n`);
});