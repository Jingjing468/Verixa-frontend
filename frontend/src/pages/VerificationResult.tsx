import { useState, useCallback, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import PublicNavbar from '../components/common/PublicNavbar'
import {
  ShieldCheck,
  ArrowLeft,
  Link2,
  Download,
  ExternalLink,
} from 'lucide-react'
import type { VerificationResult as VerificationResultType } from '../types/verification'
import VerificationStatusHero from '../components/verification/VerificationStatusHero'
import PublicCertificateSummary from '../components/verification/PublicCertificateSummary'
import PublicCertificatePreview from '../components/verification/PublicCertificatePreview'
import BlockchainProofCard from '../components/verification/BlockchainProofCard'
import VerificationTimeline from '../components/verification/VerificationTimeline'
import VerificationTrustInfo from '../components/verification/VerificationTrustInfo'
import VerificationNotFound from '../components/verification/VerificationNotFound'
import StatusInfoBox from '../components/verification/StatusInfoBox'
import CopyLinkToast from '../components/verification/CopyLinkToast'

const mockData: Record<string, VerificationResultType> = {
  'CERT-2026-0001248': {
    id: 'CERT-2026-0001248',
    recipientName: 'Lim Potkolbotey',
    recipientEmail: 'lim.potkolbotey@kit.edu.kh',
    program: 'Blockchain Development',
    issuer: 'Kirirom Institute of Technology',
    issueDate: 'May 23, 2026',
    expirationDate: 'May 23, 2027',
    status: 'valid',
    blockchain: {
      network: 'Ethereum Sepolia',
      transactionHash: '0x82a7c4f98b6d...91f3',
      blockNumber: 7829143,
      certificateHash: '0x7f3a9c2e8b4d...82ac',
      hashMatched: true,
    },
  },
  'CERT-2026-EXPIRED': {
    id: 'CERT-2026-EXPIRED',
    recipientName: 'Sophea Chan',
    recipientEmail: 'sophea.chan@globaltech.edu',
    program: 'Web Development Fundamentals',
    issuer: 'Global Tech Academy',
    issueDate: 'January 15, 2025',
    expirationDate: 'January 15, 2026',
    status: 'expired',
    blockchain: {
      network: 'Ethereum Sepolia',
      transactionHash: '0x3b1c4a8e9d2f...4f7a',
      blockNumber: 3102845,
      certificateHash: '0xc7e4b2f1a9d3...1a8f',
      hashMatched: true,
    },
  },
  'CERT-2026-REVOKED': {
    id: 'CERT-2026-REVOKED',
    recipientName: 'Dara Mey',
    recipientEmail: 'dara.mey@phnomtech.edu',
    program: 'Data Science Essentials',
    issuer: 'Phnom Tech Institute',
    issueDate: 'March 8, 2026',
    status: 'revoked',
    revokedDate: 'June 12, 2026',
    revocationReason: 'Incorrect certificate information',
    blockchain: {
      network: 'Ethereum Sepolia',
      transactionHash: '0x9d4e2c6b7a1f...2c6b',
      blockNumber: 4501273,
      certificateHash: '0xf1a9d3e7c5b2...7c5e',
      hashMatched: true,
    },
  },
}

function VerificationResult() {
  const { id } = useParams<{ id: string }>()
  const cert = id ? mockData[id] : undefined
  const status = cert ? cert.status : 'notFound'

  const [toast, setToast] = useState({ visible: false, message: '' })
  const toastTimeout = useRef<ReturnType<typeof setTimeout>>(null)

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
        {/* Back link */}
        <Link to="/verify" className="verify-result-back">
          <ArrowLeft size={15} />
          Verify another certificate
        </Link>

        {status === 'notFound' ? (
          <VerificationNotFound />
        ) : (
          <div className="vr-page">
            {/* Status Hero */}
            <VerificationStatusHero status={status} />

            {/* Status info box */}
            {cert && <StatusInfoBox status={status} cert={cert} />}

            {/* Main 2-column layout */}
            {cert && (
              <div className="vr-layout">
                {/* Left column */}
                <div className="vr-main-col">
                  <PublicCertificateSummary cert={cert} onCopy={handleCopy} />
                  <BlockchainProofCard cert={cert} />
                </div>

                {/* Right column */}
                <div className="vr-side-col">
                  <PublicCertificatePreview cert={cert} />
                </div>
              </div>
            )}

            {/* Timeline */}
            {cert && (
              <VerificationTimeline
                status={status}
                issueDate={cert.issueDate}
                expirationDate={cert.expirationDate}
                revokedDate={cert.revokedDate}
              />
            )}

            {/* Actions */}
            <div className="vr-actions">
              <Link to="/verify" className="vr-action-btn primary">
                <ArrowLeft size={14} />
                Verify Another Certificate
              </Link>
              <button className="vr-action-btn secondary" onClick={handleCopyLink}>
                <Link2 size={14} />
                Copy Verification Link
              </button>
              <button className="vr-action-btn secondary" onClick={() => showToast('Download started (mock)')}>
                <Download size={14} />
                Download Certificate
              </button>
            </div>

            {/* Trust info */}
            <VerificationTrustInfo />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="site-footer">
        <div
          className="footer-bottom"
          style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 32px' }}
        >
          © 2026 Verixa. All rights reserved.
        </div>
      </footer>

      {/* Toast */}
      <CopyLinkToast visible={toast.visible} message={toast.message} />
    </main>
  )
}

export default VerificationResult
