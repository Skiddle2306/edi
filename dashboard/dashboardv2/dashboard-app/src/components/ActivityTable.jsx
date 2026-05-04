function ActivityTable({ activities = [] }) {
  return (
    <div className="card">
      <h3 className="card-title">Recent Activity</h3>

      <table className="activity-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Event</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {activities.length === 0 ? (
            <tr>
              <td colSpan="3" className="empty">
                No activity available
              </td>
            </tr>
          ) : (
            activities.map((a, i) => (
              <tr key={i}>
                <td>{a.time || "-"}</td>
                <td>{a.event || "-"}</td>
                <td className={`status ${a.status?.toLowerCase()}`}>
                  {a.status || "Unknown"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ActivityTable;