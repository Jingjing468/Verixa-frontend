import assert from "node:assert/strict";
import test from "node:test";
import {
  doesCertificateHashMatch,
  generateCertificateHash,
  isCertificateHash,
  type CertificateHashData,
} from "./certificate-hash.js";

const baseCertificate: CertificateHashData = {
  certificateId: "CERT-2026-0000001",
  recipientName: "Lim Potkolbotey",
  recipientEmail: "student@example.com",
  courseName: "Bachelor of Software Engineering",
  organizationName: "Kirirom Institute of Technology",
  issueDate: "2026-09-15",
  expiryDate: null,
};

test("same certificate data generates the same hash", () => {
  assert.equal(
    generateCertificateHash(baseCertificate),
    generateCertificateHash({ ...baseCertificate })
  );
});

test("different hash-relevant data generates a different hash", () => {
  assert.notEqual(
    generateCertificateHash(baseCertificate),
    generateCertificateHash({
      ...baseCertificate,
      courseName: "Bachelor of Cybersecurity",
    })
  );
});

test("string whitespace and email casing are normalized", () => {
  assert.equal(
    generateCertificateHash(baseCertificate),
    generateCertificateHash({
      ...baseCertificate,
      certificateId: " CERT-2026-0000001 ",
      recipientName: " Lim Potkolbotey ",
      recipientEmail: " STUDENT@EXAMPLE.COM ",
      courseName: " Bachelor of Software Engineering ",
      organizationName: " Kirirom Institute of Technology ",
      issueDate: " 2026-09-15 ",
    })
  );
});

test("null expiry date is deterministic", () => {
  assert.equal(
    generateCertificateHash({ ...baseCertificate, expiryDate: null }),
    generateCertificateHash({ ...baseCertificate, expiryDate: null })
  );
  assert.notEqual(
    generateCertificateHash({ ...baseCertificate, expiryDate: null }),
    generateCertificateHash({ ...baseCertificate, expiryDate: "2028-09-15" })
  );
});

test("generated hash is 64 lowercase hexadecimal characters", () => {
  assert.equal(isCertificateHash(generateCertificateHash(baseCertificate)), true);
});

test("hash comparison detects mismatched stored hashes", () => {
  const storedHash = generateCertificateHash(baseCertificate);

  assert.equal(doesCertificateHashMatch(baseCertificate, storedHash), true);
  assert.equal(
    doesCertificateHashMatch(
      {
        ...baseCertificate,
        recipientName: "Different Student",
      },
      storedHash
    ),
    false
  );
});
