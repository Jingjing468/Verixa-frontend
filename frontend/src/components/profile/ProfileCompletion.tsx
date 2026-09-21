import { Camera, ShieldCheck } from 'lucide-react'

export default function ProfileCompletion() {
  const percent = 85

  return (
    <article className="profile-card">
      <div className="profile-card-header">
        <h2>Profile Completion</h2>
        <span className="profile-completion-pct">{percent}%</span>
      </div>
      <div className="profile-progress-track">
        <div className="profile-progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="profile-completion-suggestions">
        <div className="profile-suggestion">
          <Camera size={14} />
          <span>Add profile photo</span>
        </div>
        <div className="profile-suggestion">
          <ShieldCheck size={14} />
          <span>Enable 2FA</span>
        </div>
      </div>
    </article>
  )
}
