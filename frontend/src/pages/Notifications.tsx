import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, CheckCheck, CircleAlert, Copy, Eye, FileCheck2, FileX2,
  Mail, MailX, ShieldCheck, Settings, Trash2, Ellipsis, Server,
} from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import NotificationStats from '../components/notifications/NotificationStats'
import NotificationFilters from '../components/notifications/NotificationFilters'
import NotificationEmptyState from '../components/notifications/NotificationEmptyState'
import type { NotificationItem, NotificationFilter, NotificationCategory } from '../types/notification'

const initialNotifications: NotificationItem[] = [
  { id: 'n1', title: 'Certificate Issued', message: 'CERT-2026-0001248 was successfully issued to Lim Potkolbotey.', category: 'certificate', timestamp: '2 minutes ago', timeGroup: 'today', unread: true, certificateId: 'CERT-2026-0001248' },
  { id: 'n2', title: 'Email Delivered', message: 'The certificate email was successfully delivered to lim@example.com.', category: 'email', timestamp: '10 minutes ago', timeGroup: 'today', unread: false },
  { id: 'n3', title: 'Certificate Revoked', message: 'CERT-2026-0001245 was revoked by Admin User.', category: 'certificate', timestamp: '1 hour ago', timeGroup: 'today', unread: true, certificateId: 'CERT-2026-0001245' },
  { id: 'n4', title: 'Certificate Expiring Soon', message: 'CERT-2026-0001198 will expire in 7 days.', category: 'certificate', timestamp: '3 hours ago', timeGroup: 'today', unread: false, certificateId: 'CERT-2026-0001198' },
  { id: 'n5', title: 'Certificate Issued', message: 'CERT-2026-0001247 was successfully issued to Yean Sreymom.', category: 'certificate', timestamp: '5 hours ago', timeGroup: 'today', unread: false, certificateId: 'CERT-2026-0001247' },
  { id: 'n6', title: 'Email Delivered', message: 'The certificate email was delivered to sreymom@example.com.', category: 'email', timestamp: '5 hours ago', timeGroup: 'today', unread: false },
  { id: 'n7', title: 'Verification Successful', message: 'Certificate CERT-2026-0001248 was verified by a public user.', category: 'certificate', timestamp: '6 hours ago', timeGroup: 'today', unread: false, certificateId: 'CERT-2026-0001248' },
  { id: 'n8', title: 'Email Delivered', message: 'Batch email delivery completed — 12 of 12 successful.', category: 'email', timestamp: '8 hours ago', timeGroup: 'today', unread: false },
  { id: 'n9', title: 'Login Detected', message: 'A new login was detected from Chrome on macOS.', category: 'security', timestamp: 'Yesterday', timeGroup: 'yesterday', unread: false },
  { id: 'n10', title: 'Email Delivery Failed', message: 'We could not deliver a certificate email to recipient@example.com.', category: 'email', timestamp: 'Yesterday', timeGroup: 'yesterday', unread: true },
  { id: 'n11', title: 'Certificate Issued', message: 'CERT-2026-0001246 was issued to Dara Vimean.', category: 'certificate', timestamp: 'Yesterday', timeGroup: 'yesterday', unread: false, certificateId: 'CERT-2026-0001246' },
  { id: 'n12', title: 'Weekly Report Generated', message: 'Your weekly certificate activity report is ready.', category: 'system', timestamp: 'Yesterday', timeGroup: 'yesterday', unread: false },
  { id: 'n13', title: 'System Update', message: 'Verixa certificate verification service was updated successfully.', category: 'system', timestamp: '2 days ago', timeGroup: 'earlier', unread: false },
  { id: 'n14', title: 'Password Changed', message: 'Your account password was changed successfully.', category: 'security', timestamp: '3 days ago', timeGroup: 'earlier', unread: false },
  { id: 'n15', title: 'Certificate Revoked', message: 'CERT-2026-0001200 was revoked by Admin User.', category: 'certificate', timestamp: '4 days ago', timeGroup: 'earlier', unread: false, certificateId: 'CERT-2026-0001200' },
]

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

export default function Notifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(initialNotifications)
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 2000)
  }

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
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
    showToast('All notifications marked as read.')
  }

  const toggleRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, unread: !n.unread } : n))
    setActiveMenu(null)
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    setActiveMenu(null)
  }

  const handleViewCert = (certId: string) => {
    navigate(`/certificates/${certId}`)
  }

  return (
    <DashboardLayout>
      <div className="dashboard-content" onClick={() => setActiveMenu(null)}>
        {/* Header */}
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

        {/* Notification list */}
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
                      className={`notif-row ${n.unread ? 'unread' : ''}`}
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
                        >
                          <Ellipsis size={16} />
                        </button>
                        {activeMenu === n.id && (
                          <div className="notif-action-menu">
                            <button onClick={() => toggleRead(n.id)}>
                              <Eye size={14} /> {n.unread ? 'Mark as Read' : 'Mark as Unread'}
                            </button>
                            {n.certificateId && (
                              <button onClick={() => handleViewCert(n.certificateId!)}>
                                <FileCheck2 size={14} /> View Certificate
                              </button>
                            )}
                            <button className="notif-delete" onClick={() => deleteNotification(n.id)}>
                              <Trash2 size={14} /> Delete
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

        {/* Preferences sidebar card */}
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
            Manage Preferences →
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
