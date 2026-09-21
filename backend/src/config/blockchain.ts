import { isAddress } from "ethers";

export type BlockchainConfig = {
  rpcUrl: string;
  privateKey: string;
  contractAddress: string;
  network: "sepolia";
};

export const getBlockchainConfig = (): BlockchainConfig => {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
  const contractAddress = process.env.VERIXA_CONTRACT_ADDRESS;

  if (!rpcUrl) {
    throw new Error("SEPOLIA_RPC_URL environment variable is required");
  }

  if (!privateKey) {
    throw new Error("BLOCKCHAIN_PRIVATE_KEY environment variable is required");
  }

  if (!contractAddress) {
    throw new Error("VERIXA_CONTRACT_ADDRESS environment variable is required");
  }

  if (!isAddress(contractAddress)) {
    throw new Error("VERIXA_CONTRACT_ADDRESS must be a valid Ethereum address");
  }

  return {
    rpcUrl,
    privateKey,
    contractAddress,
    network: "sepolia",
  };
};
