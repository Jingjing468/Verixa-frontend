import { Search, Database, CheckCircle2 } from 'lucide-react'

const steps = [
  {
    icon: Search,
    title: 'Enter ID or Scan QR',
    description: 'Provide the Certificate ID or scan the QR code on the certificate.',
  },
  {
    icon: Database,
    title: 'Check Credential Record',
    description: 'Verixa checks the credential against the blockchain record.',
  },
  {
    icon: CheckCircle2,
    title: 'View Certificate Status',
    description: 'See whether the certificate is valid, expired, or revoked.',
  },
]

function VerificationSteps() {
  return (
    <section className="verify-steps">
      <h2>How Verification Works</h2>
      <div className="verify-steps-grid">
        {steps.map(({ icon: Icon, title, description }, index) => (
          <div className="verify-step" key={title}>
            <span className="verify-step-num">{index + 1}</span>
            <span className="verify-step-icon">
              <Icon size={20} />
            </span>
            <h4>{title}</h4>
            <p>{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default VerificationSteps
