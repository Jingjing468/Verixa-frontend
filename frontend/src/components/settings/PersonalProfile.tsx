import { Camera, Mail, Phone, Briefcase, User } from 'lucide-react'
import type { PersonalProfile as PersonalProfileType } from '../../types/settings'

interface Props {
  profile: PersonalProfileType
  onChange: (p: PersonalProfileType) => void
}

function PersonalProfile({ profile, onChange }: Props) {
  const update = (field: keyof PersonalProfileType, value: string) => {
    onChange({ ...profile, [field]: value })
  }

  return (
    <div className="settings-section-enter">
      <div className="settings-section-header">
        <h2>Personal Profile</h2>
        <p>Manage your personal account information.</p>
      </div>

      <div className="settings-card">
        <div className="settings-avatar-section">
          <div className="settings-avatar-wrapper">
            <div className="settings-avatar">
              {profile.fullName ? profile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AU'}
            </div>
            <button className="settings-avatar-edit" aria-label="Change profile photo">
              <Camera size={14} />
            </button>
          </div>
          <div className="settings-avatar-info">
            <h4>{profile.fullName || 'Admin User'}</h4>
            <p>{profile.role}</p>
          </div>
        </div>

        <div className="settings-form-grid">
          <div className="settings-field">
            <label>
              <User size={14} />
              Full Name
            </label>
            <input
              type="text"
              value={profile.fullName}
              onChange={(e) => update('fullName', e.target.value)}
            />
          </div>

          <div className="settings-field">
            <label>
              <Mail size={14} />
              Email Address
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </div>

          <div className="settings-field">
            <label>Role</label>
            <input
              type="text"
              value={profile.role}
              disabled
              className="settings-field-disabled"
            />
            <span className="settings-field-helper">Contact support to change your role.</span>
          </div>

          <div className="settings-field">
            <label>
              <Phone size={14} />
              Phone Number
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
          </div>

          <div className="settings-field full-width">
            <label>
              <Briefcase size={14} />
              Job Title
            </label>
            <input
              type="text"
              value={profile.jobTitle}
              onChange={(e) => update('jobTitle', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonalProfile
