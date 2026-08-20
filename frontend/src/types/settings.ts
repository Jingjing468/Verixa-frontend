export interface OrganizationSettings {
  name: string
  email: string
  website: string
  phone: string
  address: string
  description: string
  logoUrl: string | null
}

export interface CertificateBranding {
  displayName: string
  footerText: string
  primaryColor: string
  signerName: string
  signerPosition: string
  signatureUrl: string | null
}

export interface PersonalProfile {
  fullName: string
  email: string
  role: string
  phone: string
  jobTitle: string
  avatarUrl: string | null
}

export interface SecuritySettings {
  twoFactorEnabled: boolean
  activeSession: {
    device: string
    location: string
    lastActive: string
  }
}

export interface NotificationSettings {
  certificateIssued: boolean
  certificateRevoked: boolean
  certificateExpiring: boolean
  emailFailure: boolean
  securityAlerts: boolean
  weeklyReport: boolean
}

export interface Preferences {
  language: string
  timezone: string
  dateFormat: string
  itemsPerPage: number
  theme: 'light' | 'system' | 'dark'
}

export type SettingsSection =
  | 'organization'
  | 'profile'
  | 'security'
  | 'notifications'
  | 'preferences'
