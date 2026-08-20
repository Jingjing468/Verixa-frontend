import { Link } from 'react-router-dom'
import { Building2, Mail, CalendarDays, ArrowRight } from 'lucide-react'
import type { UserProfile } from '../../types/profile'

interface Props {
  user: UserProfile
}

export default function OrganizationCard({ user }: Props) {
  return (
    <article className="profile-card">
      <div className="profile-card-header">
        <h2>Organization</h2>
      </div>
      <div className="profile-org-info">
        <div className="profile-org-icon">
          <Building2 size={22} />
        </div>
        <div>
          <b>{user.organization}</b>
          <span>Organization Role: Administrator</span>
        </div>
      </div>
      <div className="profile-org-details">
        <div><Mail size={14} /><small>{user.organizationEmail}</small></div>
        <div><CalendarDays size={14} /><small>Member since {user.memberSince}</small></div>
      </div>
      <Link to="/settings" className="profile-card-link">
        View Organization Settings <ArrowRight size={14} />
      </Link>
    </article>
  )
}
