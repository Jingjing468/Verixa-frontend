import { FileCheck2, TrendingUp, UsersRound } from 'lucide-react'

export default function RecipientStats() {
  const stats = [
    { label: 'Total Recipients', value: '842', icon: UsersRound, tone: 'blue', detail: 'Across all programs' },
    { label: 'Active Certificates', value: '1,102', icon: FileCheck2, tone: 'green', detail: '88.3% of total' },
    { label: 'Recipients This Month', value: '74', icon: TrendingUp, tone: 'orange', detail: '+18% vs last month' },
  ]

  return (
    <section className="recipient-stats">
      {stats.map((s, i) => {
        const Icon = s.icon
        return (
          <article key={s.label} className="recipient-stat-card" style={{ animationDelay: `${i * 80}ms` }}>
            <span className={`recipient-stat-icon ${s.tone}`}>
              <Icon size={20} />
            </span>
            <div>
              <small>{s.label}</small>
              <strong>{s.value}</strong>
              <span className={`recipient-stat-detail ${s.tone}`}>{s.detail}</span>
            </div>
          </article>
        )
      })}
    </section>
  )
}
