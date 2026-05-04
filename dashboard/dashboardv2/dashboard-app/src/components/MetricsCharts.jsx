import { useMemo } from "react";

function LineChart({ data, color, label, unit = "", height = 120 }) {
  const w = 800;
  const h = height;
  const pad = { top: 12, right: 8, bottom: 24, left: 40 };

  if (!data || data.length < 2) {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text3)", fontSize: 12 }}>
        Not enough data
      </div>
    );
  }

  const vals = data.map((d) => d.value);
  const times = data.map((d) => d.time);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals) || 1;
  const range = maxV - minV || 1;

  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;

  const points = data.map((d, i) => ({
    x: pad.left + (i / (data.length - 1)) * chartW,
    y: pad.top + chartH - ((d.value - minV) / range) * chartH,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD = `${pathD} L${points[points.length - 1].x},${h - pad.bottom} L${points[0].x},${h - pad.bottom} Z`;

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: pad.top + chartH - t * chartH,
    val: (minV + t * range).toFixed(1),
  }));

  // X-axis ticks (show ~5 labels)
  const step = Math.max(1, Math.floor(data.length / 5));
  const xTicks = data
    .filter((_, i) => i % step === 0 || i === data.length - 1)
    .map((d, i) => ({
      x: pad.left + (data.indexOf(d) / (data.length - 1)) * chartW,
      label: new Date(d.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }));

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="chart-svg" style={{ height }}>
      {/* Grid lines */}
      <g className="chart-grid">
        {yTicks.map((t, i) => (
          <line key={i} x1={pad.left} y1={t.y} x2={w - pad.right} y2={t.y} />
        ))}
      </g>

      {/* Y axis labels */}
      <g className="chart-axis">
        {yTicks.map((t, i) => (
          <text key={i} x={pad.left - 6} y={t.y + 4} textAnchor="end">
            {t.val}{unit}
          </text>
        ))}
        {xTicks.map((t, i) => (
          <text key={i} x={t.x} y={h - 4} textAnchor="middle">
            {t.label}
          </text>
        ))}
      </g>

      {/* Area fill */}
      <path d={areaD} fill={color} className="chart-area" />

      {/* Line */}
      <path d={pathD} className="chart-line" stroke={color} />

      {/* Last value dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={4}
        fill={color}
      />
    </svg>
  );
}

export default function MetricsCharts({ metrics, expanded }) {
  const cpuData = useMemo(
    () =>
      [...metrics]
        .reverse()
        .slice(0, expanded ? 500 : 100)
        .map((m) => ({ time: m.timestamp, value: parseFloat(m.cpu_usage || 0) })),
    [metrics, expanded]
  );

  const ramData = useMemo(
    () =>
      [...metrics]
        .reverse()
        .slice(0, expanded ? 500 : 100)
        .map((m) => ({ time: m.timestamp, value: parseFloat(m.memory_percentage || 0) })),
    [metrics, expanded]
  );

  const ramMBData = useMemo(
    () =>
      [...metrics]
        .reverse()
        .slice(0, expanded ? 500 : 100)
        .map((m) => ({ time: m.timestamp, value: m.memory_used || 0 })),
    [metrics, expanded]
  );

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card">
        <div className="card-header">
          CPU Usage %
          <span className="stat-pill">
            Latest: {cpuData[cpuData.length - 1]?.value?.toFixed(1) || "—"}%
          </span>
        </div>
        <div className="card-body" style={{ padding: "16px 16px 8px" }}>
          <LineChart data={cpuData} color="var(--accent)" label="CPU" unit="%" height={expanded ? 180 : 130} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <div className="card-header">
            RAM %
            <span className="stat-pill">
              Latest: {ramData[ramData.length - 1]?.value?.toFixed(1) || "—"}%
            </span>
          </div>
          <div className="card-body" style={{ padding: "16px 16px 8px" }}>
            <LineChart data={ramData} color="var(--green)" label="RAM" unit="%" height={expanded ? 160 : 120} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            RAM (MB)
            <span className="stat-pill">
              Latest: {ramMBData[ramMBData.length - 1]?.value || "—"} MB
            </span>
          </div>
          <div className="card-body" style={{ padding: "16px 16px 8px" }}>
            <LineChart data={ramMBData} color="var(--purple)" label="RAM MB" unit="MB" height={expanded ? 160 : 120} />
          </div>
        </div>
      </div>

      {expanded && (
        <div className="card">
          <div className="card-header">Raw Metrics Log</div>
          <div style={{ overflowX: "auto", maxHeight: 400, overflowY: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>CPU %</th>
                  <th>RAM Used (MB)</th>
                  <th>RAM Total (MB)</th>
                  <th>RAM %</th>
                  <th>Disk (GB)</th>
                </tr>
              </thead>
              <tbody>
                {metrics.slice(0, 200).map((m, i) => (
                  <tr key={i}>
                    <td style={{ color: "var(--text3)" }}>
                      {new Date(m.timestamp).toLocaleString()}
                    </td>
                    <td style={{ color: parseFloat(m.cpu_usage) > 80 ? "var(--red)" : "var(--text)" }}>
                      {parseFloat(m.cpu_usage || 0).toFixed(2)}%
                    </td>
                    <td>{m.memory_used}</td>
                    <td>{m.memory_total}</td>
                    <td style={{ color: parseFloat(m.memory_percentage) > 80 ? "var(--orange)" : "var(--text)" }}>
                      {parseFloat(m.memory_percentage || 0).toFixed(2)}%
                    </td>
                    <td>{m.disk_size ? (m.disk_size / 1024 / 1024 / 1024).toFixed(2) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}