import { createWriteStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { getPublicFrontendUrl } from "../config/public-url.js";

export type CertificatePdfData = {
  id: string;
  certificateId: string;
  recipientName: string;
  courseName: string;
  organizationName: string;
  issueDate: string;
  expiryDate: string | null;
};

export type GeneratedCertificatePdf = {
  pdfUrl: string;
  filePath: string;
  verificationUrl: string;
};

const certificatesStorageDir = path.resolve(
  process.cwd(),
  "storage",
  "certificates"
);
const certificateIdFileNamePattern = /^CERT-\d{4}-\d{7}\.pdf$/;

export const buildVerificationUrl = (certificateId: string): string =>
  `${getPublicFrontendUrl()}/verify/${encodeURIComponent(certificateId)}`;

export const getCertificatePdfFileName = (certificateId: string): string => {
  const fileName = `${certificateId}.pdf`;

  if (!certificateIdFileNamePattern.test(fileName)) {
    throw new Error("Certificate ID cannot be used as a PDF filename");
  }

  return fileName;
};

export const getCertificatePdfPath = (certificateId: string): string => {
  const filePath = path.resolve(
    certificatesStorageDir,
    getCertificatePdfFileName(certificateId)
  );

  if (!filePath.startsWith(`${certificatesStorageDir}${path.sep}`)) {
    throw new Error("Unsafe certificate PDF path");
  }

  return filePath;
};

export const getCertificatePdfUrl = (certificateDatabaseId: string): string =>
  `/api/v1/certificates/${certificateDatabaseId}/pdf`;

export const generateCertificateQrCodeBuffer = async (
  certificateId: string
): Promise<Buffer> =>
  QRCode.toBuffer(buildVerificationUrl(certificateId), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 180,
    type: "png",
  });

export const certificatePdfExists = async (
  certificateId: string
): Promise<boolean> => {
  try {
    const stats = await stat(getCertificatePdfPath(certificateId));

    return stats.isFile();
  } catch {
    return false;
  }
};

export const generateCertificatePdf = async (
  certificate: CertificatePdfData
): Promise<GeneratedCertificatePdf> => {
  await mkdir(certificatesStorageDir, { recursive: true });

  const verificationUrl = buildVerificationUrl(certificate.certificateId);
  const qrCodeBuffer = await generateCertificateQrCodeBuffer(
    certificate.certificateId
  );
  const filePath = getCertificatePdfPath(certificate.certificateId);
  const pdfUrl = getCertificatePdfUrl(certificate.id);

  await new Promise<void>((resolve, reject) => {
    const document = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 54,
      info: {
        Title: `Verixa Certificate ${certificate.certificateId}`,
        Author: "Verixa",
        Subject: "Digital Certificate",
      },
    });
    const output = createWriteStream(filePath);

    output.on("finish", resolve);
    output.on("error", reject);
    document.on("error", reject);
    document.pipe(output);

    const pageWidth = document.page.width;
    const accent = "#2563eb";
    const muted = "#5b6472";

    document
      .rect(0, 0, pageWidth, 26)
      .fill(accent)
      .fillColor("#111827");

    document
      .font("Helvetica-Bold")
      .fontSize(24)
      .fillColor(accent)
      .text("Verixa", 54, 56, { align: "left" });

    document
      .font("Helvetica")
      .fontSize(10)
      .fillColor(muted)
      .text("Blockchain-ready digital certificate", 54, 86);

    document
      .moveTo(54, 112)
      .lineTo(pageWidth - 54, 112)
      .strokeColor("#d8dee9")
      .stroke();

    document
      .font("Helvetica-Bold")
      .fontSize(30)
      .fillColor("#111827")
      .text("Certificate of Completion", 54, 142, { align: "center" });

    document
      .font("Helvetica")
      .fontSize(13)
      .fillColor(muted)
      .text("This certificate is proudly presented to", 54, 194, {
        align: "center",
      });

    document
      .font("Helvetica-Bold")
      .fontSize(28)
      .fillColor("#111827")
      .text(certificate.recipientName, 54, 224, { align: "center" });

    document
      .font("Helvetica")
      .fontSize(13)
      .fillColor(muted)
      .text("for successful completion of", 54, 274, { align: "center" });

    document
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor("#111827")
      .text(certificate.courseName, 88, 304, { align: "center" });

    document
      .font("Helvetica")
      .fontSize(12)
      .fillColor(muted)
      .text(`Issued by ${certificate.organizationName}`, 54, 354, {
        align: "center",
      });

    document
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#111827")
      .text(`Certificate ID: ${certificate.certificateId}`, 74, 420)
      .text(`Issue date: ${certificate.issueDate}`, 74, 442)
      .text(`Expiry date: ${certificate.expiryDate ?? "No expiry"}`, 74, 464);

    document.image(qrCodeBuffer, pageWidth - 214, 374, {
      width: 126,
      height: 126,
    });

    document
      .font("Helvetica")
      .fontSize(9)
      .fillColor(muted)
      .text("Scan to verify", pageWidth - 220, 506, {
        width: 138,
        align: "center",
      });

    document
      .font("Helvetica")
      .fontSize(9)
      .fillColor(muted)
      .text(`Verify at: ${verificationUrl}`, 54, 524, {
        align: "center",
      });

    document.end();
  });

  return {
    pdfUrl,
    filePath,
    verificationUrl,
  };
};
