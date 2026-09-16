import { FileCheck2, FileX2 } from 'lucide-react'

interface Activity {
  id: string
  text: string
  time: string
  type: 'issue' | 'revoke'
}

interface Props {
  activities: Activity[]
}

export default function RecentReportActivity({ activities }: Props) {
  return (
    <article className="report-chart-card recent-activity-card">
      <div className="report-chart-header">
        <div>
          <h2>Recent Activity</h2>
          <p>Latest certificate events and system activity.</p>
        </div>
      </div>
      <div className="activity-feed">
        {activities.length > 0 ? (
          activities.map((activity, i) => {
            const isRevoke = activity.type === 'revoke'
            const Icon = isRevoke ? FileX2 : FileCheck2

            return (
              <div key={activity.id} className="activity-feed-item" style={{ animationDelay: `${i * 50}ms` }}>
                <span
                  className="activity-feed-icon"
                  style={{
                    color: isRevoke ? '#db5569' : '#3474ff',
                    background: isRevoke ? '#ffeaee' : '#eaf0ff',
                  }}
                >
                  <Icon size={15} />
                </span>
                <div>
                  <b>{activity.text}</b>
                  <small>{activity.time}</small>
                </div>
              </div>
            )
          })
        ) : (
          <div className="report-empty-state">
            <b>No report activity yet</b>
            <span>Certificate events will appear after you issue or revoke credentials.</span>
          </div>
        )}
      </div>
    </article>
  )
}
