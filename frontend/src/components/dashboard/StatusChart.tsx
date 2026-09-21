interface Props {
  total: number
  valid: number
  expired: number
  revoked: number
}

function pct(value: number, total: number) {
  return total === 0 ? 0 : (value / total) * 100
}

function StatusChart({ total, valid, expired, revoked }: Props) {
  const validEnd = pct(valid, total)
  const expiredEnd = validEnd + pct(expired, total)

  return (
    <article className="dashboard-card status-chart dashboard-enter">
      <div className="card-heading">
        <div>
          <h2>Certificate Status Overview</h2>
          <p>Your credentials at a glance</p>
        </div>
        <button>View details</button>
      </div>
      <div className="donut-area">
        <div
          className="donut-chart"
          style={{
            background: total > 0
              ? `conic-gradient(#4aac7b 0 ${validEnd}%, #f0a346 ${validEnd}% ${expiredEnd}%, #ec6576 ${expiredEnd}% 100%)`
              : '#edf0f5',
          }}
        >
          <div>
            <strong>{total.toLocaleString()}</strong>
            <span>Total</span>
          </div>
        </div>
        <div className="chart-legend">
          <span><i className="valid" />Valid <b>{valid.toLocaleString()}</b></span>
          <span><i className="expired" />Expired <b>{expired.toLocaleString()}</b></span>
          <span><i className="revoked" />Revoked <b>{revoked.toLocaleString()}</b></span>
        </div>
      </div>
    </article>
  )
}

export default StatusChart
