import { Copy, FileCheck2, Mail, Plus, Send, ShieldCheck, X } from 'lucide-react'
import type { Recipient, RecipientCertificate } from '../../types/recipient'

interface Props {
  recipient: Recipient
  certificates: RecipientCertificate[]
  onClose: () => void
}

export default function RecipientDetailDrawer({ recipient, certificates, onClose }: Props) {
  const initials = recipient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className="recipient-drawer">
        <div className="drawer-header">
          <div className="drawer-recipient">
            <div className="drawer-avatar">{initials}</div>
            <div>
              <h2>{recipient.name}</h2>
              <p>{recipient.email}</p>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {/* Info */}
          <div className="drawer-info">
            <div><span>Recipient ID</span><b>{recipient.id}</b></div>
            <div><span>Organization</span><b>{recipient.organization}</b></div>
            <div><span>Total Certificates</span><b>{recipient.totalCertificates}</b></div>
          </div>

          {/* Stats */}
          <div className="drawer-stats">
            <div className="drawer-stat valid"><ShieldCheck size={14} /><b>{recipient.validCertificates}</b><small>Valid</small></div>
            <div className="drawer-stat expired"><FileCheck2 size={14} /><b>{recipient.expiredCertificates}</b><small>Expired</small></div>
            <div className="drawer-stat revoked"><FileCheck2 size={14} /><b>{recipient.revokedCertificates}</b><small>Revoked</small></div>
          </div>

          {/* Recent certificates */}
          <div className="drawer-certificates">
            <h3>Recent Certificates</h3>
            {certificates.map((cert) => (
              <div key={cert.id} className="drawer-cert-row">
                <div>
                  <b>{cert.id}</b>
                  <small>{cert.course}</small>
                </div>
                <span className={`drawer-cert-status ${cert.status}`}>{cert.status}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="drawer-actions">
            <button className="issue-action" style={{ width: '100%' }}>
              <Plus size={15} /> Issue Certificate
            </button>
            <button className="cancel-action" style={{ width: '100%' }}>
              <Mail size={15} /> Send Email
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
