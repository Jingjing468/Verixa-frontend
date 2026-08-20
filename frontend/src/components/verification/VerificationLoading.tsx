import { ShieldCheck } from 'lucide-react'

function VerificationLoading() {
  return (
    <div className="verify-loading-backdrop">
      <div className="verify-loading-card">
        <div className="verify-loading-shield">
          <ShieldCheck size={36} />
        </div>
        <span className="verify-loading-text">Checking certificate…</span>
        <div className="verify-loading-bar">
          <div className="verify-loading-bar-fill" />
        </div>
      </div>
    </div>
  )
}

export default VerificationLoading
