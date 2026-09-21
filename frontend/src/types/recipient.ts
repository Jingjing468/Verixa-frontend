export interface Recipient {
  id: string
  name: string
  email: string
  organization: string
  totalCertificates: number
  validCertificates: number
  expiredCertificates: number
  revokedCertificates: number
  lastIssued: string
  createdAt: string
}

export interface RecipientCertificate {
  id: string
  course: string
  status: 'valid' | 'expired' | 'revoked'
  issueDate: string
}

export type RecipientFilter = 'all' | 'valid' | 'expired' | 'revoked'
export type RecipientSort = 'newest' | 'name' | 'certificates'
