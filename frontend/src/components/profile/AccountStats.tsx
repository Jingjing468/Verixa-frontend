import { FileCheck2, FileX2, Clock } from 'lucide-react'

export default function AccountStats() {
  const stats = [
    { label: 'Certificates Issued', value: '328', icon: FileCheck2, tone: 'blue' },
    { label: 'Certificates Revoked', value: '12', icon: FileX2, tone: 'red' },
    { label: 'Last Login', value: 'Today, 9:42 AM', icon: Clock, tone: 'green' },
  ]

  return (
    <section className="profile-stats">
      {stats.map((s, i) => {
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
