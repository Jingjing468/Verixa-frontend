export type VerificationMethod = 'certificateId' | 'qr'

export type VerificationStatus = 'valid' | 'expired' | 'revoked' | 'notFound'

export type MockCertificateState = VerificationStatus

export interface VerificationFormState {
  method: VerificationMethod
  certificateId: string
}

export interface VerificationResult {
  id: string
  recipientName: string
  recipientEmail?: string
  program: string
  issuer: string
  issueDate: string
  expirationDate?: string
  status: VerificationStatus
  revokedDate?: string
  revocationReason?: string
  blockchain: {
    network: string
    transactionHash: string
    blockNumber: number
    certificateHash: string
    hashMatched: boolean
  }
}

/** Legacy alias kept for the /verify page */
export interface MockCertificate {
  id: string
  recipientName: string
  course: string
  issuer: string
  issueDate: string
  expirationDate: string | null
  status: MockCertificateState
  blockchain: {
    network: string
    transactionHash: string
    blockNumber: number
    certificateHash: string
  }
}
