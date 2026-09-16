import { FileCheck2, ShieldCheck, ShieldAlert, TrendingUp } from 'lucide-react'

export default function ReportStats() {
  const stats = [
    { label: 'Certificates Issued', value: '1,248', detail: '+12.5% vs last month', icon: FileCheck2, tone: 'blue' },
    { label: 'Public Verifications', value: '5,362', detail: '+24% vs last month', icon: TrendingUp, tone: 'green' },
    { label: 'Valid Certificates', value: '1,102', detail: '88.3% of total', icon: ShieldCheck, tone: 'green' },
    { label: 'Revoked Certificates', value: '48', detail: '3.8% of total', icon: ShieldAlert, tone: 'red' },
  ]

  return (
    <section className="report-stats">
      {stats.map((s, i) => {
        const Icon = s.icon
        return (
          <article key={s.label} className="report-stat-card" style={{ animationDelay: `${i * 80}ms` }}>
            <span className={`report-stat-icon ${s.tone}`}>
              <Icon size={20} />
            </span>
            <div>
              <small>{s.label}</small>
              <strong>{s.value}</strong>
              <span className={`report-stat-detail ${s.tone}`}>{s.detail}</span>
            </div>
          </article>
        )
      })}
    </section>
  )
}
