import { Building2, Bell, Palette, Shield, User } from 'lucide-react'
import type { SettingsSection } from '../../types/settings'

interface SettingsNavigationProps {
  active: SettingsSection
  onChange: (section: SettingsSection) => void
}

const sections: Array<{ id: SettingsSection; label: string; icon: typeof Building2 }> = [
  { id: 'organization', label: 'Organization Profile', icon: Building2 },
  { id: 'profile', label: 'Personal Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'preferences', label: 'Preferences', icon: Palette },
]

function SettingsNavigation({ active, onChange }: SettingsNavigationProps) {
  return (
    <nav className="settings-nav">
      {sections.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={`settings-nav-item ${active === id ? 'active' : ''}`}
          onClick={() => onChange(id)}
        >
          <Icon size={17} />
          {label}
        </button>
      ))}
    </nav>
  )
}

export default SettingsNavigation
