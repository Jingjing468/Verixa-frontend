export type CertificateTemplate = 'classic' | 'modern' | 'minimal'
export type AccentStyle = 'blue' | 'violet' | 'emerald'
export type CertificateStatus = 'valid' | 'expired' | 'revoked'
export interface Certificate {
  id: string
  certificateId: string
  recipientName: string
  recipientEmail: string
  course: string
  issueDate: string
  expirationDate: string
  status: CertificateStatus
  blockchainVerified: boolean
}
export interface BlockchainRecord {
  network: string
  transactionHash: string
  blockNumber: number
  contractAddress: string | null
  certificateHash: string
  verificationStatus: 'Verified' | 'Mismatch' | 'Revoked' | 'Unavailable' | 'Not available'
  verified: boolean
  message?: string
}
export interface CertificateDetail extends Certificate {
  title: string
  issuer: string
  organizationLogo?: string
  blockchain: BlockchainRecord
  revocationReason?: string
}

export interface CertificateFormData {
  recipient: { name: string; email: string; recipientId: string; organization: string }
  certificateTitle: string
  program: string
  description: string
  issueDate: string
  hasExpiration: boolean
  expirationDate: string
  achievement: string
  template: CertificateTemplate
  organizationName: string
  organizationLogo?: string
  signature?: string
  signerName: string
  signerTitle: string
  accent: AccentStyle
}
