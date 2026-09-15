const { ethers } = require("hardhat");

async function main() {
  const network = await ethers.provider.getNetwork();
  const Registry = await ethers.getContractFactory("VerixaCertificateRegistry");
  const registry = await Registry.deploy();
  const deploymentTransaction = registry.deploymentTransaction();

  await registry.waitForDeployment();

  console.log(`Network: ${network.name} (${network.chainId})`);
  console.log(`Contract address: ${await registry.getAddress()}`);
  console.log(
    `Deployment transaction: ${deploymentTransaction?.hash ?? "unavailable"}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
