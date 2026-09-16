export default function VerificationActivityChart() {
  const days = [
    { label: 'Mon', value: 620 },
    { label: 'Tue', value: 740 },
    { label: 'Wed', value: 680 },
    { label: 'Thu', value: 810 },
    { label: 'Fri', value: 960 },
    { label: 'Sat', value: 720 },
    { label: 'Sun', value: 832 },
  ]
  const max = Math.max(...days.map((d) => d.value))

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
      <p className="chart-total">5,362 total verifications</p>
    </article>
  )
}
