import { FileCheck2, ShieldCheck, ShieldAlert, TrendingUp } from 'lucide-react'

interface Props {
  totalIssued: number
  valid: number
  revoked: number
  publicVerifications: number
}

function percent(value: number, total: number) {
  if (total === 0) return '0%'
  return `${((value / total) * 100).toFixed(1)}%`
}

export default function ReportStats({ totalIssued, valid, revoked, publicVerifications }: Props) {
  const stats = [
    { label: 'Certificates Issued', value: totalIssued.toLocaleString(), detail: 'From your organization', icon: FileCheck2, tone: 'blue' },
    { label: 'Public Verifications', value: publicVerifications.toLocaleString(), detail: 'No verification events yet', icon: TrendingUp, tone: 'green' },
    { label: 'Valid Certificates', value: valid.toLocaleString(), detail: `${percent(valid, totalIssued)} of total`, icon: ShieldCheck, tone: 'green' },
    { label: 'Revoked Certificates', value: revoked.toLocaleString(), detail: `${percent(revoked, totalIssued)} of total`, icon: ShieldAlert, tone: 'red' },
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
