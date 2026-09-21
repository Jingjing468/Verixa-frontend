require("dotenv/config");
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");

const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL;
const deployerPrivateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
const isSepoliaCommand =
  process.argv.includes("--network") && process.argv.includes("sepolia");

if (isSepoliaCommand && (!sepoliaRpcUrl || !deployerPrivateKey)) {
  throw new Error(
    "Sepolia deployment requires SEPOLIA_RPC_URL and BLOCKCHAIN_PRIVATE_KEY in backend/blockchain/.env"
  );
}

/** @type {import("hardhat/config").HardhatUserConfig} */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    sepolia: {
      url: sepoliaRpcUrl || "http://127.0.0.1:8545",
      accounts: deployerPrivateKey ? [deployerPrivateKey] : [],
    },
  },
};
