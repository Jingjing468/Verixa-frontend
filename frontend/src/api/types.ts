export type ApiUser = {
  id: string
  fullName: string
  email: string
  role: 'admin' | 'issuer' | 'viewer'
  organizationId: string
}

export type ApiOrganization = {
  id: string
  name: string
  email: string
  logoUrl: string | null
}

export type LoginResponse = {
  success: true
  token: string
  user: ApiUser
}

export type RegisterResponse = {
  success: true
  user: ApiUser
  organization: ApiOrganization
}

export type DashboardResponse = {
  success: true
  stats: {
    totalCertificates: number
    validCertificates: number
    expiredCertificates: number
    revokedCertificates: number
    totalRecipients: number
    certificatesIssuedRecently: number
  }
  recentCertificateActivity: Array<{
    id: string
    certificateId: string
    recipientName: string
    courseName: string
    status: 'valid' | 'expired' | 'revoked'
    createdAt: string
  }>
}

export type RecipientSummary = {
  id: string
  organizationId: string
  fullName: string
  email: string
  phone: string | null
  createdAt: string
  updatedAt: string
}

export type RecipientsResponse = {
  success: true
  recipients: RecipientSummary[]
}

export type CertificateSummary = {
  id: string
  certificateId: string
  recipient: {
    id: string | null
    fullName: string
    email: string
  }
  courseName: string
  issueDate: string
  expiryDate: string | null
  status: 'valid' | 'expired' | 'revoked'
  createdAt: string
  updatedAt: string
}

export type CertificatesResponse = {
  success: true
  data: CertificateSummary[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type CertificateDetailResponse = {
  success: true
  certificate: CertificateSummary & {
    organization: ApiOrganization
    issuer: {
      id: string
      fullName: string
      email: string
      role: string
    }
    revocation: null | {
      reason: string
      note: string | null
      revokedAt: string
      revokedBy: {
        id: string
        fullName: string
      }
    }
  }
}

export type PublicVerificationResponse = {
  success: boolean
  status: 'valid' | 'expired' | 'revoked' | 'not_found'
  message?: string
  certificate?: {
    certificateId: string
    recipientName: string
    courseName: string
    organizationName: string
    issueDate: string
    expiryDate: string | null
    status: 'valid' | 'expired' | 'revoked'
  }
  integrity?: {
    databaseHashMatched: boolean
    blockchainHashMatched: boolean | null
  }
  blockchain?: {
    verified: boolean
    available: boolean
    network: string | null
    transactionHash: string | null
    contractAddress: string | null
    revoked: boolean | null
    message?: string
  }
  revocation?: {
    reason: string
    revokedAt: string
  }
}

export type NotificationSummary = {
  id: string
  type: 'certificate_issued' | 'certificate_revoked' | 'email_delivery_failed' | 'system'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  readAt: string | null
}

export type NotificationsResponse = {
  success: true
  notifications: NotificationSummary[]
}

export type ProfileResponse = {
  success: true
  profile: {
    fullName: string
    email: string
    role: 'admin' | 'issuer' | 'viewer'
    organization: ApiOrganization
  }
}

export type CertificateReportResponse = {
  success: true
  filters: {
    status: string | null
    dateFrom: string | null
    dateTo: string | null
  }
  summary: {
    totalIssued: number
    valid: number
    expired: number
    revoked: number
  }
  issuanceOverTime: Array<{
    date: string
    count: number
  }>
}
