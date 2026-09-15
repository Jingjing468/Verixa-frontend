import assert from "node:assert/strict";
import { stat } from "node:fs/promises";
import test from "node:test";
import {
  buildVerificationUrl,
  generateCertificatePdf,
  generateCertificateQrCodeBuffer,
  getCertificatePdfPath,
  getCertificatePdfUrl,
  type CertificatePdfData,
} from "./certificate-artifact.service.js";

const previousPublicFrontendUrl = process.env.PUBLIC_FRONTEND_URL;
process.env.PUBLIC_FRONTEND_URL = "http://localhost:5173";

const certificate: CertificatePdfData = {
  id: "11111111-1111-4111-8111-111111111111",
  certificateId: "CERT-2099-0000001",
  recipientName: "PDF Test Student",
  courseName: "Certificate Artifact Testing",
  organizationName: "Verixa Test Organization",
  issueDate: "2099-01-01",
  expiryDate: null,
};

test.after(() => {
  if (previousPublicFrontendUrl === undefined) {
    delete process.env.PUBLIC_FRONTEND_URL;
    return;
  }

  process.env.PUBLIC_FRONTEND_URL = previousPublicFrontendUrl;
});

test("verification URL uses PUBLIC_FRONTEND_URL and certificate ID", () => {
  assert.equal(
    buildVerificationUrl(certificate.certificateId),
    "http://localhost:5173/verify/CERT-2099-0000001"
  );
});

test("QR code buffer is generated for the public verification URL", async () => {
  const buffer = await generateCertificateQrCodeBuffer(certificate.certificateId);

  assert.equal(buffer.subarray(1, 4).toString("utf8"), "PNG");
  assert.equal(buffer.length > 100, true);
});

test("certificate PDF is generated and pdf_url is route-based", async () => {
  const generated = await generateCertificatePdf(certificate);
  const stats = await stat(generated.filePath);

  assert.equal(stats.isFile(), true);
  assert.equal(generated.pdfUrl, getCertificatePdfUrl(certificate.id));
  assert.equal(generated.verificationUrl.endsWith(`/verify/${certificate.certificateId}`), true);
});

test("unsafe certificate IDs cannot be used as PDF paths", () => {
  assert.throws(() => getCertificatePdfPath("../secret"));
  assert.throws(() => getCertificatePdfPath("CERT-2099-0000001/../../secret"));
});
