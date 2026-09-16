import { useEffect, useState } from 'react'
import { ArrowLeft, Download, Ellipsis, Mail, Pencil, ShieldCheck, TriangleAlert } from 'lucide-react'
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
import type { CertificateDetail as CertificateDetailType } from '../types/certificate'
import { apiRequest, apiUrl, getAuthToken } from '../api/client'
import type { CertificateDetailResponse } from '../api/types'

const mapCertificateDetail = (response: CertificateDetailResponse): CertificateDetailType => ({
  id: response.certificate.id,
  recipientName: response.certificate.recipient.fullName,
  recipientEmail: response.certificate.recipient.email,
  course: response.certificate.courseName,
  issueDate: response.certificate.issueDate,
  expirationDate: response.certificate.expiryDate ?? 'No expiry',
  status: response.certificate.status,
  blockchainVerified: true,
  title: 'Certificate of Completion',
  issuer: response.certificate.organization.name,
  revocationReason: response.certificate.revocation?.reason,
  blockchain: {
    network: 'Ethereum Sepolia',
    transactionHash: 'Available in public verification',
    blockNumber: 0,
    certificateHash: 'SHA-256 hash stored by backend',
    verified: true,
  },
})

export default function CertificateDetail() {
  const { id = '' } = useParams()
  const [certificate, setCertificate] = useState<CertificateDetailType | null>(null)
  const [actionsOpen, setActionsOpen] = useState(false)
  const [revokeOpen, setRevokeOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')

  const loadCertificate = () => {
    apiRequest<CertificateDetailResponse>(`/certificates/${id}`, { auth: true })
      .then((response) => setCertificate(mapCertificateDetail(response)))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Could not load certificate'))
  }

  useEffect(() => {
    loadCertificate()
  }, [id])

  const copy = (text: string, message: string) => {
    navigator.clipboard?.writeText(text)
    setToast(message)
    window.setTimeout(() => setToast(''), 1800)
  }

  const downloadPdf = () => {
    const token = getAuthToken()
    fetch(apiUrl(`/certificates/${id}/pdf`), {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((response) => {
        if (!response.ok) throw new Error('Could not download certificate PDF')
        return response.blob()
      })
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = objectUrl
        link.download = `${certificate?.id ?? 'certificate'}.pdf`
        link.click()
        URL.revokeObjectURL(objectUrl)
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Could not download certificate PDF'))
  }

  const sendEmail = () => {
    apiRequest(`/certificates/${id}/send`, { method: 'POST', auth: true })
      .then(() => setToast('Certificate email sent'))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Could not send certificate email'))
  }

  const revoke = () => {
    apiRequest(`/certificates/${id}/revoke`, {
      method: 'POST',
      auth: true,
      body: { reason: 'Revoked from admin certificate detail' },
    })
      .then(() => {
        setRevokeOpen(false)
        loadCertificate()
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Could not revoke certificate'))
  }

  if (!certificate) {
    return (
      <DashboardLayout>
        <div className="dashboard-content detail-content">
          <Link className="detail-back" to="/certificates"><ArrowLeft size={15} /> Back to Certificates</Link>
          <p>{error || 'Loading certificate...'}</p>
        </div>
      </DashboardLayout>
    )
  }

  const revoked = certificate.status === 'revoked'

  return (
    <DashboardLayout>
      <div className="dashboard-content detail-content" onClick={() => setActionsOpen(false)}>
        <header className="detail-heading dashboard-enter">
          <div>
            <Link className="detail-back" to="/certificates">
              <ArrowLeft size={15} /> Back to Certificates
            </Link>
            <nav>Certificates <span>/</span> {certificate.id}</nav>
            <h1>Certificate Details</h1>
            <p>View credential information, verification status, and blockchain proof.</p>
          </div>
          <div className="detail-header-actions">
            <CertificateStatusBadge status={certificate.status} />
            <button className="cancel-action" onClick={downloadPdf}><Download size={15} /> Download PDF</button>
            <button className="issue-action" onClick={sendEmail}><Mail size={15} /> Send Email</button>
            <div className="detail-more">
              <button className="cancel-action more-button" onClick={(event) => { event.stopPropagation(); setActionsOpen(!actionsOpen) }}>
                <Ellipsis size={17} /> More Actions
              </button>
              {actionsOpen && (
                <div className="detail-more-menu" onClick={(event) => event.stopPropagation()}>
                  <Link to={`/certificates/${certificate.id}/edit`}><Pencil size={14} /> Edit Certificate</Link>
                  {!revoked && <button onClick={() => { setActionsOpen(false); setRevokeOpen(true) }}><TriangleAlert size={14} /> Revoke Certificate</button>}
                </div>
              )}
            </div>
          </div>
        </header>
        {error && <span className="field-error">{error}</span>}

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

      {toast && <div className="detail-toast"><ShieldCheck size={15} /> {toast}</div>}
      {revokeOpen && <RevokeCertificateModal certificate={certificate} onClose={() => setRevokeOpen(false)} onRevoke={revoke} />}
    </DashboardLayout>
  )
}
