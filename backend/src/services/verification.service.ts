import { findPublicCertificateByCertificateId } from "../repositories/verification.repository.js";
import type {
  PublicBlockchainVerification,
  PublicCertificateVerification,
  VerificationResult,
} from "../types/verification.js";
import { doesCertificateHashMatch } from "../utils/certificate-hash.js";
import { HttpError } from "../utils/http-error.js";
import { createBlockchainService } from "./blockchain.service.js";

const certificateIdPattern = /^CERT-\d{4}-\d{7}$/;

const normalizeCertificateId = (certificateId: string): string => certificateId.trim().toUpperCase();

export const verifyCertificate = async (
  certificateIdParam: string
): Promise<VerificationResult> => {
  const certificateId = normalizeCertificateId(certificateIdParam);

  if (!certificateIdPattern.test(certificateId)) {
    throw new HttpError(404, "Certificate not found");
  }

  const record = await findPublicCertificateByCertificateId(certificateId);

  if (!record) {
    return {
      success: false,
      status: "not_found",
      message: "Certificate not found",
    };
  }

  const certificate: PublicCertificateVerification = {
    certificateId: record.certificate_id,
    recipientName: record.recipient_name,
    courseName: record.course_name,
    organizationName: record.organization_name,
    issueDate: record.issue_date,
    expiryDate: record.expiry_date,
    status: record.computed_status,
  };
  const databaseHashMatched = doesCertificateHashMatch(
    {
      certificateId: record.certificate_id,
      recipientName: record.recipient_name,
      recipientEmail: record.recipient_email,
      courseName: record.course_name,
      organizationName: record.organization_name,
      issueDate: record.issue_date,
      expiryDate: record.expiry_date,
    },
    record.certificate_hash
  );
  let blockchainHashMatched: boolean | null = null;
  let blockchain: PublicBlockchainVerification = {
    verified: false,
    available: true,
    network: record.blockchain_network,
    transactionHash: record.blockchain_transaction_hash,
    contractAddress: record.blockchain_contract_address,
    revoked: null,
    message: "Certificate has not been anchored on-chain",
  };

  if (record.blockchain_transaction_hash && record.blockchain_contract_address) {
    try {
      const proof = await createBlockchainService().getCertificateProof(
        record.certificate_id
      );

      blockchainHashMatched = proof.certificateHash === record.certificate_hash;
      blockchain = {
        verified:
          databaseHashMatched &&
          blockchainHashMatched &&
          proof.revoked === (record.computed_status === "revoked"),
        available: true,
        network: record.blockchain_network,
        transactionHash: record.blockchain_transaction_hash,
        contractAddress: record.blockchain_contract_address,
        revoked: proof.revoked,
      };
    } catch (error: unknown) {
      blockchain = {
        verified: false,
        available: false,
        network: record.blockchain_network,
        transactionHash: record.blockchain_transaction_hash,
        contractAddress: record.blockchain_contract_address,
        revoked: null,
        message:
          error instanceof Error
            ? `Blockchain verification unavailable: ${error.message}`
            : "Blockchain verification unavailable",
      };
    }
  }
  const integrity = {
    databaseHashMatched,
    blockchainHashMatched,
  };

  if (
    record.computed_status === "revoked" &&
    record.revocation_reason &&
    record.revoked_at
  ) {
    return {
      success: true,
      status: "revoked",
      certificate,
      integrity,
      blockchain,
      revocation: {
        reason: record.revocation_reason,
        revokedAt: record.revoked_at.toISOString(),
      },
    };
  }

  return {
    success: true,
    status: record.computed_status,
    certificate,
    integrity,
    blockchain,
  };
};
