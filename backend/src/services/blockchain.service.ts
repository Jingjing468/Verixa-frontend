import {
  Contract,
  JsonRpcProvider,
  Wallet,
  type ContractTransactionReceipt,
  type ContractTransactionResponse,
} from "ethers";
import { verixaCertificateRegistryAbi } from "../blockchain/verixa-certificate-registry.abi.js";
import { getBlockchainConfig, type BlockchainConfig } from "../config/blockchain.js";
import {
  bytes32ToCertificateHashHex,
  certificateHashHexToBytes32,
} from "../utils/blockchain.js";

export type BlockchainIssueResult = {
  network: "sepolia";
  transactionHash: string;
  blockNumber: number | null;
  contractAddress: string;
};

export type BlockchainCertificateProof = {
  certificateId: string;
  certificateHash: string;
  issuer: string;
  issuedAt: bigint;
  revoked: boolean;
  revokedAt: bigint;
};

export type VerixaContract = {
  issueCertificate(
    certificateId: string,
    certificateHash: string
  ): Promise<ContractTransactionResponse>;
  revokeCertificate(certificateId: string): Promise<ContractTransactionResponse>;
  getCertificateProof(certificateId: string): Promise<{
    certificateId: string;
    certificateHash: string;
    issuer: string;
    issuedAt: bigint;
    revoked: boolean;
    revokedAt: bigint;
  }>;
};

const SEPOLIA_CHAIN_ID = 11155111n;

const waitForReceipt = async (
  transaction: ContractTransactionResponse
): Promise<ContractTransactionReceipt> => {
  const receipt = await transaction.wait(1);

  if (!receipt) {
    throw new Error("Blockchain transaction was not confirmed");
  }

  if (receipt.status !== 1) {
    throw new Error("Blockchain transaction failed");
  }

  return receipt;
};

export class BlockchainService {
  private readonly config: BlockchainConfig;
  private readonly contract: VerixaContract;
  private readonly provider: JsonRpcProvider | null = null;
  private readonly walletAddress: string | null = null;

  public constructor(config = getBlockchainConfig(), contract?: VerixaContract) {
    this.config = config;

    if (contract) {
      this.contract = contract;
      return;
    }

    const provider = new JsonRpcProvider(config.rpcUrl);
    const signer = new Wallet(config.privateKey, provider);
    this.provider = provider;
    this.walletAddress = signer.address;

    this.contract = new Contract(
      config.contractAddress,
      verixaCertificateRegistryAbi,
      signer
    ) as unknown as VerixaContract;
  }

  private async assertSepoliaWalletReady(): Promise<void> {
    if (!this.provider || !this.walletAddress) {
      return;
    }

    let chainId: bigint;

    try {
      const network = await this.provider.getNetwork();
      chainId = network.chainId;
    } catch (error: unknown) {
      throw new Error(
        `RPC unavailable: ${error instanceof Error ? error.message : "Could not reach Sepolia RPC"}`
      );
    }

    if (chainId !== SEPOLIA_CHAIN_ID) {
      throw new Error(
        `Expected Ethereum Sepolia chain ID ${SEPOLIA_CHAIN_ID}, but RPC returned chain ID ${chainId}`
      );
    }

    let balance: bigint;

    try {
      balance = await this.provider.getBalance(this.walletAddress);
    } catch (error: unknown) {
      throw new Error(
        `Could not check deployment wallet balance: ${
          error instanceof Error ? error.message : "Unknown RPC error"
        }`
      );
    }

    if (balance === 0n) {
      throw new Error("Deployment wallet needs Sepolia ETH for gas.");
    }
  }

  public async issueCertificateOnChain(
    certificateId: string,
    certificateHash: string
  ): Promise<BlockchainIssueResult> {
    await this.assertSepoliaWalletReady();

    const transaction = await this.contract.issueCertificate(
      certificateId,
      certificateHashHexToBytes32(certificateHash)
    );
    const receipt = await waitForReceipt(transaction);

    return {
      network: this.config.network,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      contractAddress: this.config.contractAddress,
    };
  }

  public async revokeCertificateOnChain(certificateId: string): Promise<BlockchainIssueResult> {
    await this.assertSepoliaWalletReady();

    const transaction = await this.contract.revokeCertificate(certificateId);
    const receipt = await waitForReceipt(transaction);

    return {
      network: this.config.network,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      contractAddress: this.config.contractAddress,
    };
  }

  public async getCertificateProof(certificateId: string): Promise<BlockchainCertificateProof> {
    const proof = await this.contract.getCertificateProof(certificateId);

    return {
      certificateId: proof.certificateId,
      certificateHash: bytes32ToCertificateHashHex(proof.certificateHash),
      issuer: proof.issuer,
      issuedAt: proof.issuedAt,
      revoked: proof.revoked,
      revokedAt: proof.revokedAt,
    };
  }
}

export const createBlockchainService = (): BlockchainService => new BlockchainService();
