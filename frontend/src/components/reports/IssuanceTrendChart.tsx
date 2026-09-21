import { useState } from 'react'

interface Props {
  data: Array<{ date: string; count: number }>
}

function formatLabel(date: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(date))
}

export default function IssuanceTrendChart({ data }: Props) {
  const [period, setPeriod] = useState('30 Days')
  const days = period === '7 Days' ? 7 : period === '30 Days' ? 30 : 90
  const end = new Date()
  end.setHours(0, 0, 0, 0)
  const start = new Date(end)
  start.setDate(start.getDate() - days + 1)
  const filtered = data.filter(item => new Date(item.date) >= start && new Date(item.date) < new Date(end.getTime() + 86400000))
  const chartData = filtered.map(item => ({ label: formatLabel(item.date), value: item.count }))
  const max = Math.max(...chartData.map(d => d.value), 1)
  const ticks = Array.from(new Set([max, Math.floor(max / 2), 0]))

  return (
    <article className="report-chart-card issuance-chart">
      <div className="report-chart-header">
        <div>
          <h2>Issuance trend</h2>
          <p>Certificates created during the selected period.</p>
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
                  <div className="issuance-bar-fill" title={`${d.label}: ${d.value} certificates`} style={{ height: `${(d.value / max) * 100}%` }} />
                </div>
                <span className="issuance-bar-label">{d.label}</span>
              </div>
            ))
          ) : (
            <div className="report-empty-state">
              <b>No certificates in this period</b>
              <span>Choose a longer period or issue a new certificate.</span>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
