import { X } from 'lucide-react'
import { useState } from 'react'
import type { UserProfile } from '../../types/profile'

interface Props {
  user: UserProfile
  onClose: () => void
  onSave: (updated: UserProfile) => void
}

export default function EditProfileModal({ user, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    fullName: user.fullName,
    phone: user.phone,
    jobTitle: user.jobTitle,
    location: user.location,
    timezone: user.timezone,
  })

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    onSave({ ...user, ...form })
  }

  return (
    <div className="success-backdrop" onClick={onClose}>
      <div className="profile-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-edit-header">
          <h2>Edit Profile</h2>
          <button className="profile-edit-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="profile-edit-form">
          <label className="settings-field">
            Full Name
            <input value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
          </label>
          <label className="settings-field">
            Email (read-only)
            <input value={user.email} readOnly className="settings-field-disabled" />
          </label>
          <label className="settings-field">
            Phone
            <input value={form.phone} onChange={(e) => update('phone', e.target.value)} />
          </label>
          <label className="settings-field">
            Job Title
            <input value={form.jobTitle} onChange={(e) => update('jobTitle', e.target.value)} />
          </label>
          <label className="settings-field">
            Location
            <input value={form.location} onChange={(e) => update('location', e.target.value)} />
          </label>
          <label className="settings-field">
            Timezone
            <select value={form.timezone} onChange={(e) => update('timezone', e.target.value)}>
              <option>Asia/Phnom_Penh</option>
              <option>America/New_York</option>
              <option>Europe/London</option>
              <option>Asia/Tokyo</option>
            </select>
          </label>
        </div>

        <div className="profile-edit-actions">
          <button className="cancel-action" onClick={onClose}>Cancel</button>
          <button className="issue-action" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  )
}
