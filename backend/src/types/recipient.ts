export type Recipient = {
  id: string;
  organizationId: string;
  fullName: string;
  email: string;
  phone: string | null;
  totalCertificates: number;
  validCertificates: number;
  expiredCertificates: number;
  revokedCertificates: number;
  lastIssuedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateRecipientInput = {
  fullName: string;
  email: string;
  phone: string | null;
};

export type UpdateRecipientInput = CreateRecipientInput;
