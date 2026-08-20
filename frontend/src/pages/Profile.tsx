import { useState } from 'react'
import { CheckCircle2, ShieldCheck } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import ProfileHero from '../components/profile/ProfileHero'
import PersonalInformation from '../components/profile/PersonalInformation'
import OrganizationCard from '../components/profile/OrganizationCard'
import AccountStats from '../components/profile/AccountStats'
import ProfileActivity from '../components/profile/ProfileActivity'
import SecuritySummary from '../components/profile/SecuritySummary'
import ProfileCompletion from '../components/profile/ProfileCompletion'
import EditProfileModal from '../components/profile/EditProfileModal'
import type { UserProfile } from '../types/profile'

const initialUser: UserProfile = {
  id: 'USR-001',
  fullName: 'Admin User',
  email: 'admin@organization.com',
  phone: '+855 12 345 678',
  jobTitle: 'Certificate Administrator',
  role: 'Organization Administrator',
  organization: 'Kirirom Institute of Technology',
  organizationEmail: 'certificate@kit.edu.kh',
  location: 'Phnom Penh, Cambodia',
  timezone: 'Asia/Phnom_Penh',
  memberSince: 'May 2026',
}

export default function Profile() {
  const [user, setUser] = useState(initialUser)
  const [editOpen, setEditOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 2000)
  }

  const handleSave = (updated: UserProfile) => {
    setUser(updated)
    setEditOpen(false)
    showToast('Profile updated successfully.')
  }

  return (
    <DashboardLayout>
      <div className="dashboard-content">
        {/* Header */}
        <header className="dashboard-welcome dashboard-enter">
          <div>
            <p>Account</p>
            <h1>My Profile</h1>
            <span>Manage your personal information and view your account activity.</span>
          </div>
        </header>

        <ProfileHero user={user} onEdit={() => setEditOpen(true)} avatarUrl={avatarUrl} onAvatarChange={setAvatarUrl} />

        <AccountStats />

        <div className="profile-grid">
          <div className="profile-grid-main">
            <PersonalInformation user={user} />
            <ProfileActivity />
          </div>
          <div className="profile-grid-side">
            <OrganizationCard user={user} />
            <SecuritySummary />
            <ProfileCompletion />
          </div>
        </div>

        <footer className="dashboard-footer">
          <span>© 2026 Verixa. All rights reserved.</span>
          <span><i /> Blockchain Network: Ethereum Sepolia</span>
        </footer>
      </div>

      {editOpen && <EditProfileModal user={user} onClose={() => setEditOpen(false)} onSave={handleSave} />}

      {toast && (
        <div className="detail-toast">
          <CheckCircle2 size={15} /> {toast}
        </div>
      )}
    </DashboardLayout>
  )
}
