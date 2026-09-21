import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, CheckCheck, Eye, FileCheck2,
  Mail, ShieldCheck, Settings, Trash2, Ellipsis, Server,
} from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import NotificationStats from '../components/notifications/NotificationStats'
import NotificationFilters from '../components/notifications/NotificationFilters'
import NotificationEmptyState from '../components/notifications/NotificationEmptyState'
import type { NotificationItem, NotificationFilter, NotificationCategory } from '../types/notification'
import { apiRequest } from '../api/client'
import type { NotificationsResponse, NotificationSummary } from '../api/types'

const categoryIcons: Record<NotificationCategory, typeof Bell> = {
  certificate: FileCheck2,
  email: Mail,
  security: ShieldCheck,
  system: Server,
}

const categoryColors: Record<NotificationCategory, { color: string; bg: string }> = {
  certificate: { color: '#3474ff', bg: '#eaf0ff' },
  email: { color: '#7a65e8', bg: '#f0ecff' },
  security: { color: '#dd8b23', bg: '#fff3df' },
  system: { color: '#8b96a8', bg: '#f3f6fa' },
}

const categoryLabels: Record<NotificationCategory, string> = {
  certificate: 'Certificate',
  email: 'Email',
  security: 'Security',
  system: 'System',
}

const toCategory = (type: NotificationSummary['type']): NotificationCategory => {
  if (type === 'email_delivery_failed') return 'email'
  if (type.startsWith('certificate_')) return 'certificate'
  return 'system'
}

const toTimeGroup = (createdAt: string): NotificationItem['timeGroup'] => {
  const created = new Date(createdAt)
  const now = new Date()
  const ageDays = Math.floor((now.getTime() - created.getTime()) / 86400000)
  if (ageDays <= 0) return 'today'
  if (ageDays === 1) return 'yesterday'
  return 'earlier'
}

const toNotificationItem = (notification: NotificationSummary): NotificationItem => ({
  id: notification.id,
  title: notification.title,
  message: notification.message,
  category: toCategory(notification.type),
  timestamp: new Date(notification.createdAt).toLocaleString(),
  timeGroup: toTimeGroup(notification.createdAt),
  unread: !notification.isRead,
})

const refreshNotificationBadges = () => {
  window.dispatchEvent(new Event('verixa:notifications-updated'))
}

export default function Notifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 2000)
  }

  const loadNotifications = () => {
    apiRequest<NotificationsResponse>('/notifications', { auth: true })
      .then((response) => setNotifications(response.notifications.map(toNotificationItem)))
      .catch((requestError) => showToast(requestError instanceof Error ? requestError.message : 'Could not load notifications'))
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const unreadCount = notifications.filter((n) => n.unread).length
  const todayCount = notifications.filter((n) => n.timeGroup === 'today').length
  const weekCount = notifications.length

  const filtered = filter === 'all'
    ? notifications
    : notifications.filter((n) => n.category === filter)

  const groups = [
    { label: 'Today', items: filtered.filter((n) => n.timeGroup === 'today') },
    { label: 'Yesterday', items: filtered.filter((n) => n.timeGroup === 'yesterday') },
    { label: 'Earlier', items: filtered.filter((n) => n.timeGroup === 'earlier') },
  ].filter((g) => g.items.length > 0)

  const markAllRead = () => {
    apiRequest('/notifications/read-all', { method: 'PATCH', auth: true })
      .then(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
        refreshNotificationBadges()
        showToast('All notifications marked as read.')
      })
      .catch((requestError) => showToast(requestError instanceof Error ? requestError.message : 'Could not update notifications'))
  }

  const markRead = (id: string) => {
    apiRequest(`/notifications/${id}/read`, { method: 'PATCH', auth: true })
      .then(() => {
        setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, unread: false } : n))
        refreshNotificationBadges()
        setActiveMenu(null)
      })
      .catch((requestError) => showToast(requestError instanceof Error ? requestError.message : 'Could not update notification'))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    setActiveMenu(null)
    showToast('Notification hidden locally.')
  }

  return (
    <DashboardLayout>
      <div className="dashboard-content" onClick={() => setActiveMenu(null)}>
        <header className="dashboard-welcome dashboard-enter">
          <div>
            <p>Activity</p>
            <h1>Notifications</h1>
            <span>Stay updated on certificate activity, delivery status, and account events.</span>
          </div>
          <button className="cancel-action" onClick={markAllRead}>
            <CheckCheck size={15} /> Mark All as Read
          </button>
        </header>

        <NotificationStats unread={unreadCount} today={todayCount} thisWeek={weekCount} />
        <NotificationFilters active={filter} onChange={setFilter} />

        <section className="notif-list-card">
          {groups.length > 0 ? (
            groups.map((group) => (
              <div key={group.label} className="notif-group">
                <h3 className="notif-group-label">{group.label}</h3>
                {group.items.map((n, i) => {
                  const Icon = categoryIcons[n.category]
                  const colors = categoryColors[n.category]
                  return (
                    <div
                      key={n.id}
                      className={`notif-row ${n.unread ? 'unread' : ''} ${activeMenu === n.id ? 'menu-open' : ''}`}
                      style={{ animationDelay: `${i * 40}ms` }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="notif-icon" style={{ color: colors.color, background: colors.bg }}>
                        <Icon size={17} />
                      </span>
                      <div className="notif-content">
                        <div className="notif-title-row">
                          <b>{n.title}</b>
                          {n.unread && <span className="notif-dot" />}
                          <span className="notif-badge" style={{ color: colors.color, background: colors.bg }}>
                            {categoryLabels[n.category]}
                          </span>
                        </div>
                        <p>{n.message}</p>
                        <small>{n.timestamp}</small>
                      </div>
                      <div className="notif-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="notif-menu-trigger"
                          onClick={() => setActiveMenu(activeMenu === n.id ? null : n.id)}
                          aria-label="Notification actions"
                          aria-expanded={activeMenu === n.id}
                        >
                          <Ellipsis size={16} />
                        </button>
                        {activeMenu === n.id && (
                          <div className="notif-action-menu">
                            <button onClick={() => markRead(n.id)}>
                              <Eye size={14} /> Mark as Read
                            </button>
                            <button className="notif-delete" onClick={() => deleteNotification(n.id)}>
                              <Trash2 size={14} /> Hide
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))
          ) : (
            <NotificationEmptyState />
          )}
        </section>

        <div className="notif-prefs-card">
          <div className="notif-prefs-header">
            <Settings size={16} />
            <b>Notification Preferences</b>
          </div>
          <div className="notif-prefs-list">
            <div className="notif-pref-row"><span>Certificate alerts</span><span className="notif-pref-on">On</span></div>
            <div className="notif-pref-row"><span>Email alerts</span><span className="notif-pref-on">On</span></div>
            <div className="notif-pref-row"><span>Security alerts</span><span className="notif-pref-on">On</span></div>
          </div>
          <button className="notif-prefs-link" onClick={() => navigate('/settings')}>
            Manage Preferences
          </button>
        </div>

        <footer className="dashboard-footer">
          <span>© 2026 Verixa. All rights reserved.</span>
          <span><i /> Blockchain Network: Ethereum Sepolia</span>
        </footer>
      </div>

      {toast && (
        <div className="detail-toast">
          <CheckCheck size={15} /> {toast}
        </div>
      )}
    </DashboardLayout>
  )
}
