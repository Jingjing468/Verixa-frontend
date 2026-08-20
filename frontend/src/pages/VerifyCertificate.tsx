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

  const handleVerify = useCallback(() => {
    inputTouched.current = true
    const id = certificateId.trim()

    if (!id) {
      setError('Please enter a Certificate ID.')
      return
    }

    if (!id.startsWith('CERT-')) {
      setError('Please enter a valid Certificate ID.')
      return
    }

    setError(null)
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      window.location.href = `/verify/${id}`
    }, 800)
  }, [certificateId])

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
