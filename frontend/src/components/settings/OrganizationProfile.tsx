import { Camera, Globe, MapPin, Mail, Phone, Building2 } from 'lucide-react'
import type { OrganizationSettings } from '../../types/settings'

interface Props {
  org: OrganizationSettings
  onChange: (org: OrganizationSettings) => void
}

function OrganizationProfile({ org, onChange }: Props) {
  const update = (field: keyof OrganizationSettings, value: string) => {
    onChange({ ...org, [field]: value })
  }

  return (
    <div className="settings-section-enter">
      <div className="settings-section-header">
        <h2>Organization Profile</h2>
        <p>Information shown on certificates issued by your organization.</p>
      </div>

      <div className="settings-card">
        <div className="settings-form-grid">
          <div className="settings-field">
            <label>
              <Building2 size={14} />
              Organization Name
            </label>
            <input
              type="text"
              value={org.name}
              onChange={(e) => update('name', e.target.value)}
            />
          </div>

          <div className="settings-field">
            <label>
              <Mail size={14} />
              Organization Email
            </label>
            <input
              type="email"
              value={org.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </div>

          <div className="settings-field">
            <label>
              <Globe size={14} />
              Website
            </label>
            <input
              type="url"
              value={org.website}
              onChange={(e) => update('website', e.target.value)}
            />
          </div>

          <div className="settings-field">
            <label>
              <Phone size={14} />
              Phone
            </label>
            <input
              type="tel"
              value={org.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
          </div>

          <div className="settings-field">
            <label>
              <MapPin size={14} />
              Address
            </label>
            <input
              type="text"
              value={org.address}
              onChange={(e) => update('address', e.target.value)}
            />
          </div>

          <div className="settings-field full-width">
            <label>Organization Description</label>
            <textarea
              value={org.description}
              onChange={(e) => update('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="settings-field full-width">
            <label>Organization Logo</label>
            <div className="settings-upload-zone">
              {org.logoUrl ? (
                <div className="settings-logo-preview">
                  <div className="settings-logo-placeholder">
                    <Building2 size={24} />
                  </div>
                </div>
              ) : (
                <div className="settings-logo-placeholder large">
                  <Building2 size={28} />
                </div>
              )}
              <div className="settings-upload-info">
                <span>Click to upload or drag and drop</span>
                <small>PNG, JPG or SVG (max 2MB)</small>
              </div>
              <Camera size={18} className="settings-upload-icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrganizationProfile
