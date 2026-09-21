import { ShieldCheck } from 'lucide-react'

function VerificationHero() {
  return (
    <section className="verify-hero">
      <span className="verify-badge">
        <ShieldCheck size={13} />
        BLOCKCHAIN CERTIFICATE VERIFICATION
      </span>
      <h1>
        Verify a <em>Certificate</em>
      </h1>
      <p>
        Instantly confirm whether a digital credential is authentic, expired, or revoked.
      </p>
      <div className="verify-trust-line">
        <span>No account required</span>
        <span>•</span>
        <span>Secure</span>
        <span>•</span>
        <span>Blockchain-backed</span>
      </div>
    </section>
  )
}

export default VerificationHero
