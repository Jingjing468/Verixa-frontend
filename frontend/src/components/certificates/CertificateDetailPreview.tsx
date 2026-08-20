import { ArrowUpRight, Award, QrCode, ShieldCheck, Link2 } from 'lucide-react'
import verixaLogo from '../../assets/verixaicon.png'
import type { CertificateDetail } from '../../types/certificate'

interface Props {
  certificate: CertificateDetail
}

export default function CertificateDetailPreview({ certificate }: Props) {
  return (
    <section className="detail-preview-column">
      <div className="detail-certificate">
        {/* Decorative corners */}
        <div className="cert-decor cert-decor-tl" />
        <div className="cert-decor cert-decor-br" />

        {/* Blockchain watermark */}
        <div className="cert-blockchain-watermark">
          <Link2 size={90} />
        </div>

        {/* Header */}
        <div className="detail-cert-header">
          <span className="detail-org-mark">
            <img src={verixaLogo} alt="Verixa" className="cert-logo-img" />
          </span>
          <div>
            <b>VERIXA</b>
            <small>VERIFIED CREDENTIAL</small>
          </div>
          <span className="detail-cert-verified">
            <ShieldCheck size={15} /> Blockchain verified
          </span>
        </div>

        {/* Body */}
        <div className="detail-cert-body">
          <p>Certificate of Completion</p>
          <h2>{certificate.title}</h2>
          <span>Presented to</span>
          <h3>{certificate.recipientName}</h3>
          <span>For successfully completing</span>
          <h4>{certificate.course}</h4>
        </div>

        {/* Footer */}
        <div className="detail-cert-footer">
          <div>
            <small>Issued by</small>
            <b>{certificate.issuer}</b>
          </div>
          <div>
            <small>Issue Date</small>
            <b>{certificate.issueDate}</b>
          </div>
          <div>
            <small>Expiration Date</small>
            <b>{certificate.expirationDate}</b>
          </div>
          <div className="detail-qr">
            <div className="cert-qr-box">
              <QrCode size={38} />
            </div>
            <small className="cert-qr-id">{certificate.id}</small>
          </div>
        </div>

        {/* Signature area */}
        <div className="detail-cert-signature">
          <div className="signature-line">
            <b>Dr. Sopheak</b>
            <span>Program Director</span>
          </div>
          <div className="signature-line">
            <b>{certificate.issuer}</b>
            <span>Issuing Organization</span>
          </div>
        </div>

        {/* Credential ID bar */}
        <div className="detail-cert-id-bar">
          <Award size={13} />
          <span>Credential ID: {certificate.id}</span>
        </div>

        {/* Status overlay for revoked/expired */}
        {certificate.status === 'revoked' && (
          <div className="cert-status-stamp revoked-stamp">REVOKED</div>
        )}
        {certificate.status === 'expired' && (
          <div className="cert-status-stamp expired-stamp">EXPIRED</div>
        )}
      </div>

      <button className="full-preview">
        <ArrowUpRight size={15} /> Open Full Preview
      </button>
    </section>
  )
}
