import { Link } from 'react-router-dom'
import { Lock, ShieldCheck, Smartphone, ArrowRight } from 'lucide-react'

export default function SecuritySummary() {
  return (
    <article className="profile-card">
      <div className="profile-card-header">
        <h2>Account Security</h2>
      </div>
      <div className="profile-security-list">
        <div className="profile-security-row">
          <span className="profile-security-icon"><Lock size={15} /></span>
          <div>
            <b>Password</b>
            <small>Last changed 30 days ago</small>
          </div>
        </div>
        <div className="profile-security-row">
          <span className="profile-security-icon"><ShieldCheck size={15} /></span>
          <div>
            <b>Two-Factor Authentication</b>
            <small>Not enabled</small>
          </div>
        </div>
        <div className="profile-security-row">
          <span className="profile-security-icon"><Smartphone size={15} /></span>
          <div>
            <b>Active Session</b>
            <small>1 device</small>
          </div>
        </div>
      </div>
      <Link to="/settings" className="profile-card-link">
        Manage Security <ArrowRight size={14} />
      </Link>
    </article>
  )
}
