import assert from "node:assert/strict";
import test from "node:test";
import type {
  ContractTransactionReceipt,
  ContractTransactionResponse,
} from "ethers";
import { BlockchainService, type VerixaContract } from "./blockchain.service.js";

const config = {
  rpcUrl: "https://example.invalid",
  privateKey:
    "0x0123456789012345678901234567890123456789012345678901234567890123",
  contractAddress: "0x0000000000000000000000000000000000000001",
  network: "sepolia" as const,
};
const certificateId = "CERT-2026-0000001";
const hash = "a".repeat(64);
const hashBytes32 = `0x${hash}`;

const createTransaction = (
  status: 0 | 1
): ContractTransactionResponse =>
  ({
    wait: async () =>
      ({
        status,
        hash: "0xtransaction",
        blockNumber: 123,
      }) as ContractTransactionReceipt,
  }) as unknown as ContractTransactionResponse;

test("successful issuance returns confirmed blockchain metadata", async () => {
  let issuedHash = "";
  const contract: VerixaContract = {
    issueCertificate: async (_certificateId, certificateHash) => {
      issuedHash = certificateHash;
      return createTransaction(1);
    },
    revokeCertificate: async () => createTransaction(1),
    getCertificateProof: async () => ({
      certificateId,
      certificateHash: hashBytes32,
      issuer: config.contractAddress,
      issuedAt: 1n,
      revoked: false,
      revokedAt: 0n,
    }),
  };
  const service = new BlockchainService(config, contract);

  const result = await service.issueCertificateOnChain(certificateId, hash);

  assert.equal(issuedHash, hashBytes32);
  assert.equal(result.transactionHash, "0xtransaction");
  assert.equal(result.blockNumber, 123);
});

test("failed transaction confirmation is rejected", async () => {
  const contract: VerixaContract = {
    issueCertificate: async () => createTransaction(0),
    revokeCertificate: async () => createTransaction(1),
    getCertificateProof: async () => ({
      certificateId,
      certificateHash: hashBytes32,
      issuer: config.contractAddress,
      issuedAt: 1n,
      revoked: false,
      revokedAt: 0n,
    }),
  };
  const service = new BlockchainService(config, contract);

  await assert.rejects(
    service.issueCertificateOnChain(certificateId, hash),
    /Blockchain transaction failed/
  );
});

test("proof reads convert bytes32 hash back to backend hex", async () => {
  const contract: VerixaContract = {
    issueCertificate: async () => createTransaction(1),
    revokeCertificate: async () => createTransaction(1),
    getCertificateProof: async () => ({
      certificateId,
      certificateHash: hashBytes32,
      issuer: config.contractAddress,
      issuedAt: 1n,
      revoked: false,
      revokedAt: 0n,
    }),
  };
  const service = new BlockchainService(config, contract);

  const proof = await service.getCertificateProof(certificateId);

  assert.equal(proof.certificateHash, hash);
});

test("revocation waits for confirmed transaction", async () => {
  let revokedCertificateId = "";
  const contract: VerixaContract = {
    issueCertificate: async () => createTransaction(1),
    revokeCertificate: async (inputCertificateId) => {
      revokedCertificateId = inputCertificateId;
      return createTransaction(1);
    },
    getCertificateProof: async () => ({
      certificateId,
      certificateHash: hashBytes32,
      issuer: config.contractAddress,
      issuedAt: 1n,
      revoked: true,
      revokedAt: 2n,
    }),
  };
  const service = new BlockchainService(config, contract);

  const result = await service.revokeCertificateOnChain(certificateId);

  assert.equal(revokedCertificateId, certificateId);
  assert.equal(result.transactionHash, "0xtransaction");
});
