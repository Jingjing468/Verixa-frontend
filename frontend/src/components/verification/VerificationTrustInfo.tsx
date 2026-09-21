import { Blocks, Fingerprint, Building2 } from 'lucide-react'

const items = [
  {
    icon: Blocks,
    title: 'Blockchain Record',
    description: 'The credential proof is stored on an immutable blockchain.',
  },
  {
    icon: Fingerprint,
    title: 'Hash Verification',
    description: 'The certificate data matches the recorded blockchain hash.',
  },
  {
    icon: Building2,
    title: 'Issuer Status',
    description: 'The credential status is provided by the issuing organization.',
  },
]

function VerificationTrustInfo() {
  return (
    <div className="vr-trust-section">
      <h3>Why can you trust this result?</h3>
      <div className="vr-trust-grid">
        {items.map(({ icon: Icon, title, description }, index) => (
          <div
            className="vr-trust-item"
            key={title}
            style={{ animationDelay: `${index * 100 + 300}ms` }}
          >
            <span className="vr-trust-icon">
              <Icon size={17} />
            </span>
            <div>
              <strong>{title}</strong>
              <p>{description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VerificationTrustInfo
