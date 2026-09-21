export const verixaCertificateRegistryAbi = [
  "function issueCertificate(string certificateId, bytes32 certificateHash)",
  "function getCertificateProof(string certificateId) view returns (tuple(string certificateId, bytes32 certificateHash, address issuer, uint256 issuedAt, bool revoked, uint256 revokedAt))",
  "function revokeCertificate(string certificateId)",
] as const;
