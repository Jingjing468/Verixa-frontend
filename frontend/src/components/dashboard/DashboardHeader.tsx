import { useEffect, useState } from 'react'
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest, clearAuthToken } from '../../api/client'
import type { ApiOrganization, ApiUser } from '../../api/types'

interface DashboardHeaderProps {
  onMenu: () => void
}

function DashboardHeader({ onMenu }: DashboardHeaderProps) {
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [user, setUser] = useState<ApiUser | null>(null)
  const [organization, setOrganization] = useState<ApiOrganization | null>(null)

  useEffect(() => {
    apiRequest<{ success: true; user: ApiUser; organization: ApiOrganization }>('/auth/me', { auth: true })
      .then((response) => {
        setUser(response.user)
        setOrganization(response.organization)
      })
      .catch(() => {
        setUser(null)
        setOrganization(null)
      })
  }, [])

  const initials = (user?.fullName ?? 'Admin User')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleLogout = () => {
    clearAuthToken()
    setProfileOpen(false)
    navigate('/login')
  }

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="menu-button" onClick={onMenu} aria-label="Open navigation">
          <Menu size={21} />
        </button>
        <label className="dashboard-search">
          <Search size={18} />
          <input placeholder="Search certificates..." />
        </label>
      </div>
      <div className="header-right">
        <Link to="/notifications" className="notification-button" aria-label="Notifications">
          <Bell size={20} />
          <i />
        </Link>
        <div className="header-profile-wrap">
          <button className="profile-button" onClick={() => setProfileOpen(!profileOpen)}>
            <span>{initials}</span>
            <div>
              <b>{user?.fullName ?? 'Admin User'}</b>
              <small>{organization?.name ?? 'Organization Admin'}</small>
            </div>
            <ChevronDown size={16} />
          </button>
          {profileOpen && (
            <div className="profile-dropdown">
              <Link to="/profile" onClick={() => setProfileOpen(false)}>
                <UserRound size={14} /> My Profile
              </Link>
              <Link to="/settings" onClick={() => setProfileOpen(false)}>
                <Settings size={14} /> Settings
              </Link>
              <button onClick={handleLogout}>
                <LogOut size={14} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
