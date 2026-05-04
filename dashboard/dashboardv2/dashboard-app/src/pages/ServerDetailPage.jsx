import { useState, useEffect, useMemo } from "react";
import MetricsCharts from "../components/MetricsCharts";
import ActivityTable from "../components/ActivityTable";
import TrafficChart from "../components/TrafficChart";
import ServerAlerts from "../components/ServerAlerts.jsx";

function formatUptime(seconds) {
  if (!seconds || seconds <= 0) return "—";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

function StatCard({ label, value, unit, sub, barVal, barClass }) {
  return (
    <div className="metric-card">
      <div className="metric-card-label">{label}</div>
      <div className="metric-card-value">
        {value}
        <span className="metric-card-unit"> {unit}</span>
      </div>
      {barVal !== undefined && (
        <div className="progress-wrap" style={{ marginTop: 8 }}>
          <div className={`progress-bar ${barClass}`} style={{ width: `${Math.min(barVal, 100)}%` }} />
        </div>
      )}
      {sub && <div className="metric-card-sub">{sub}</div>}
    </div>
  );
}

export default function ServerDetailPage({ api, serverName }) {
  const [metrics, setMetrics] = useState([]);
  const [activities, setActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [uptime, setUptime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  async function fetchAll() {
    try {
      const [dashRes, actRes, alertRes] = await Promise.all([
        fetch(`${api}/api/dashboard-data`),
        fetch(`${api}/api/client-users/${encodeURIComponent(serverName)}`),
        fetch(`${api}/api/alerts/${encodeURIComponent(serverName)}`),
      ]);
      const dash = await dashRes.json();
      const acts = await actRes.json();
      const alts = await alertRes.json();

      if (dash[serverName]) {
        setMetrics(dash[serverName].metrics || []);
        setIsOnline(dash[serverName].isOnline);
        setUptime(dash[serverName].uptimeSinceLastOffline);
      }
      setActivities(Array.isArray(acts) ? acts : []);
      setAlerts(Array.isArray(alts) ? alts : []);
    } catch (e) {
      console.error("Detail fetch error:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
    const iv = setInterval(fetchAll, 15000);
    return () => clearInterval(iv);
  }, [serverName]);

  const latest = metrics[0] || {};
  const cpu = parseFloat(latest.cpu_usage || 0);
  const ramPct = parseFloat(latest.memory_percentage || 0);
  const ramUsed = latest.memory_used || 0;
  const ramTotal = latest.memory_total || 0;
  const diskGB = latest.disk_size ? (latest.disk_size / 1024 / 1024 / 1024).toFixed(1) : "—";

  const cpuClass = cpu >= 90 ? "progress-crit" : cpu >= 75 ? "progress-warn" : "progress-cpu";
  const ramClass = ramPct >= 90 ? "progress-crit" : ramPct >= 75 ? "progress-warn" : "progress-ram";

  if (loading) return <div className="loading">Loading server data</div>;

  return (
    <div>
      {/* Header */}
      <div className="detail-header">
        <span className={`dot ${isOnline ? "dot-online" : "dot-offline"}`} style={{ width: 12, height: 12 }} />
        <div>
          <div className="detail-server-name">{serverName}</div>
          <div style={{ color: "var(--text3)", fontSize: 12 }}>
            {isOnline
              ? `Online · Uptime ${formatUptime(uptime)}`
              : "Offline · No recent heartbeat"}
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <span className="stat-pill">📊 {metrics.length} metric records</span>
          <span className="stat-pill">👤 {activities.length} sessions</span>
          <span className="stat-pill">🔔 {alerts.length} alerts</span>
        </div>
      </div>

      {/* Live metric cards */}
      <div className="metrics-row">
        <StatCard
          label="CPU Usage"
          value={cpu.toFixed(1)}
          unit="%"
          sub={`Latest reading`}
          barVal={cpu}
          barClass={cpuClass}
        />
        <StatCard
          label="RAM Used"
          value={ramPct.toFixed(1)}
          unit="%"
          sub={`${ramUsed} MB / ${ramTotal} MB`}
          barVal={ramPct}
          barClass={ramClass}
        />
        <StatCard
          label="Disk Size"
          value={diskGB}
          unit="GB"
          sub="Total disk capacity"
        />
        <StatCard
          label="Active Sessions"
          value={activities.filter((a) => !a.end_time).length}
          unit=""
          sub={`of ${activities.length} total`}
        />
      </div>

      {/* Tabs */}
      <div className="tabs">
        {["overview", "metrics", "activity", "traffic", "alerts"].map((t) => (
          <button
            key={t}
            className={`tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "overview" && "📊 "}
            {t === "metrics" && "📈 "}
            {t === "activity" && "👤 "}
            {t === "traffic" && "🌐 "}
            {t === "alerts" && "🔔 "}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gap: 16 }}>
          <MetricsCharts metrics={metrics} />
          <div className="card">
            <div className="card-header">Recent Sessions</div>
            <div style={{ overflowX: "auto" }}>
              <ActivityTable activities={activities.slice(0, 20)} />
            </div>
          </div>
        </div>
      )}

      {tab === "metrics" && <MetricsCharts metrics={metrics} expanded />}

      {tab === "activity" && (
        <ActivityTable activities={activities} showFilters />
      )}

      {tab === "traffic" && <TrafficChart activities={activities} />}

      {tab === "alerts" && (
        <ServerAlerts alerts={alerts} serverName={serverName} />
      )}
    </div>
  );
}