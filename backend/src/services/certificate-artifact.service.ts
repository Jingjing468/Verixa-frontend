import { createWriteStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { getPublicFrontendUrl } from "../config/public-url.js";

export type CertificateDesign = {
 recipientName?: string; certificateTitle?: string; organizationName?: string; organizationLogo?: string;
 signature?: string; signerName?: string; signerTitle?: string;
 template?: 'classic' | 'modern' | 'minimal'; accent?: 'blue' | 'violet' | 'emerald';
};
export type CertificatePdfData = {
 design?: CertificateDesign;
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

    const w = document.page.width, h = document.page.height;
    const d = certificate.design ?? {};
    const accent = {blue:'#3975ff',violet:'#8264df',emerald:'#2fa879'}[d.accent ?? 'blue'];
    const muted = '#90a0b9';
    document.rect(0,0,w,h).fill(d.template === 'modern' ? '#f5f8ff' : '#ffffff');
    document.roundedRect(12,12,w-24,h-24,12).lineWidth(1).strokeColor('#dce5f4').stroke();
    if(d.template !== 'minimal') {
      document.save().rect(13,13,w-26,h-26).clip();
      document.circle(12,12,38).lineWidth(5).strokeColor('#e5eeff').stroke();
      document.circle(w-12,h-12,38).stroke(); document.restore();
    }
    const image = (source: string,x: number,y: number,width: number,height: number) => {
      document.image(Buffer.from(source.split(',')[1] ?? '', 'base64'),x,y,{fit:[width,height],align:'center',valign:'center'});
    };
    const text = (value: string,x: number,y: number,width: number,size: number,color: string,font='Helvetica',align: 'left'|'center'|'right'='left') => {
      document.font(font).fontSize(size).fillColor(color).text(value,x,y,{width,align,height:42,ellipsis:true});
    };
    if(d.organizationLogo){image(d.organizationLogo,48,44,64,64);}
    text('CERTIFICATE OF ACHIEVEMENT',48,142,w-96,9,accent,'Helvetica-Bold','center');
    text(d.certificateTitle || 'Certificate of Completion',48,174,w-96,27,'#354156','Helvetica','center');
    text('This certifies that',48,235,w-96,11,muted,'Helvetica','center');
    text(certificate.recipientName,48,260,w-96,28,accent,'Times-Roman','center');
    text('has successfully completed',48,318,w-96,11,muted,'Helvetica','center');
    text(certificate.courseName,48,344,w-96,15,'#48556a','Helvetica','center');
    document.moveTo(48,418).lineTo(w-48,418).lineWidth(1).strokeColor('#ecf0f5').stroke();
    text('Issued by',48,491,220,9,muted);
    text(d.organizationName || certificate.organizationName,48,511,220,10,'#536177','Helvetica-Bold');
    text('Issue date',286,491,150,9,muted);
    const date = new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(certificate.issueDate));
    text(date,286,511,150,10,'#536177','Helvetica-Bold');
    if(d.signature){
      image(d.signature,470,456,90,36);
      text(d.signerName || '',452,498,126,10,'#536177','Helvetica-Bold','center');
      text(d.signerTitle || '',452,515,126,8,muted,'Helvetica','center');
    }
    document.image(qrCodeBuffer,w-128,454,{width:62,height:62});
    text(certificate.certificateId,w-196,524,148,8,muted,'Helvetica','right');
    document.link(w-128,454,62,62,verificationUrl);

    document.end();
  });

  return {
    pdfUrl,
    filePath,
    verificationUrl,
  };
};
