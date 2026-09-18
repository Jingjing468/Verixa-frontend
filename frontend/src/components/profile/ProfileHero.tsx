import { useRef } from 'react'
import { Camera, Pencil, ShieldCheck } from 'lucide-react'
import type { UserProfile } from '../../types/profile'

interface Props {
  user: UserProfile
  onEdit: () => void
  avatarUrl?: string | null
  onAvatarChange: (url: string) => void
}

export default function ProfileHero({ user, onEdit, avatarUrl, onAvatarChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const initials = user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      window.alert('Choose a PNG, JPG or WebP image up to 2MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') onAvatarChange(reader.result)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <article className="profile-hero dashboard-enter">
      <div className="profile-hero-left">
        <div className="profile-avatar-large">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className="profile-avatar-img" />
          ) : (
            initials
          )}
          <button className="profile-avatar-btn" aria-label="Change photo" onClick={() => fileRef.current?.click()}>
            <Camera size={14} />
          </button>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="profile-avatar-input" onChange={handleFile} />
        </div>
      </div>
      <div className="profile-hero-center">
        <h1>{user.fullName}</h1>
        <p className="profile-role">{user.role}</p>
        <p className="profile-org">{user.organization}</p>
        <p className="profile-email">{user.email}</p>
        <div className="profile-meta">
          <span className="profile-active-badge">
            <ShieldCheck size={12} /> Active
          </span>
          <span className="profile-member">Member since {user.memberSince}</span>
        </div>
      </div>
      <div className="profile-hero-right">
        <button className="issue-action" onClick={onEdit}>
          <Pencil size={15} /> Edit Profile
        </button>
      </div>
    </article>
  )
}
