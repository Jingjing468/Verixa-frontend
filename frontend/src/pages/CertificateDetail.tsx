import { ArrowLeft, Download, Ellipsis, Mail, Pencil, ShieldCheck, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CertificateStatusBadge from '../components/certificates/CertificateStatusBadge'
import CertificateDetailPreview from '../components/certificates/CertificateDetailPreview'
import CertificateInfoCard from '../components/certificates/CertificateInfoCard'
import BlockchainVerificationCard from '../components/certificates/BlockchainVerificationCard'
import CertificateTimeline from '../components/certificates/CertificateTimeline'
import RecipientCard from '../components/certificates/RecipientCard'
import CertificateQuickActions from '../components/certificates/CertificateQuickActions'
import StatusBanner from '../components/certificates/StatusBanner'
import RevokeCertificateModal from '../components/certificates/RevokeCertificateModal'
import DashboardLayout from '../layouts/DashboardLayout'
import { getCertificateDetail } from '../data/mockCertificates'

export default function CertificateDetail() {
  const { id = 'CERT-2026-0001248' } = useParams()
  const [actionsOpen, setActionsOpen] = useState(false)
  const [revokeOpen, setRevokeOpen] = useState(false)
  const [toast, setToast] = useState('')
  const certificate = getCertificateDetail(id)

  const copy = (text: string, message: string) => {
    navigator.clipboard?.writeText(text)
    setToast(message)
    window.setTimeout(() => setToast(''), 1800)
  }

  const revoked = certificate.status === 'revoked'

  return (
    <DashboardLayout>
      <div className="dashboard-content detail-content" onClick={() => setActionsOpen(false)}>
        {/* Header */}
        <header className="detail-heading dashboard-enter">
          <div>
            <Link className="detail-back" to="/certificates">
              <ArrowLeft size={15} /> Back to Certificates
            </Link>
            <nav>
              Certificates <span>/</span> {certificate.id}
            </nav>
            <h1>Certificate Details</h1>
            <p>View credential information, verification status, and blockchain proof.</p>
          </div>
          <div className="detail-header-actions">
            <CertificateStatusBadge status={certificate.status} />
            <button className="cancel-action">
              <Download size={15} /> Download PDF
            </button>
            <button className="issue-action">
              <Mail size={15} /> Send Email
            </button>
            <div className="detail-more">
              <button
                className="cancel-action more-button"
                onClick={(event) => {
                  event.stopPropagation()
                  setActionsOpen(!actionsOpen)
                }}
              >
                <Ellipsis size={17} /> More Actions
              </button>
              {actionsOpen && (
                <div className="detail-more-menu" onClick={(event) => event.stopPropagation()}>
                  <Link to={`/certificates/${certificate.id}/edit`}>
                    <Pencil size={14} /> Edit Certificate
                  </Link>
                  {!revoked && (
                    <button
                      onClick={() => {
                        setActionsOpen(false)
                        setRevokeOpen(true)
                      }}
                    >
                      <TriangleAlert size={14} /> Revoke Certificate
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <StatusBanner certificate={certificate} />

        <div className="detail-grid">
          <CertificateDetailPreview certificate={certificate} />
          <section className="detail-side">
            <CertificateInfoCard certificate={certificate} onCopy={copy} />
            <BlockchainVerificationCard blockchain={certificate.blockchain} onCopy={copy} />
            <CertificateTimeline status={certificate.status} issueDate={certificate.issueDate} />
            <RecipientCard name={certificate.recipientName} email={certificate.recipientEmail} onCopy={copy} />
            <CertificateQuickActions certificateId={certificate.id} status={certificate.status} onCopy={copy} onRevoke={() => setRevokeOpen(true)} />
          </section>
        </div>
      </div>

      {toast && (
        <div className="detail-toast">
          <ShieldCheck size={15} /> {toast}
        </div>
      )}

      {revokeOpen && <RevokeCertificateModal certificate={certificate} onClose={() => setRevokeOpen(false)} onRevoke={() => setRevokeOpen(false)} />}
    </DashboardLayout>
  )
}
