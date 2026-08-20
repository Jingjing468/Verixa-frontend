export default function StatusBreakdownChart() {
  const segments = [
    { label: 'Valid', value: 1102, pct: 88.3, color: '#4aac7b' },
    { label: 'Expired', value: 98, pct: 7.9, color: '#f0a346' },
    { label: 'Revoked', value: 48, pct: 3.8, color: '#ec6576' },
  ]

  return (
    <article className="report-chart-card status-chart-card">
      <div className="report-chart-header">
        <div>
          <h2>Certificate Status Breakdown</h2>
          <p>Current status distribution of all issued certificates.</p>
        </div>
      </div>
      <div className="donut-chart-area">
        <div className="report-donut">
          <div className="report-donut-center">
            <strong>1,248</strong>
            <span>Total</span>
          </div>
        </div>
        <div className="donut-legend">
          {segments.map((s) => (
            <div key={s.label} className="donut-legend-item">
              <i style={{ background: s.color }} />
              <div>
                <b>{s.label}</b>
                <span>{s.value.toLocaleString()} · {s.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}
