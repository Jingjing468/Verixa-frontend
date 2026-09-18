import { FileCheck2, FileX2, ShieldCheck } from 'lucide-react'

export default function AccountStats({ stats, error }: { stats: { issued: number; revoked: number; active: number } | null; error: boolean }) {
  const value = (count?: number) => count === undefined ? (error ? 'Unavailable' : '…') : count.toLocaleString()
  const cards = [
    { label: 'Certificates Issued', value: value(stats?.issued), icon: FileCheck2, tone: 'blue' },
    { label: 'Certificates Revoked', value: value(stats?.revoked), icon: FileX2, tone: 'red' },
    { label: 'Active Certificates', value: value(stats?.active), icon: ShieldCheck, tone: 'green' },
  ]

  return (
    <section className="profile-stats">
      {cards.map((s, i) => {
        const Icon = s.icon
        return (
          <article key={s.label} className="profile-stat-card" style={{ animationDelay: `${i * 70}ms` }}>
            <span className={`profile-stat-icon ${s.tone}`}>
              <Icon size={18} />
            </span>
            <div>
              <strong>{s.value}</strong>
              <small>{s.label}</small>
            </div>
          </article>
        )
      })}
    </section>
  )
}
