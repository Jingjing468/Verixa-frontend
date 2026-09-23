const { ethers } = require("hardhat");

const SEPOLIA_CHAIN_ID = 11155111n;
const MINIMUM_DEPLOY_BALANCE = ethers.parseEther("0.01");

async function main() {
  const network = await ethers.provider.getNetwork();

  if (network.chainId !== SEPOLIA_CHAIN_ID) {
    throw new Error(
      `Expected Sepolia (chain ID ${SEPOLIA_CHAIN_ID}) but connected to chain ID ${network.chainId}`
    );
  }

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log(`Deployer: ${deployer.address}`);
  console.log(`Deployer balance: ${ethers.formatEther(balance)} ETH`);

  if (balance < MINIMUM_DEPLOY_BALANCE) {
    throw new Error(
      `Insufficient Sepolia ETH for deployment (${ethers.formatEther(
        balance
      )} ETH). Get free test ETH from a Sepolia faucet first.`
    );
  }

  const Registry = await ethers.getContractFactory("VerixaCertificateRegistry");
  const registry = await Registry.deploy();
  const deploymentTransaction = registry.deploymentTransaction();

  await registry.waitForDeployment();

  console.log(`Network: ${network.name} (${network.chainId})`);
  console.log(`Chain ID: ${network.chainId}`);
  console.log(`Contract address: ${await registry.getAddress()}`);
  console.log(
    `Deployment transaction: ${deploymentTransaction?.hash ?? "unavailable"}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
