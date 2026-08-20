import { Info, AlertTriangle, ShieldOff } from 'lucide-react'
import type { VerificationStatus } from '../../types/verification'
import type { VerificationResult } from '../../types/verification'

interface Props {
  status: VerificationStatus
  cert: VerificationResult
}

function StatusInfoBox({ status, cert }: Props) {
  if (status === 'notFound') return null

  if (status === 'valid') {
    return (
      <div className="vr-info-box green">
        <Info size={16} />
        <p>This certificate is active and can be trusted.</p>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="vr-info-box orange">
        <AlertTriangle size={16} />
        <p>
          This certificate expired on {cert.expirationDate || 'N/A'}. The blockchain
          record is still authentic, but the credential is no longer active.
        </p>
      </div>
    )
  }

  if (status === 'revoked') {
    return (
      <div className="vr-info-box red">
        <ShieldOff size={16} />
        <div>
          <p>
            This certificate was revoked by {cert.issuer}.
          </p>
          {(cert.revokedDate || cert.revocationReason) && (
            <div className="vr-info-details">
              {cert.revokedDate && (
                <span>
                  <strong>Revoked Date:</strong> {cert.revokedDate}
                </span>
              )}
              {cert.revocationReason && (
                <span>
                  <strong>Reason:</strong> {cert.revocationReason}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

export default StatusInfoBox
