import type { CertificateStatus } from "./certificate.js";

export type PublicCertificateVerification = {
  certificateId: string;
  recipientName: string;
  courseName: string;
  organizationName: string;
  issueDate: string;
  expiryDate: string | null;
  status: CertificateStatus;
};

export type PublicCertificateIntegrity = {
  databaseHashMatched: boolean;
  blockchainHashMatched: boolean | null;
};

export type PublicBlockchainVerification = {
  verified: boolean;
  available: boolean;
  network: string | null;
  transactionHash: string | null;
  contractAddress: string | null;
  revoked: boolean | null;
  message?: string;
};

export type PublicRevocationVerification = {
  reason: string;
  revokedAt: string;
};

export type VerificationFoundResult = {
  success: true;
  status: CertificateStatus;
  certificate: PublicCertificateVerification;
  integrity: PublicCertificateIntegrity;
  blockchain: PublicBlockchainVerification;
  revocation?: PublicRevocationVerification;
};

export type VerificationNotFoundResult = {
  success: false;
  status: "not_found";
  message: "Certificate not found";
};

export type VerificationResult = VerificationFoundResult | VerificationNotFoundResult;
