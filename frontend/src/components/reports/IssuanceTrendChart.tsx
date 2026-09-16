import { useState } from 'react'

const data = [
  { label: 'May 1', value: 42 },
  { label: 'May 5', value: 65 },
  { label: 'May 10', value: 88 },
  { label: 'May 15', value: 120 },
  { label: 'May 20', value: 145 },
  { label: 'May 25', value: 126 },
  { label: 'May 31', value: 170 },
]

export default function IssuanceTrendChart() {
  const [period, setPeriod] = useState('30 Days')
  const max = Math.max(...data.map((d) => d.value))

  return (
    <article className="report-chart-card issuance-chart">
      <div className="report-chart-header">
        <div>
          <h2>Certificates Issued Over Time</h2>
          <p>See how many certificates your organization issued during the selected period.</p>
        </div>
        <div className="chart-filter-tabs">
          {['7 Days', '30 Days', '3 Months'].map((p) => (
            <button key={p} className={period === p ? 'active' : ''} onClick={() => setPeriod(p)}>{p}</button>
          ))}
        </div>
      </div>
      <div className="issuance-chart-area">
        <div className="chart-y-axis">
          {[170, 127, 85, 42, 0].map((v) => <span key={v}>{v}</span>)}
        </div>
        <div className="issuance-chart-bars">
          {data.map((d, i) => (
            <div key={d.label} className="issuance-bar-col" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="issuance-bar-track">
                <div className="issuance-bar-fill" style={{ height: `${(d.value / max) * 100}%` }} />
              </div>
              <span className="issuance-bar-label">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}
