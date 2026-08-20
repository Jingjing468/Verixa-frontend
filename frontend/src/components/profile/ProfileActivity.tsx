import { FileCheck2, FileX2, Pencil, Settings, LogIn } from 'lucide-react'
import type { ProfileActivity as ActivityType } from '../../types/profile'

const activities: ActivityType[] = [
  { id: 'a1', type: 'issue', title: 'Issued certificate', description: 'CERT-2026-0001248', timestamp: '10 minutes ago' },
  { id: 'a2', type: 'update', title: 'Updated certificate', description: 'CERT-2026-0001246', timestamp: '2 hours ago' },
  { id: 'a3', type: 'revoke', title: 'Revoked certificate', description: 'CERT-2026-0001245', timestamp: 'Yesterday' },
  { id: 'a4', type: 'settings', title: 'Updated organization settings', timestamp: '2 days ago' },
  { id: 'a5', type: 'login', title: 'Logged in from Chrome on macOS', timestamp: '3 days ago' },
]

const iconMap: Record<string, typeof FileCheck2> = {
  issue: FileCheck2,
  update: Pencil,
  revoke: FileX2,
  settings: Settings,
  login: LogIn,
}

const colorMap: Record<string, { color: string; bg: string }> = {
  issue: { color: '#3474ff', bg: '#eaf0ff' },
  update: { color: '#7a65e8', bg: '#f0ecff' },
  revoke: { color: '#db5569', bg: '#ffeaee' },
  settings: { color: '#8b96a8', bg: '#f3f6fa' },
  login: { color: '#23a26d', bg: '#e7f8f0' },
}

export default function ProfileActivity() {
  return (
    <article className="profile-card">
      <div className="profile-card-header">
        <h2>Recent Activity</h2>
      </div>
      <div className="profile-timeline">
        {activities.map((a, i) => {
          const Icon = iconMap[a.type]
          const colors = colorMap[a.type]
          return (
            <div key={a.id} className="profile-timeline-item" style={{ animationDelay: `${i * 60}ms` }}>
              <span className="profile-timeline-icon" style={{ color: colors.color, background: colors.bg }}>
                <Icon size={14} />
              </span>
              <div className="profile-timeline-content">
                <b>{a.title}</b>
                {a.description && <span>{a.description}</span>}
              </div>
              <small>{a.timestamp}</small>
            </div>
          )
        })}
      </div>
    </article>
  )
}
