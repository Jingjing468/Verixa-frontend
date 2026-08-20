import { ShieldCheck, QrCode, Building2 } from 'lucide-react'
import type { VerificationResult } from '../../types/verification'

interface Props {
  cert: VerificationResult
}

function PublicCertificatePreview({ cert }: Props) {
  const isExpired = cert.status === 'expired'
  const isRevoked = cert.status === 'revoked'
  const stampLabel = isExpired ? 'EXPIRED' : isRevoked ? 'REVOKED' : null
  const stampClass = isExpired ? 'expired' : isRevoked ? 'revoked' : ''

  return (
    <div className="vr-preview">
      <span className="vr-preview-label">Certificate Preview</span>
      <div className="vr-preview-card">
        {/* Decorative corners */}
        <span className="vr-preview-corner tl" />
        <span className="vr-preview-corner br" />

        <div className="vr-preview-top">
          <div className="vr-preview-logo">
            <Building2 size={16} />
          </div>
          <div className="vr-preview-org">
            <strong>{cert.issuer}</strong>
            <small>VERIXA VERIFIED CREDENTIAL</small>
          </div>
          <span className="vr-preview-verified">
            <ShieldCheck size={11} />
            Verified
          </span>
        </div>

        <div className="vr-preview-body">
          <p className="vr-preview-type">Certificate of Completion</p>
          <p className="vr-preview-presented">Presented to</p>
          <h4 className="vr-preview-name">{cert.recipientName}</h4>
          <p className="vr-preview-for">for successfully completing</p>
          <h5 className="vr-preview-program">{cert.program}</h5>
        </div>

        <div className="vr-preview-footer">
          <div className="vr-preview-sig">
            <div className="vr-preview-sig-line" />
            <small>Authorized Signer</small>
            <small className="vr-preview-sig-org">{cert.issuer}</small>
          </div>
          <div className="vr-preview-meta">
            <div>
              <small>Issue Date</small>
              <strong>{cert.issueDate}</strong>
            </div>
            <div>
              <small>Credential ID</small>
              <strong className="vr-preview-id">{cert.id}</strong>
            </div>
          </div>
          <div className="vr-preview-qr">
            <QrCode size={36} />
            <small>Scan to verify</small>
          </div>
        </div>

        {/* Status stamp overlay */}
        {stampLabel && (
          <div className={`vr-preview-stamp ${stampClass}`}>
            {stampLabel}
          </div>
        )}
      </div>
    </div>
  )
}

export default PublicCertificatePreview
