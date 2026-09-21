import { useState, useCallback, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import PublicNavbar from '../components/common/PublicNavbar'
import { ArrowLeft, Link2, Download } from 'lucide-react'
import type { VerificationResult as VerificationResultType, VerificationStatus } from '../types/verification'
import type { PublicVerificationResponse } from '../api/types'
import { apiRequest } from '../api/client'
import VerificationStatusHero from '../components/verification/VerificationStatusHero'
import PublicCertificateSummary from '../components/verification/PublicCertificateSummary'
import PublicCertificatePreview from '../components/verification/PublicCertificatePreview'
import BlockchainProofCard from '../components/verification/BlockchainProofCard'
import VerificationTimeline from '../components/verification/VerificationTimeline'
import VerificationTrustInfo from '../components/verification/VerificationTrustInfo'
import VerificationNotFound from '../components/verification/VerificationNotFound'
import StatusInfoBox from '../components/verification/StatusInfoBox'
import CopyLinkToast from '../components/verification/CopyLinkToast'
import VerificationLoading from '../components/verification/VerificationLoading'

const toVerificationStatus = (status: PublicVerificationResponse['status']): VerificationStatus =>
  status === 'not_found' ? 'notFound' : status

const toDisplayDate = (value: string | null | undefined): string | undefined =>
  value ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : undefined

const mapBackendVerification = (
  data: PublicVerificationResponse
): VerificationResultType | null => {
  if (!data.success || !data.certificate) return null

  return {
    id: data.certificate.certificateId,
    recipientName: data.certificate.recipientName,
    program: data.certificate.courseName,
    issuer: data.certificate.organizationName,
    issueDate: toDisplayDate(data.certificate.issueDate) ?? data.certificate.issueDate,
    expirationDate: toDisplayDate(data.certificate.expiryDate),
    status: toVerificationStatus(data.status),
    revokedDate: data.revocation?.revokedAt
      ? new Date(data.revocation.revokedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      : undefined,
    revocationReason: data.revocation?.reason,
    blockchain: {
      network: data.blockchain?.network ?? 'Not anchored yet',
      transactionHash: data.blockchain?.transactionHash ?? 'Not available',
      blockNumber: 0,
      certificateHash: data.integrity?.databaseHashMatched ? 'Database hash matched' : 'Hash mismatch',
      hashMatched: Boolean(data.integrity?.databaseHashMatched),
    },
  }
}

function VerificationResult() {
  const { id } = useParams<{ id: string }>()
  const [cert, setCert] = useState<VerificationResultType | null>(null)
  const [status, setStatus] = useState<VerificationStatus>('notFound')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ visible: false, message: '' })
  const toastTimeout = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    const controller = new AbortController()

    const verifyCertificate = async () => {
      if (!id) {
        setStatus('notFound')
        setCert(null)
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const data = await apiRequest<PublicVerificationResponse>(
          `/verify/${encodeURIComponent(id)}`
        )
        const mappedCertificate = mapBackendVerification(data)

        setCert(mappedCertificate)
        setStatus(mappedCertificate ? mappedCertificate.status : toVerificationStatus(data.status))
      } catch {
        if (!controller.signal.aborted) {
          setCert(null)
          setStatus('notFound')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    verifyCertificate()

    return () => controller.abort()
  }, [id])

  useEffect(() => {
    return () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current)
    }
  }, [])

  const showToast = useCallback((message: string) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current)
    setToast({ visible: true, message })
    toastTimeout.current = setTimeout(() => setToast({ visible: false, message: '' }), 2500)
  }, [])

  const handleCopy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`${label} copied`)
    }).catch(() => {
      showToast(`${label} copied`)
    })
  }, [showToast])

  const handleCopyLink = useCallback(() => {
    handleCopy(window.location.href, 'Verification link')
  }, [handleCopy])

  return (
    <main className="verify-page">
      <PublicNavbar />

      <div className="verify-container">
        <Link to="/verify" className="verify-result-back">
          <ArrowLeft size={15} />
          Verify another certificate
        </Link>

        {loading ? (
          <VerificationLoading />
        ) : status === 'notFound' ? (
          <VerificationNotFound />
        ) : (
          <div className="vr-page">
            <VerificationStatusHero status={status} />
            {cert && <StatusInfoBox status={status} cert={cert} />}
            {cert && (
              <div className="vr-layout">
                <div className="vr-main-col">
                  <PublicCertificateSummary cert={cert} onCopy={handleCopy} />
                  <BlockchainProofCard cert={cert} />
                </div>
                <div className="vr-side-col">
                  <PublicCertificatePreview cert={cert} />
                </div>
              </div>
            )}
            {cert && (
              <VerificationTimeline
                status={status}
                issueDate={cert.issueDate}
                expirationDate={cert.expirationDate}
                revokedDate={cert.revokedDate}
              />
            )}
            <div className="vr-actions">
              <Link to="/verify" className="vr-action-btn primary">
                <ArrowLeft size={14} />
                Verify Another Certificate
              </Link>
              <button className="vr-action-btn secondary" onClick={handleCopyLink}>
                <Link2 size={14} />
                Copy Verification Link
              </button>
              <button className="vr-action-btn secondary" onClick={() => showToast('Download is available from the admin certificate page')}>
                <Download size={14} />
                Download Certificate
              </button>
            </div>
            <VerificationTrustInfo />
          </div>
        )}
      </div>

      <footer className="site-footer">
        <div className="footer-bottom" style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 32px' }}>
          © 2026 Verixa. All rights reserved.
        </div>
      </footer>

      <CopyLinkToast visible={toast.visible} message={toast.message} />
    </main>
  )
}

export default VerificationResult
