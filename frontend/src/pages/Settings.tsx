import { useState, useCallback, useRef } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import SettingsNavigation from '../components/settings/SettingsNavigation'
import OrganizationProfile from '../components/settings/OrganizationProfile'
import CertificateBranding from '../components/settings/CertificateBranding'
import PersonalProfile from '../components/settings/PersonalProfile'
import SecuritySettings from '../components/settings/SecuritySettings'
import NotificationSettings from '../components/settings/NotificationSettings'
import PreferenceSettings from '../components/settings/PreferenceSettings'
import UnsavedChangesBar from '../components/settings/UnsavedChangesBar'
import type {
  SettingsSection,
  OrganizationSettings,
  CertificateBranding as CertificateBrandingType,
  PersonalProfile as PersonalProfileType,
  SecuritySettings as SecuritySettingsType,
  NotificationSettings as NotificationSettingsType,
  Preferences,
} from '../types/settings'

const initialOrg: OrganizationSettings = {
  name: 'Kirirom Institute of Technology',
  email: 'certificate@kit.edu.kh',
  website: 'https://kit.edu.kh',
  phone: '+855 12 345 678',
  address: 'Phnom Penh, Cambodia',
  description: 'Technology-focused educational institution.',
  logoUrl: null,
}

const initialBranding: CertificateBrandingType = {
  displayName: 'Kirirom Institute of Technology',
  footerText: 'Certificate of Completion',
  primaryColor: '#3975ff',
  signerName: 'Dr. Sopheap Leng',
  signerPosition: 'President',
  signatureUrl: null,
}

const initialProfile: PersonalProfileType = {
  fullName: 'Admin User',
  email: 'admin@organization.com',
  role: 'Organization Administrator',
  phone: '+855 12 345 678',
  jobTitle: 'Certificate Administrator',
  avatarUrl: null,
}

const initialSecurity: SecuritySettingsType = {
  twoFactorEnabled: false,
  activeSession: {
    device: 'Chrome on macOS',
    location: 'Phnom Penh, Cambodia',
    lastActive: 'Now',
  },
}

const initialNotifications: NotificationSettingsType = {
  certificateIssued: true,
  certificateRevoked: true,
  certificateExpiring: true,
  emailFailure: false,
  securityAlerts: true,
  weeklyReport: false,
}

const initialPreferences: Preferences = {
  language: 'English',
  timezone: 'Asia/Phnom_Penh',
  dateFormat: 'DD MMM YYYY',
  itemsPerPage: 10,
  theme: 'light',
}

function Settings() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('organization')
  const [showToast, setShowToast] = useState(false)
  const toastTimeout = useRef<ReturnType<typeof setTimeout>>(null)

  const [org, setOrg] = useState<OrganizationSettings>(initialOrg)
  const [branding, setBranding] = useState<CertificateBrandingType>(initialBranding)
  const [profile, setProfile] = useState<PersonalProfileType>(initialProfile)
  const [security, setSecurity] = useState<SecuritySettingsType>(initialSecurity)
  const [notifications, setNotifications] = useState<NotificationSettingsType>(initialNotifications)
  const [preferences, setPreferences] = useState<Preferences>(initialPreferences)

  const [hasChanges, setHasChanges] = useState(false)

  const markChanged = useCallback(() => {
    if (!hasChanges) setHasChanges(true)
  }, [hasChanges])

  const handleSave = useCallback(() => {
    setHasChanges(false)
    if (toastTimeout.current) clearTimeout(toastTimeout.current)
    setShowToast(true)
    toastTimeout.current = setTimeout(() => setShowToast(false), 3000)
  }, [])

  const handleDiscard = useCallback(() => {
    setOrg(initialOrg)
    setBranding(initialBranding)
    setProfile(initialProfile)
    setSecurity(initialSecurity)
    setNotifications(initialNotifications)
    setPreferences(initialPreferences)
    setHasChanges(false)
  }, [])

  const handleSectionChange = useCallback((section: SettingsSection) => {
    setActiveSection(section)
    if (section === 'profile') window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <DashboardLayout>
      <div className="dashboard-content">
          {/* Page heading */}
          <section className="settings-page-heading dashboard-enter">
            <nav className="settings-breadcrumb">
              <Link to="/dashboard">Dashboard</Link>
              <span>/</span>
              <span>Settings</span>
            </nav>
            <h1>Settings</h1>
            <p>Manage your organization profile, account preferences, and security.</p>
          </section>

          {/* Profile summary */}

          {/* Main layout */}
          <div className="settings-layout">
            {/* Desktop nav */}
            <aside className="settings-sidebar">
              <SettingsNavigation active={activeSection} onChange={handleSectionChange} />
            </aside>

            {/* Mobile tabs */}
            <div className="settings-mobile-tabs">
              <SettingsNavigation active={activeSection} onChange={handleSectionChange} />
            </div>

            {/* Content */}
            <div className="settings-content">
              {activeSection === 'organization' && (
                <>
                  <OrganizationProfile org={org} onChange={(v) => { setOrg(v); markChanged() }} />
                  <CertificateBranding branding={branding} onChange={(v) => { setBranding(v); markChanged() }} />
                </>
              )}
              {activeSection === 'profile' && (
                <PersonalProfile profile={profile} onChange={(v) => { setProfile(v); markChanged() }} />
              )}
              {activeSection === 'security' && (
                <SecuritySettings security={security} onChange={(v) => { setSecurity(v); markChanged() }} />
              )}
              {activeSection === 'notifications' && (
                <NotificationSettings notifications={notifications} onChange={(v) => { setNotifications(v); markChanged() }} />
              )}
              {activeSection === 'preferences' && (
                <PreferenceSettings preferences={preferences} onChange={(v) => { setPreferences(v); markChanged() }} />
              )}

              {/* Save / Cancel buttons */}
              {(activeSection === 'organization' || activeSection === 'profile') && (
                <div className="settings-actions">
                  <button className="settings-btn secondary" onClick={handleDiscard}>
                    Cancel
                  </button>
                  <button className="settings-btn primary" onClick={handleSave}>
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          <footer className="dashboard-footer">
            <span>© 2026 Verixa. All rights reserved.</span>
            <span><i /> Blockchain Network: Ethereum Sepolia</span>
          </footer>
        </div>

      {/* Unsaved changes bar */}
      <UnsavedChangesBar visible={hasChanges} onSave={handleSave} onDiscard={handleDiscard} />

      {/* Toast */}
      {showToast && (
        <div className="settings-toast">
          <CheckCircle2 size={16} />
          Settings updated successfully.
        </div>
      )}
    </DashboardLayout>
  )
}

export default Settings
