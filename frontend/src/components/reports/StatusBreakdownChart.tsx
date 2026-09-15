interface Props {
  total: number
  valid: number
  expired: number
  revoked: number
}

function pct(value: number, total: number) {
  return total === 0 ? 0 : (value / total) * 100
}

export default function StatusBreakdownChart({ total, valid, expired, revoked }: Props) {
  const segments = [
    { label: 'Valid', value: valid, pct: pct(valid, total), color: '#4aac7b' },
    { label: 'Expired', value: expired, pct: pct(expired, total), color: '#f0a346' },
    { label: 'Revoked', value: revoked, pct: pct(revoked, total), color: '#ec6576' },
  ]
  const validEnd = segments[0].pct
  const expiredEnd = validEnd + segments[1].pct

  return (
    <article className="report-chart-card status-chart-card">
      <div className="report-chart-header">
        <div>
          <h2>Certificate Status Breakdown</h2>
          <p>Current status distribution of all issued certificates.</p>
        </div>
      </div>
      <div className="donut-chart-area">
        <div
          className="report-donut"
          style={{
            background: total > 0
              ? `conic-gradient(#4aac7b 0 ${validEnd}%, #f0a346 ${validEnd}% ${expiredEnd}%, #ec6576 ${expiredEnd}% 100%)`
              : '#edf0f5',
          }}
        >
          <div className="report-donut-center">
            <strong>{total.toLocaleString()}</strong>
            <span>Total</span>
          </div>
        </div>
        <div className="donut-legend">
          {segments.map((s) => (
            <div key={s.label} className="donut-legend-item">
              <i style={{ background: s.color }} />
              <div>
                <b>{s.label}</b>
                <span>{s.value.toLocaleString()} - {s.pct.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}
