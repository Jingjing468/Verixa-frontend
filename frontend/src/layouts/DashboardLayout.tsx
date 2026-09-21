import { useCallback, useEffect, useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import { apiRequest } from '../api/client'
import type { NotificationsResponse } from '../api/types'

interface Props {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  const loadUnreadNotifications = useCallback(() => {
    apiRequest<NotificationsResponse>('/notifications', { auth: true })
      .then((response) => {
        setUnreadNotifications(response.notifications.filter((item) => !item.isRead).length)
      })
      .catch(() => setUnreadNotifications(0))
  }, [])

  useEffect(() => {
    loadUnreadNotifications()
    window.addEventListener('verixa:notifications-updated', loadUnreadNotifications)
    return () => window.removeEventListener('verixa:notifications-updated', loadUnreadNotifications)
  }, [loadUnreadNotifications])

  return (
    <div className="dashboard-page">
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        unreadNotifications={unreadNotifications}
      />
      <main className="dashboard-main">
        <DashboardHeader
          onMenu={() => setMenuOpen(true)}
          unreadNotifications={unreadNotifications}
        />
        {children}
      </main>
    </div>
  )
}
