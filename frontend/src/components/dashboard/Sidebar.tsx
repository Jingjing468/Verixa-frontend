import { BarChart3, Bell, FileCheck2, FilePlus2, LayoutDashboard, LogOut, Settings, ShieldCheck, UserRound, UsersRound, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import verixaLogo from '../../assets/verixaicon.png'

interface SidebarProps {
  open: boolean
  onClose: () => void
  unreadNotifications: number
}

interface SidebarItem {
  label: string
  path: string
  icon: LucideIcon
  exact?: boolean
}

const items: SidebarItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Certificates', path: '/certificates', icon: FileCheck2 },
  { label: 'Issue Certificate', path: '/certificates/create', icon: FilePlus2, exact: true },
  { label: 'Recipients', path: '/recipients', icon: UsersRound, exact: true },
  { label: 'Revoked Certificates', path: '/certificates?status=revoked', icon: ShieldCheck },
  { label: 'Reports', path: '/reports', icon: BarChart3, exact: true },
  { label: 'Notifications', path: '/notifications', icon: Bell, exact: true },
  { label: 'Settings', path: '/settings', icon: Settings, exact: true },
  { label: 'Profile', path: '/profile', icon: UserRound, exact: true },
]

function isActive(pathname: string, item: SidebarItem) {
  if (item.exact) return pathname === item.path
  // For /certificates, also match /certificates/* but not /certificates/create
  if (item.path === '/certificates') {
    return pathname.startsWith('/certificates') && !pathname.startsWith('/certificates/create')
  }
  return pathname.startsWith(item.path)
}

function Sidebar({ open, onClose, unreadNotifications }: SidebarProps) {
  const { pathname } = useLocation()
  // Handle query params for revoked filter
  const fullSearch = typeof window !== 'undefined' ? window.location.search : ''
  const currentPath = pathname + fullSearch

  return (
    <>
      <div
        className={`dashboard-overlay ${open ? 'visible' : ''}`}
        onClick={onClose}
      />
      <aside className={`dashboard-sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <img src={verixaLogo} alt="Verixa" className="sidebar-logo" />
          <button onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <p className="sidebar-subtitle">Organization Portal</p>

        <nav className="sidebar-nav">
          {items.map((item) => {
            const Icon = item.icon
            const active = item.path.includes('?')
              ? currentPath === item.path
              : isActive(pathname, item)
            return (
              <Link
                to={item.path}
                className={active ? 'active' : ''}
                key={item.label}
                onClick={onClose}
              >
                <Icon size={19} />
                {item.label}
                {item.path === '/notifications' && unreadNotifications > 0 && (
                  <span className="sidebar-badge">{unreadNotifications > 99 ? '99+' : unreadNotifications}</span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="security-card">
            <span>
              <ShieldCheck size={19} />
            </span>
            <div>
              <b>Blockchain Secured</b>
              <p>Your certificate records are protected by immutable verification.</p>
            </div>
          </div>
          <Link className="sidebar-logout" to="/login" onClick={onClose}>
            <LogOut size={17} /> Log Out
          </Link>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
