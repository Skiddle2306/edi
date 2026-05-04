import { useState, useEffect, useRef } from "react";
import ServersPage from "./pages/ServersPage";
import ServerDetailPage from "./pages/ServerDetailPage";
import AlertPanel from "./components/AlertPanel";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("servers"); // "servers" | "detail"
  const [selectedServer, setSelectedServer] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [newAlerts, setNewAlerts] = useState([]);
  const [alertPanelOpen, setAlertPanelOpen] = useState(false);
  const prevAlertIds = useRef(new Set());
  const audioCtx = useRef(null);

  const API = "http://localhost:3001";

  function playAlertSound() {
    try {
      if (!audioCtx.current) audioCtx.current = new AudioContext();
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  }

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch(`${API}/api/alerts`);
        const data = await res.json();
        setAlerts(data);

        const incoming = data.filter((a) => !prevAlertIds.current.has(a.id));
        if (incoming.length > 0 && prevAlertIds.current.size > 0) {
          setNewAlerts((prev) => [...incoming, ...prev].slice(0, 20));
          playAlertSound();
        }
        data.forEach((a) => prevAlertIds.current.add(a.id));
      } catch (e) {}
    }

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 8000);
    return () => clearInterval(interval);
  }, []);

  const criticalCount = alerts.filter((a) => a.priority === "CRITICAL").length;
  const highCount = alerts.filter((a) => a.priority === "HIGH").length;

  return (
    <div className="app">
      <nav className="topnav">
        <div className="nav-brand" onClick={() => setPage("servers")}>
          <span className="brand-icon">▣</span>
          <span className="brand-name">SRVMGR</span>
        </div>
        <div className="nav-links">
          <button
            className={`nav-link ${page === "servers" ? "active" : ""}`}
            onClick={() => setPage("servers")}
          >
            All Servers
          </button>
          {selectedServer && (
            <button
              className={`nav-link ${page === "detail" ? "active" : ""}`}
              onClick={() => setPage("detail")}
            >
              {selectedServer}
            </button>
          )}
        </div>
        <button
          className={`alert-bell ${newAlerts.length > 0 ? "ringing" : ""}`}
          onClick={() => {
            setAlertPanelOpen(!alertPanelOpen);
            setNewAlerts([]);
          }}
        >
          <span className="bell-icon">🔔</span>
          {alerts.length > 0 && (
            <span className={`alert-badge ${criticalCount > 0 ? "critical" : highCount > 0 ? "high" : ""}`}>
              {newAlerts.length > 0 ? newAlerts.length : alerts.length}
            </span>
          )}
        </button>
      </nav>

      {alertPanelOpen && (
        <AlertPanel
          alerts={alerts}
          onClose={() => setAlertPanelOpen(false)}
        />
      )}

      <main className="main-content">
        {page === "servers" && (
          <ServersPage
            api={API}
            onSelectServer={(name) => {
              setSelectedServer(name);
              setPage("detail");
            }}
          />
        )}
        {page === "detail" && selectedServer && (
          <ServerDetailPage api={API} serverName={selectedServer} />
        )}
      </main>
    </div>
  );
}