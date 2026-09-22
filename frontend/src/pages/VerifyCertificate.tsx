import { useState, useCallback, useRef, useEffect } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { VerificationMethod } from '../types/verification'
import VerificationHero from '../components/verification/VerificationHero'
import VerificationCard from '../components/verification/VerificationCard'
import CertificateExample from '../components/verification/CertificateExample'
import VerificationTrust from '../components/verification/VerificationTrust'
import VerificationSteps from '../components/verification/VerificationSteps'
import VerificationLoading from '../components/verification/VerificationLoading'
import PublicNavbar from '../components/common/PublicNavbar'

const certificateIdPattern = /^CERT-\d{4}-\d{7}$/i

function extractCertificateId(value: string): string {
  const trimmed = value.trim()

  if (!trimmed) return ''

  try {
    const url = new URL(trimmed)
    const match = url.pathname.match(/\/verify\/([^/?#]+)/i)

    if (match?.[1]) {
      return decodeURIComponent(match[1]).trim()
    }
  } catch {
    const match = trimmed.match(/\/verify\/([^/?#]+)/i)

    if (match?.[1]) {
      return decodeURIComponent(match[1]).trim()
    }
  }

  return trimmed
}

function VerifyCertificate() {
  const [method, setMethod] = useState<VerificationMethod>('certificateId')
  const [certificateId, setCertificateId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const inputTouched = useRef(false)

  useEffect(() => {
    if (inputTouched.current && certificateId.trim()) {
      setError(null)
    }
  }, [certificateId])

  const handleVerify = useCallback((rawValue = certificateId) => {
    inputTouched.current = true
    const id = extractCertificateId(rawValue)

    if (!id) {
      setError('Please enter a Certificate ID or verification link.')
      return
    }

    if (!certificateIdPattern.test(id)) {
      setError('Please enter a valid Certificate ID or verification QR link.')
      return
    }

    setError(null)
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      window.location.href = `/verify/${encodeURIComponent(id.toUpperCase())}`
    }, 800)
  }, [certificateId])

  const handleQrScan = useCallback((value: string) => {
    setCertificateId(value)
    handleVerify(value)
  }, [handleVerify])

  return (
    <main className="verify-page">
      <PublicNavbar />

      <div className="verify-container">
        <VerificationHero />
        <VerificationCard
          method={method}
          onMethodChange={setMethod}
          certificateId={certificateId}
          onIdChange={setCertificateId}
          onVerify={handleVerify}
          onQrScan={handleQrScan}
          error={error}
        />
        <CertificateExample />
        <VerificationTrust />
        <VerificationSteps />
      </div>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-bottom" style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 32px' }}>
          © 2026 Verixa. All rights reserved.
        </div>
      </footer>

      {loading && <VerificationLoading />}
    </main>
  )
}

export default VerifyCertificate
