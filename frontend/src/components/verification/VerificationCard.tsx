import { CreditCard, QrCode } from 'lucide-react'
import type { VerificationMethod } from '../../types/verification'
import CertificateIdForm from './CertificateIdForm'
import QrScanner from './QrScanner'

interface Props {
  method: VerificationMethod
  onMethodChange: (method: VerificationMethod) => void
  certificateId: string
  onIdChange: (id: string) => void
  onVerify: () => void
  onQrScan: (value: string) => void
  error: string | null
}

function VerificationCard({
  method,
  onMethodChange,
  certificateId,
  onIdChange,
  onVerify,
  onQrScan,
  error,
}: Props) {
  return (
    <section className="verify-card-wrap">
      <div className="verify-card">
        <div className="verify-tabs">
          <button
            className={`verify-tab ${method === 'certificateId' ? 'active' : ''}`}
            onClick={() => onMethodChange('certificateId')}
          >
            <CreditCard size={15} />
            Certificate ID
          </button>
          <button
            className={`verify-tab ${method === 'qr' ? 'active' : ''}`}
            onClick={() => onMethodChange('qr')}
          >
            <QrCode size={15} />
            Scan QR Code
          </button>
        </div>
        <div className="verify-card-body">
          {method === 'certificateId' ? (
            <CertificateIdForm
              value={certificateId}
              onChange={onIdChange}
              onVerify={onVerify}
              error={error}
            />
          ) : (
            <QrScanner onScan={onQrScan} />
          )}
        </div>
      </div>
    </section>
  )
}

export default VerificationCard
