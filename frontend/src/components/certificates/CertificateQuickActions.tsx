import { Download, Link2, Mail, Pencil, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CertificateStatus } from '../../types/certificate'

interface Props {
  certificateId: string
  certificateRecordId: string
  status: CertificateStatus
  onCopy: (text: string, message: string) => void
  onDownload: () => void
  onSendEmail: () => void
  onRevoke: () => void
  sendingEmail?: boolean
}

export default function CertificateQuickActions({
  certificateId,
  certificateRecordId,
  status,
  onCopy,
  onDownload,
  onSendEmail,
  onRevoke,
  sendingEmail = false,
}: Props) {
  const verificationUrl = `${window.location.origin}/verify/${encodeURIComponent(certificateId)}`

  return (
    <article className="detail-card quick-actions">
      <h2>Quick Actions</h2>
      <div>
        <button type="button" onClick={onDownload}>
          <Download size={16} /> Download PDF
        </button>
        <button type="button" onClick={() => onCopy(verificationUrl, 'Verification link copied')}>
          <Link2 size={16} /> Copy Verification Link
        </button>
        <button type="button" onClick={onSendEmail} disabled={sendingEmail || status === 'revoked'}>
          <Mail size={16} /> {sendingEmail ? 'Sending...' : 'Send Email'}
        </button>
        <Link to={`/certificates/${certificateRecordId}/edit`}>
          <Pencil size={16} /> Edit Certificate
        </Link>
        {status !== 'revoked' && (
          <button type="button" className="quick-revoke" onClick={onRevoke}>
            <TriangleAlert size={16} /> Revoke Certificate
          </button>
        )}
      </div>
    </article>
  )
}
