import { isHexString } from "ethers";

export const certificateHashHexToBytes32 = (certificateHash: string): string => {
  if (!/^[a-f0-9]{64}$/.test(certificateHash)) {
    throw new Error("Certificate hash must be a 64-character lowercase SHA-256 hex string");
  }

  const bytes32 = `0x${certificateHash}`;

  if (!isHexString(bytes32, 32)) {
    throw new Error("Certificate hash could not be converted to bytes32");
  }

  return bytes32;
};

export const bytes32ToCertificateHashHex = (bytes32: string): string => {
  if (!isHexString(bytes32, 32)) {
    throw new Error("Blockchain certificate hash must be bytes32");
  }

  return bytes32.slice(2).toLowerCase();
};
