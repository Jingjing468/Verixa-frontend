import { useEffect, useState } from 'react'
import { Bell, ChevronDown, LogOut, Menu, Settings, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError, apiRequest, clearAuthToken } from '../../api/client'
import type { ProfileResponse } from '../../api/types'

interface DashboardHeaderProps {
  onMenu: () => void
  unreadNotifications: number
}

function DashboardHeader({ onMenu, unreadNotifications }: DashboardHeaderProps) {
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [profile, setProfile] = useState<ProfileResponse['profile'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState(false)

  useEffect(() => {
    let active = true
    let request = 0
    const loadProfile = async () => {
      const currentRequest = ++request
      try {
        const response = await apiRequest<ProfileResponse>('/profile', { auth: true })
        if (!active || currentRequest !== request) return
        setProfile(response.profile)
        setProfileError(false)
      } catch (error) {
        if (!active || currentRequest !== request) return
        if (error instanceof ApiError && error.status === 401) {
          clearAuthToken()
          navigate('/login', { replace: true })
        } else { setProfileError(true) }
      } finally {
        if (active && currentRequest === request) setLoading(false)
      }
    }
    loadProfile()
    window.addEventListener('verixa:profile-updated', loadProfile)
    return () => {
      active = false
      window.removeEventListener('verixa:profile-updated', loadProfile)
    }
  }, [navigate])

  const avatarUrl = profile?.avatarUrl
  const initials = profile?.fullName.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase() || '?'

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
      </div>
      <div className="header-right">
        <Link
          to="/notifications"
          className="notification-button"
          aria-label={`${unreadNotifications} unread notifications`}
        >
          <Bell size={20} />
          {unreadNotifications > 0 && <i />}
        </Link>
        <div className="header-profile-wrap">
          <button className="profile-button" onClick={() => setProfileOpen(!profileOpen)}>
            <span>{avatarUrl ? <img src={avatarUrl} alt="Your profile photo" /> : initials}</span>
            <div>
              <b>{profile?.fullName ?? (loading ? 'Loading...' : 'Profile unavailable')}</b>
              <small>{profile?.organization.name ?? (profileError ? 'Could not load your account' : '')}</small>
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
