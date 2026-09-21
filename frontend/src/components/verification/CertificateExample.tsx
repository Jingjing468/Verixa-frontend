import { Building2, Check, QrCode, ArrowDown } from 'lucide-react'

function CertificateExample() {
  return (
    <section className="verify-example">
      <h3>Where can I find my Certificate ID?</h3>
      <div className="verify-example-card">
        <div className="verify-example-cert">
          <div className="verify-example-top">
            <span className="verify-example-org">
              <Building2 size={14} />
              Global Tech Institute
            </span>
            <span className="verify-example-verified">
              <Check size={11} />
              Verified
            </span>
          </div>
          <div className="verify-example-body">
            <small>Certificate of Completion</small>
            <h4>Advanced Blockchain Architecture</h4>
          </div>
          <div className="verify-example-bottom">
            <div className="verify-example-id">
              <span>Certificate ID</span>
              <strong>CERT-2026-0001248</strong>
              <ArrowDown size={12} className="verify-example-arrow" />
            </div>
            <div className="verify-example-qr">
              <QrCode size={22} />
              <span>QR Code</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CertificateExample
