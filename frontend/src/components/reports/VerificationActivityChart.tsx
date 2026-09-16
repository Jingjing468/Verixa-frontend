interface Props {
  total: number
}

export default function VerificationActivityChart({ total }: Props) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => ({ label, value: 0 }))
  const max = 1

  return (
    <article className="report-chart-card verification-chart">
      <div className="report-chart-header">
        <div>
          <h2>Verification Activity</h2>
          <p>Public certificate verifications by day.</p>
        </div>
      </div>
      <div className="verification-bars">
        {days.map((d, i) => (
          <div key={d.label} className="verification-bar-col" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="verification-bar-track">
              <div className="verification-bar-fill" style={{ height: `${(d.value / max) * 100}%` }} />
            </div>
            <span className="verification-bar-value">{d.value}</span>
            <span className="verification-bar-label">{d.label}</span>
          </div>
        ))}
      </div>
      <p className="chart-total">{total.toLocaleString()} total verifications</p>
    </article>
  )
}
