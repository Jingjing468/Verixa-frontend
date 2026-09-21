import { FileCheck2, TrendingUp, UsersRound } from 'lucide-react'

interface Props {
  totalRecipients: number
  activeCertificates: number
  recipientsThisMonth: number
}

export default function RecipientStats({
  totalRecipients,
  activeCertificates,
  recipientsThisMonth,
}: Props) {
  const stats = [
    { label: 'Total Recipients', value: String(totalRecipients), icon: UsersRound, tone: 'blue', detail: 'People in your organization' },
    { label: 'Active Certificates', value: String(activeCertificates), icon: FileCheck2, tone: 'green', detail: 'Currently valid credentials' },
    { label: 'Recipients This Month', value: String(recipientsThisMonth), icon: TrendingUp, tone: 'orange', detail: 'New recipients added this month' },
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
