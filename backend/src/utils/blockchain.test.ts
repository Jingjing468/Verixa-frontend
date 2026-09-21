import assert from "node:assert/strict";
import test from "node:test";
import {
  bytes32ToCertificateHashHex,
  certificateHashHexToBytes32,
} from "./blockchain.js";

const hash = "a".repeat(64);

test("converts backend SHA-256 hex to bytes32 without rehashing", () => {
  assert.equal(certificateHashHexToBytes32(hash), `0x${hash}`);
});

test("rejects invalid certificate hashes", () => {
  assert.throws(() => certificateHashHexToBytes32("abc"));
  assert.throws(() => certificateHashHexToBytes32("A".repeat(64)));
});

test("converts bytes32 hash back to lowercase hex", () => {
  assert.equal(bytes32ToCertificateHashHex(`0x${hash}`), hash);
});
