import type { Certificate, CertificateDetail } from '../types/certificate'

export const mockCertificates: Certificate[] = [
  { id: 'CERT-2026-0001248', certificateId: 'CERT-2026-0001248', recipientName: 'Lim Potkolbotey', recipientEmail: 'lim@example.com', course: 'Blockchain Development', issueDate: 'May 23, 2026', expirationDate: 'May 23, 2027', status: 'valid', blockchainVerified: true },
  { id: 'CERT-2026-0001247', certificateId: 'CERT-2026-0001247', recipientName: 'Yean Sreymom', recipientEmail: 'sreymom@example.com', course: 'Smart Contract Basics', issueDate: 'May 22, 2026', expirationDate: 'May 22, 2027', status: 'valid', blockchainVerified: true },
  { id: 'CERT-2026-0001246', certificateId: 'CERT-2026-0001246', recipientName: 'Dara Vimean', recipientEmail: 'dara@example.com', course: 'Web3 Fundamentals', issueDate: 'May 21, 2026', expirationDate: 'May 21, 2026', status: 'expired', blockchainVerified: true },
  { id: 'CERT-2026-0001245', certificateId: 'CERT-2026-0001245', recipientName: 'Sokha Ngin', recipientEmail: 'sokha@example.com', course: 'Decentralized Applications', issueDate: 'May 19, 2026', expirationDate: 'May 19, 2027', status: 'revoked', blockchainVerified: true },
  { id: 'CERT-2026-0001244', certificateId: 'CERT-2026-0001244', recipientName: 'Vannak Keo', recipientEmail: 'vannak@example.com', course: 'Ethereum Development', issueDate: 'May 18, 2026', expirationDate: 'May 18, 2027', status: 'valid', blockchainVerified: true },
  { id: 'CERT-2026-0001243', certificateId: 'CERT-2026-0001243', recipientName: 'Sophy Chan', recipientEmail: 'sophy@example.com', course: 'Blockchain Development', issueDate: 'May 16, 2026', expirationDate: 'May 16, 2027', status: 'valid', blockchainVerified: true },
  { id: 'CERT-2026-0001242', certificateId: 'CERT-2026-0001242', recipientName: 'Bora Khem', recipientEmail: 'bora@example.com', course: 'Web3 Fundamentals', issueDate: 'May 14, 2026', expirationDate: 'May 14, 2026', status: 'expired', blockchainVerified: true },
]

export function getCertificateDetail(id: string): CertificateDetail {
  const cert = mockCertificates.find((c) => c.id === id)
  const status = cert?.status ?? 'valid'
  return {
    id,
    certificateId: cert?.certificateId ?? id,
    recipientName: cert?.recipientName ?? 'Lim Potkolbotey',
    recipientEmail: cert?.recipientEmail ?? 'lim@example.com',
    course: cert?.course ?? 'Blockchain Development',
    issueDate: cert?.issueDate ?? 'May 23, 2026',
    expirationDate: status === 'expired' ? (cert?.expirationDate ?? 'May 23, 2026') : 'May 23, 2027',
    status,
    blockchainVerified: true,
    title: 'Certificate of Completion',
    issuer: 'Kirirom Institute of Technology',
    blockchain: {
      network: 'Ethereum Sepolia',
      transactionHash: '0x82a7c4f98b6d...91f3',
      blockNumber: 7829143,
      certificateHash: '0x7f3a9c2e8b4d...82ac',
      verified: true,
    },
    revocationReason: status === 'revoked' ? 'Issued by mistake' : undefined,
  }
}

export const mockCourses = ['All Courses', ...Array.from(new Set(mockCertificates.map((c) => c.course)))]

export const dashboardStats = {
  total: 1248,
  valid: 1102,
  expired: 98,
  revoked: 48,
}
