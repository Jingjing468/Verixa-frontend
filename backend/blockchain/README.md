# Verixa Blockchain

This package contains the Verixa certificate proof smart contract.

The backend generates a SHA-256 certificate hash as a 64-character lowercase hexadecimal string. The contract stores that same value as `bytes32`.

Conversion expected later in the backend:

```ts
const certificateHashBytes32 = `0x${certificateHashHex}`;
```

Do not hash the SHA-256 value again before sending it to the contract.

Deployment is not implemented yet. When ready, configure:

- `SEPOLIA_RPC_URL`
- `BLOCKCHAIN_PRIVATE_KEY`
- `ETHERSCAN_API_KEY`

Then run:

```powershell
npm run deploy:sepolia
```
