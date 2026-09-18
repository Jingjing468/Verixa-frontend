export type CertificateStatus = "valid" | "expired" | "revoked";

export type CertificateSummary = {
  id: string;
  certificateId: string;
  recipient: {
    id: string | null;
    fullName: string;
    email: string;
  };
  courseName: string;
  issueDate: string;
  expiryDate: string | null;
  status: CertificateStatus;
  createdAt: string;
  updatedAt: string;
};

export type CertificateDetail = CertificateSummary & {
  blockchain: { network: string; transactionHash: string; blockNumber: number; certificateHash: string } | null;
  organization: {
    id: string;
    name: string;
    email: string;
  };
  issuer: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  revocation: CertificateRevocation | null;
};

export type CertificateInput = {
  recipientId: string;
  courseName: string;
  issueDate: string;
  expiryDate: string | null;
};

export type CertificateRevocation = {
  reason: string;
  note: string | null;
  revokedAt: string;
  revokedBy: {
    id: string;
    fullName: string;
  };
};
