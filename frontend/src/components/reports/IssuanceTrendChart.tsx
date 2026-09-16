import { useState } from 'react'

interface Props {
  data: Array<{ date: string; count: number }>
}

function formatLabel(date: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(date))
}

export default function IssuanceTrendChart({ data }: Props) {
  const [period, setPeriod] = useState('30 Days')
  const chartData = data.map((item) => ({ label: formatLabel(item.date), value: item.count }))
  const max = Math.max(...chartData.map((d) => d.value), 1)
  const ticks = [max, Math.round(max * 0.75), Math.round(max * 0.5), Math.round(max * 0.25), 0]

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
          {ticks.map((v, index) => <span key={`${v}-${index}`}>{v}</span>)}
        </div>
        <div className="issuance-chart-bars">
          {chartData.length > 0 ? (
            chartData.map((d, i) => (
              <div key={d.label} className="issuance-bar-col" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="issuance-bar-track">
                  <div className="issuance-bar-fill" style={{ height: `${(d.value / max) * 100}%` }} />
                </div>
                <span className="issuance-bar-label">{d.label}</span>
              </div>
            ))
          ) : (
            <div className="report-empty-state">
              <b>No certificates issued yet</b>
              <span>Issue your first certificate to see trends here.</span>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
