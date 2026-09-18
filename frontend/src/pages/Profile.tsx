import { useEffect, useState } from 'react'
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
import { apiRequest } from '../api/client'
import type { ProfileResponse } from '../api/types'

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
  const [certificateStats, setCertificateStats] = useState<{ issued: number; revoked: number; active: number } | null>(null)
  const [statsError, setStatsError] = useState(false)
  const [user, setUser] = useState(initialUser)
  const [editOpen, setEditOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    apiRequest<ProfileResponse>('/profile', { auth: true })
      .then((response) => {
        setCertificateStats(response.profile.certificateStats)
        setAvatarUrl(response.profile.avatarUrl)
        setUser({
          ...initialUser,
          fullName: response.profile.fullName,
          email: response.profile.email,
          role: response.profile.role === 'admin' ? 'Organization Administrator' : response.profile.role,
          organization: response.profile.organization.name,
          organizationEmail: response.profile.organization.email,
        })
      })
      .catch(() => setStatsError(true))
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 2000)
  }

  const handleSave = (updated: UserProfile) => {
    apiRequest<ProfileResponse>('/profile', {
      method: 'PUT',
      auth: true,
      body: { fullName: updated.fullName },
    })
      .then((response) => {
        setUser({
          ...updated,
          fullName: response.profile.fullName,
          email: response.profile.email,
          role: response.profile.role === 'admin' ? 'Organization Administrator' : response.profile.role,
          organization: response.profile.organization.name,
          organizationEmail: response.profile.organization.email,
        })
        setEditOpen(false)
        window.dispatchEvent(new Event('verixa:profile-updated'))
        showToast('Profile updated successfully.')
      })
      .catch((requestError) => {
        showToast(requestError instanceof Error ? requestError.message : 'Profile update failed')
      })
  }

  const saveAvatar = async (url: string) => {
    try {
      const image = new Image()
      image.src = url
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 256
      const size = Math.min(image.naturalWidth, image.naturalHeight)
      canvas.getContext('2d')!.drawImage(image, (image.naturalWidth-size)/2, (image.naturalHeight-size)/2, size, size, 0, 0, 256, 256)
      const response = await apiRequest<ProfileResponse>('/profile', {
        method: 'PUT', auth: true, body: { fullName: user.fullName, avatarUrl: canvas.toDataURL('image/png') },
      })
      setAvatarUrl(response.profile.avatarUrl)
      window.dispatchEvent(new Event('verixa:profile-updated'))
      showToast('Profile photo saved.')
    } catch (error) { showToast(error instanceof Error ? error.message : 'Could not save profile photo') }
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

        <ProfileHero user={user} onEdit={() => setEditOpen(true)} avatarUrl={avatarUrl} onAvatarChange={saveAvatar} />

        <AccountStats stats={certificateStats} error={statsError} />

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
