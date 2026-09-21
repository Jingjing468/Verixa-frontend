import { Building2, CalendarDays, Clock, Globe, Mail, MapPin, Phone, UserRound } from 'lucide-react'
import type { UserProfile } from '../../types/profile'

interface Props {
  user: UserProfile
}

export default function PersonalInformation({ user }: Props) {
  const fields = [
    { label: 'Full Name', value: user.fullName, icon: UserRound },
    { label: 'Email', value: user.email, icon: Mail },
    { label: 'Phone', value: user.phone, icon: Phone },
    { label: 'Job Title', value: user.jobTitle, icon: Building2 },
    { label: 'Role', value: user.role, icon: ShieldCheck },
    { label: 'Location', value: user.location, icon: MapPin },
    { label: 'Timezone', value: user.timezone, icon: Globe },
  ]

  return (
    <article className="profile-card">
      <div className="profile-card-header">
        <h2>Personal Information</h2>
      </div>
      <div className="profile-info-grid">
        {fields.map((f) => {
          const Icon = f.icon
          return (
            <div key={f.label} className="profile-info-row">
              <span className="profile-info-icon"><Icon size={15} /></span>
              <div>
                <small>{f.label}</small>
                <b>{f.value}</b>
              </div>
            </div>
          )
        })}
      </div>
    </article>
  )
}

function ShieldCheck(props: { size: number }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
}
