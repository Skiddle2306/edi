function ServerAlerts({ alerts = [] }) {
  return (
    <div className="card">
      <h3 className="card-title">Server Alerts</h3>

      <div className="alerts-list">
        {alerts.length === 0 ? (
          <p className="empty">No alerts</p>
        ) : (
          alerts.map((alert, i) => (
            <div
              key={i}
              className={`alert-item ${alert.priority?.toLowerCase()}`}
            >
              <div className="alert-message">
                {alert.message || "No message"}
              </div>

              <div className="alert-meta">
                <span>{alert.priority || "INFO"}</span>
                <span>{alert.time || "-"}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ServerAlerts;