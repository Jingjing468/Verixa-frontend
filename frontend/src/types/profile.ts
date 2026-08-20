export interface UserProfile {
  id: string
  fullName: string
  email: string
  phone: string
  jobTitle: string
  role: string
  organization: string
  organizationEmail: string
  location: string
  timezone: string
  memberSince: string
}

export interface ProfileActivity {
  id: string
  type: 'issue' | 'update' | 'revoke' | 'settings' | 'login'
  title: string
  description?: string
  timestamp: string
}
