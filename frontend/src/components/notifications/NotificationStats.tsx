import { Bell, CalendarDays, Clock } from 'lucide-react'

interface Props {
  unread: number
  today: number
  thisWeek: number
}

export default function NotificationStats({ unread, today, thisWeek }: Props) {
  const stats = [
    { label: 'Unread', value: unread, icon: Bell, tone: 'blue' },
    { label: 'Today', value: today, icon: CalendarDays, tone: 'green' },
    { label: 'This Week', value: thisWeek, icon: Clock, tone: 'orange' },
  ]

  return (
    <section className="notif-stats">
      {stats.map((s, i) => {
        const Icon = s.icon
        return (
          <article key={s.label} className="notif-stat-card" style={{ animationDelay: `${i * 70}ms` }}>
            <span className={`notif-stat-icon ${s.tone}`}>
              <Icon size={17} />
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
