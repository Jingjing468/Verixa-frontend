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
  certificateId: response.certificate.certificateId,
  recipientName: response.certificate.recipient.fullName,
  recipientEmail: response.certificate.recipient.email,
  course: response.certificate.courseName,
  issueDate: response.certificate.issueDate,
  expirationDate: response.certificate.expiryDate ?? 'No expiry',
  status: response.certificate.status,
  blockchainVerified: response.certificate.blockchain?.verificationStatus === 'Verified',
  title: response.certificate.design?.certificateTitle || 'Certificate of Completion',
  issuer: response.certificate.organization.name,
  organizationLogo: response.certificate.design?.organizationLogo,
  revocationReason: response.certificate.revocation?.reason,
  blockchain: {
    network: response.certificate.blockchain?.network ?? 'Not anchored',
    transactionHash: response.certificate.blockchain?.transactionHash ?? '',
    blockNumber: response.certificate.blockchain?.blockNumber ?? 0,
    contractAddress: response.certificate.blockchain?.contractAddress ?? null,
    certificateHash: response.certificate.blockchain?.certificateHash ?? '',
    verificationStatus: response.certificate.blockchain?.verificationStatus ?? 'Not available',
    verified: response.certificate.blockchain?.verificationStatus === 'Verified',
    message: response.certificate.blockchain?.message,
  },
})

export default function CertificateDetail() {
  const { id = '' } = useParams()
  const [certificate, setCertificate] = useState<CertificateDetailType | null>(null)
  const [actionsOpen, setActionsOpen] = useState(false)
  const [revokeOpen, setRevokeOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)

  const loadCertificate = () => {
    apiRequest<CertificateDetailResponse>(`/certificates/${id}`, { auth: true })
      .then((response) => setCertificate(mapCertificateDetail(response)))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Could not load certificate'))
  }

  useEffect(() => {
    loadCertificate()
  }, [id])

  const copy = (text: string, message: string) => {
    if (text) {
      navigator.clipboard?.writeText(text)
    }
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
        link.download = `${certificate?.certificateId ?? 'certificate'}.pdf`
        link.click()
        URL.revokeObjectURL(objectUrl)
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Could not download certificate PDF'))
  }

  const sendEmail = async () => {
    if (sendingEmail) return
    setSendingEmail(true)
    setError('')
    setToast('')
    try {
      const result = await apiRequest<{ success: boolean; message: string }>(`/certificates/${id}/send`, { method: 'POST', auth: true })
      if (!result.success) throw new Error(result.message)
      setToast(`Certificate email sent to ${certificate?.recipientEmail}`)
      window.setTimeout(() => setToast(''), 5000)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not send certificate email')
    } finally {
      setSendingEmail(false)
    }
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
            <nav>Certificates <span>/</span> {certificate.certificateId}</nav>
            <h1>Certificate Details</h1>
            <p>View credential information, verification status, and blockchain proof.</p>
          </div>
          <div className="detail-header-actions">
            <CertificateStatusBadge status={certificate.status} />
            <button className="cancel-action" onClick={downloadPdf}><Download size={15} /> Download PDF</button>
            <button type="button" className="issue-action" onClick={sendEmail} disabled={sendingEmail || certificate.status === 'revoked'} aria-busy={sendingEmail}><Mail size={15} /> {sendingEmail ? 'Sending...' : 'Send Email'}</button>
            <div className="detail-more">
              <button type="button" className="cancel-action more-button" aria-expanded={actionsOpen} aria-controls="certificate-more-actions" onKeyDown={(event) => { if (event.key === 'Escape') setActionsOpen(false) }} onClick={(event) => { event.stopPropagation(); setActionsOpen(!actionsOpen) }}>
                <Ellipsis size={17} /> More Actions
              </button>
              {actionsOpen && (
                <div id="certificate-more-actions" className="detail-more-menu" onKeyDown={(event) => { if (event.key === 'Escape') { setActionsOpen(false); event.currentTarget.parentElement?.querySelector('button')?.focus() } }} onClick={(event) => event.stopPropagation()}>
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
            <CertificateTimeline status={certificate.status} issueDate={certificate.issueDate} blockchainVerified={certificate.blockchainVerified} />
            <RecipientCard name={certificate.recipientName} email={certificate.recipientEmail} onCopy={copy} />
            <CertificateQuickActions
              certificateId={certificate.certificateId}
              certificateRecordId={certificate.id}
              status={certificate.status}
              onCopy={copy}
              onDownload={downloadPdf}
              onSendEmail={sendEmail}
              onRevoke={() => setRevokeOpen(true)}
              sendingEmail={sendingEmail}
            />
          </section>
        </div>
      </div>

      {toast && <div className="detail-toast"><ShieldCheck size={15} /> {toast}</div>}
      {revokeOpen && <RevokeCertificateModal certificate={certificate} onClose={() => setRevokeOpen(false)} onRevoke={revoke} />}
    </DashboardLayout>
  )
}
