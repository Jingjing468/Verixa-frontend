import { BellOff } from 'lucide-react'

export default function NotificationEmptyState() {
  return (
    <div className="notif-empty">
      <BellOff size={40} />
      <h3>No notifications here</h3>
      <p>You're all caught up.</p>
    </div>
  )
}
