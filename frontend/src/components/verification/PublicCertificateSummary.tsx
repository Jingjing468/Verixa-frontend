import { User, Building2, Calendar, Award, Hash, Copy } from 'lucide-react'
import type { VerificationResult } from '../../types/verification'

interface Props {
  cert: VerificationResult
  onCopy: (text: string, label: string) => void
}

function PublicCertificateSummary({ cert, onCopy }: Props) {
  const initials = cert.recipientName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const statusLabel =
    cert.status === 'valid'
      ? 'Valid'
      : cert.status === 'expired'
      ? 'Expired'
      : cert.status === 'revoked'
      ? 'Revoked'
      : 'Unknown'

  return (
    <div className="vr-summary">
      <div className="vr-summary-header">
        <h3>Certificate Details</h3>
      </div>

      <div className="vr-summary-body">
        <div className="vr-summary-top">
          <div className="vr-summary-avatar">{initials}</div>
          <div className="vr-summary-recipient">
            <strong>{cert.recipientName}</strong>
            {cert.recipientEmail && <small>{cert.recipientEmail}</small>}
          </div>
          <span className={`vr-summary-status ${cert.status}`}>
            {statusLabel}
          </span>
        </div>

        <div className="vr-summary-fields">
          <div className="vr-summary-row">
            <span className="vr-summary-label">
              <Hash size={13} />
              Certificate ID
            </span>
            <span className="vr-summary-value id">
              {cert.id}
              <button
                className="vr-copy-btn"
                onClick={() => onCopy(cert.id, 'Certificate ID')}
                aria-label="Copy certificate ID"
              >
                <Copy size={12} />
              </button>
            </span>
          </div>

          <div className="vr-summary-row">
            <span className="vr-summary-label">
              <Award size={13} />
              Program
            </span>
            <strong>{cert.program}</strong>
          </div>

          <div className="vr-summary-row">
            <span className="vr-summary-label">
              <Building2 size={13} />
              Issued By
            </span>
            <strong>{cert.issuer}</strong>
          </div>

          <div className="vr-summary-row">
            <span className="vr-summary-label">
              <Calendar size={13} />
              Issue Date
            </span>
            <strong>{cert.issueDate}</strong>
          </div>

          {cert.expirationDate && (
            <div className="vr-summary-row">
              <span className="vr-summary-label">
                <Calendar size={13} />
                Expiration Date
              </span>
              <strong>{cert.expirationDate}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PublicCertificateSummary
