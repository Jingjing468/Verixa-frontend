import { FileCheck2, FileX2, ShieldCheck, FileText } from 'lucide-react'

const activities = [
  { text: '12 certificates issued', time: '2 hours ago', type: 'issue' as const, icon: FileCheck2, color: '#3474ff', bg: '#eaf0ff' },
  { text: 'Certificate CERT-2026-0001245 revoked', time: '4 hours ago', type: 'revoke' as const, icon: FileX2, color: '#db5569', bg: '#ffeaee' },
  { text: '86 certificate verifications', time: 'Today', type: 'verify' as const, icon: ShieldCheck, color: '#23a26d', bg: '#e7f8f0' },
  { text: 'Weekly certificate report generated', time: 'Yesterday', type: 'report' as const, icon: FileText, color: '#7a65e8', bg: '#f0ecff' },
  { text: '8 certificates issued', time: 'Yesterday', type: 'issue' as const, icon: FileCheck2, color: '#3474ff', bg: '#eaf0ff' },
  { text: '102 certificate verifications', time: '2 days ago', type: 'verify' as const, icon: ShieldCheck, color: '#23a26d', bg: '#e7f8f0' },
]

export default function RecentReportActivity() {
  return (
    <article className="report-chart-card recent-activity-card">
      <div className="report-chart-header">
        <div>
          <h2>Recent Activity</h2>
          <p>Latest certificate events and system activity.</p>
        </div>
      </div>
      <div className="activity-feed">
        {activities.map((a, i) => {
          const Icon = a.icon
          return (
            <div key={i} className="activity-feed-item" style={{ animationDelay: `${i * 50}ms` }}>
              <span className="activity-feed-icon" style={{ color: a.color, background: a.bg }}>
                <Icon size={15} />
              </span>
              <div>
                <b>{a.text}</b>
                <small>{a.time}</small>
              </div>
            </div>
          )
        })}
      </div>
    </article>
  )
}
