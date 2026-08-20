import { Download, Link2, Mail, Pencil, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CertificateStatus } from '../../types/certificate'

interface Props {
  certificateId: string
  status: CertificateStatus
  onCopy: (text: string, message: string) => void
  onRevoke: () => void
}

export default function CertificateQuickActions({ certificateId, status, onCopy, onRevoke }: Props) {
  return (
    <article className="detail-card quick-actions">
      <h2>Quick Actions</h2>
      <div>
        <button>
          <Download size={16} /> Download PDF
        </button>
        <button onClick={() => onCopy(`verixa.test/certificates/${certificateId}`, 'Verification link copied')}>
          <Link2 size={16} /> Copy Verification Link
        </button>
        <button>
          <Mail size={16} /> Send Email
        </button>
        <Link to={`/certificates/${certificateId}/edit`}>
          <Pencil size={16} /> Edit Certificate
        </Link>
        {status !== 'revoked' && (
          <button className="quick-revoke" onClick={onRevoke}>
            <TriangleAlert size={16} /> Revoke Certificate
          </button>
        )}
      </div>
    </article>
  )
}
