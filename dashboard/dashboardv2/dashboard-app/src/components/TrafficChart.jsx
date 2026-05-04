function TrafficChart({ data = [] }) {
  const max = Math.max(...data.map((d) => d.value || 0), 1);

  return (
    <div className="card">
      <h3 className="card-title">Network Traffic</h3>

      <div className="traffic-chart">
        {data.length === 0 ? (
          <p className="empty">No traffic data</p>
        ) : (
          data.map((d, i) => (
            <div key={i} className="bar-wrapper">
              <div
                className="bar"
                style={{
                  height: `${(d.value / max) * 100}%`,
                }}
              ></div>
              <span className="label">{d.label}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TrafficChart;