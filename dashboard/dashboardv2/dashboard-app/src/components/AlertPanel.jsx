function AlertPanel({ alerts, onClose }) {
  return (
    <div className="alert-panel">
      <div className="alert-header">
        <h3>Alerts</h3>
        <button onClick={onClose}>✖</button>
      </div>

      <div className="alert-list">
        {alerts.length === 0 ? (
          <p>No alerts</p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`alert-item ${alert.priority?.toLowerCase()}`}
            >
              <div className="alert-title">{alert.message}</div>
              <div className="alert-meta">
                <span>{alert.priority}</span>
                <span>{alert.timestamp}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AlertPanel;