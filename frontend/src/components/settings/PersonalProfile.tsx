import { useRef, useState } from 'react'
import { Camera, Mail, Phone, Briefcase, User } from 'lucide-react'
import type { PersonalProfile as PersonalProfileType } from '../../types/settings'

interface Props {
  profile: PersonalProfileType
  onChange: (p: PersonalProfileType) => void
}

function PersonalProfile({ profile, onChange }: Props) {
  const photoInput = useRef<HTMLInputElement>(null)
  const [photoError, setPhotoError] = useState('')
  const uploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setPhotoError('')
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setPhotoError('Choose a PNG, JPG or WebP image up to 2MB.')
      return
    }
    const url = URL.createObjectURL(file)
    try {
      const image = new Image()
      image.src = url
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 256
      const size = Math.min(image.naturalWidth, image.naturalHeight)
      canvas.getContext('2d')!.drawImage(image, (image.naturalWidth-size)/2, (image.naturalHeight-size)/2, size, size, 0, 0, 256, 256)
      onChange({ ...profile, avatarUrl: canvas.toDataURL('image/png') })
    } catch { setPhotoError('Could not read this image. Please choose another file.') }
    finally { URL.revokeObjectURL(url) }
  }
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
              {profile.avatarUrl ? <img src={profile.avatarUrl} alt={`${profile.fullName} profile photo`} /> : (profile.fullName ? profile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AU')}
            </div>
            <input ref={photoInput} type="file" accept="image/png,image/jpeg,image/webp" hidden aria-label="Upload profile photo" onChange={uploadPhoto} />
            <button type="button" onClick={() => photoInput.current?.click()} className="settings-avatar-edit" aria-label="Change profile photo">
              <Camera size={14} />
            </button>
          </div>
          <div className="settings-avatar-info">
            <h4>{profile.fullName || 'Admin User'}</h4>
            <p>{profile.role}</p>
          </div>
        </div>

        {photoError && <p className="field-error" role="alert">{photoError}</p>}
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
