import { useState, useEffect } from "react";

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

function progressColor(val) {
  if (val >= 90) return "progress-crit";
  if (val >= 75) return "progress-warn";
  return "progress-cpu";
}

function ServerCard({ name, data, onClick }) {
  const m = data.metrics?.[0] || {};
  const cpu = parseFloat(m.cpu_usage || 0).toFixed(1);
  const ram = parseFloat(data.metrics?.[0]?.memory_percentage || 0);
  const disk = m.disk_size > 0 ? 0 : 0; // placeholder if no disk % available

  const activeUsers = data.activities?.filter((a) => !a.end_time).length || 0;

  return (
    <div
      className={`server-card ${data.isOnline ? "online" : "offline"}`}
      onClick={onClick}
    >
      <div className="server-card-header">
        <div>
          <div className="server-name">{name}</div>
          <div className="uptime-str">
            {data.isOnline
              ? `↑ ${formatUptime(data.uptimeSinceLastOffline)}`
              : "Offline"}
          </div>
        </div>
        <div className="server-status">
          <span className={`dot ${data.isOnline ? "dot-online" : "dot-offline"}`} />
          <span className={data.isOnline ? "status-online" : "status-offline"}>
            {data.isOnline ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
      </div>

      <div className="metric-row">
        <div className="metric-label">
          <span>CPU</span>
          <span className="metric-val">{cpu}%</span>
        </div>
        <div className="progress-wrap">
          <div
            className={`progress-bar ${progressColor(parseFloat(cpu))}`}
            style={{ width: `${Math.min(cpu, 100)}%` }}
          />
        </div>
      </div>

      <div className="metric-row">
        <div className="metric-label">
          <span>RAM</span>
          <span className="metric-val">
            {m.memory_used}MB / {m.memory_total}MB ({ram.toFixed(1)}%)
          </span>
        </div>
        <div className="progress-wrap">
          <div
            className={`progress-bar ${ram >= 90 ? "progress-crit" : ram >= 75 ? "progress-warn" : "progress-ram"}`}
            style={{ width: `${Math.min(ram, 100)}%` }}
          />
        </div>
      </div>

      {m.disk_size > 0 && (
        <div className="metric-row">
          <div className="metric-label">
            <span>DISK</span>
            <span className="metric-val">
              {(m.disk_size / 1024 / 1024 / 1024).toFixed(1)} GB
            </span>
          </div>
        </div>
      )}

      <div className="server-footer">
        <span className="stat-pill">
          <span>👤</span>
          {activeUsers} active users
        </span>
        <span className="stat-pill">
          <span>📋</span>
          {data.activities?.length || 0} sessions
        </span>
        <span className="stat-pill">
          <span>📊</span>
          {data.metrics?.length || 0} records
        </span>
      </div>
    </div>
  );
}

function MiniActivity({ activities }) {
  const recent = (activities || []).slice(0, 5);
  if (recent.length === 0) return <div className="empty-state">No recent activity</div>;

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>IP</th>
          <th>Path</th>
          <th>Time</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
        {recent.map((a, i) => (
          <tr key={i}>
            <td style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>{a.ip}</td>
            <td style={{ color: "var(--text2)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.path}</td>
            <td style={{ color: "var(--text3)" }}>
              {a.start_time ? new Date(a.start_time).toLocaleTimeString() : "—"}
            </td>
            <td style={{ color: "var(--text2)" }}>{a.duration_seconds}s</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ServersPage({ api, onSelectServer }) {
  const [allData, setAllData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  async function fetchData() {
    try {
      const res = await fetch(`${api}/api/dashboard-data`);
      const data = await res.json();
      setAllData(data);
      setLastUpdated(new Date());
    } catch (e) {
      console.error("Failed to fetch dashboard data:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const servers = Object.keys(allData);
  const onlineCount = servers.filter((s) => allData[s]?.isOnline).length;

  if (loading) return <div className="loading">Fetching server data</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Server Fleet</div>
          <div className="page-subtitle">
            {onlineCount}/{servers.length} online
            {lastUpdated && ` · Updated ${lastUpdated.toLocaleTimeString()}`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span className="stat-pill">
            <span className="dot dot-online" />
            {onlineCount} Online
          </span>
          <span className="stat-pill">
            <span className="dot dot-offline" />
            {servers.length - onlineCount} Offline
          </span>
        </div>
      </div>

      {servers.length === 0 ? (
        <div className="empty-state">No servers found. Check your API connection.</div>
      ) : (
        <>
          <div className="servers-grid" style={{ marginBottom: 32 }}>
            {servers.map((name) => (
              <ServerCard
                key={name}
                name={name}
                data={allData[name]}
                onClick={() => onSelectServer(name)}
              />
            ))}
          </div>

          {/* Recent Activity Across All Servers */}
          <div className="card">
            <div className="card-header">
              Recent Activity — All Servers
              <span className="stat-pill">
                {servers.reduce((acc, s) => acc + (allData[s]?.activities?.length || 0), 0)} total sessions
              </span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Server</th>
                    <th>IP</th>
                    <th>User Agent</th>
                    <th>Path</th>
                    <th>Start</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {servers
                    .flatMap((s) =>
                      (allData[s]?.activities || []).slice(0, 10).map((a) => ({ ...a, _server: s }))
                    )
                    .sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
                    .slice(0, 30)
                    .map((a, i) => (
                      <tr key={i}>
                        <td>
                          <span
                            style={{ color: "var(--accent)", cursor: "pointer" }}
                            onClick={() => onSelectServer(a._server)}
                          >
                            {a._server}
                          </span>
                        </td>
                        <td style={{ color: "var(--text)", fontFamily: "var(--font-mono)" }}>{a.ip}</td>
                        <td
                          style={{
                            color: "var(--text2)",
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={a.user_agent}
                        >
                          {a.user_agent}
                        </td>
                        <td style={{ color: "var(--text2)" }}>{a.path}</td>
                        <td style={{ color: "var(--text3)" }}>
                          {a.start_time ? new Date(a.start_time).toLocaleString() : "—"}
                        </td>
                        <td style={{ color: "var(--text2)" }}>{a.duration_seconds}s</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}