import { FileCheck2, FileX, Clock, MailWarning, ShieldAlert, BarChart3 } from 'lucide-react'
import type { NotificationSettings as NotificationSettingsType } from '../../types/settings'

interface Props {
  notifications: NotificationSettingsType
  onChange: (n: NotificationSettingsType) => void
}

const toggles: Array<{
  key: keyof NotificationSettingsType
  label: string
  description: string
  icon: typeof FileCheck2
}> = [
  {
    key: 'certificateIssued',
    label: 'Certificate Issued',
    description: 'Notify me when a new certificate is successfully issued.',
    icon: FileCheck2,
  },
  {
    key: 'certificateRevoked',
    label: 'Certificate Revoked',
    description: 'Notify me when a certificate is revoked.',
    icon: FileX,
  },
  {
    key: 'certificateExpiring',
    label: 'Certificate Expiring',
    description: 'Receive reminders before certificates expire.',
    icon: Clock,
  },
  {
    key: 'emailFailure',
    label: 'Email Delivery Failed',
    description: 'Notify me when a recipient email cannot be delivered.',
    icon: MailWarning,
  },
  {
    key: 'securityAlerts',
    label: 'Security Alerts',
    description: 'Important login and security notifications.',
    icon: ShieldAlert,
  },
  {
    key: 'weeklyReport',
    label: 'Weekly Report',
    description: 'Receive a weekly certificate activity summary.',
    icon: BarChart3,
  },
]

function NotificationSettings({ notifications, onChange }: Props) {
  const toggle = (key: keyof NotificationSettingsType) => {
    onChange({ ...notifications, [key]: !notifications[key] })
  }

  return (
    <div className="settings-section-enter">
      <div className="settings-section-header">
        <h2>Notification Preferences</h2>
        <p>Choose which notifications you'd like to receive.</p>
      </div>

      <div className="settings-card">
        <div className="settings-toggle-list">
          {toggles.map(({ key, label, description, icon: Icon }) => (
            <div className="settings-toggle-row" key={key}>
              <div className="settings-toggle-icon">
                <Icon size={17} />
              </div>
              <div className="settings-toggle-text">
                <strong>{label}</strong>
                <span>{description}</span>
              </div>
              <button
                className={`settings-toggle ${notifications[key] ? 'on' : 'off'}`}
                onClick={() => toggle(key)}
                role="switch"
                aria-checked={notifications[key]}
                aria-label={`Toggle ${label}`}
              >
                <span className="settings-toggle-knob" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NotificationSettings
