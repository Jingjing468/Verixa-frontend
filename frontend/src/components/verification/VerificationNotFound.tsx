import { SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'

function VerificationNotFound() {
  return (
    <div className="vr-not-found">
      <span className="vr-not-found-icon">
        <SearchX size={40} />
      </span>
      <h2>Certificate Not Found</h2>
      <p>
        We couldn't find a credential matching this Certificate ID.
        Please double-check the ID and try again.
      </p>
      <Link to="/verify" className="vr-not-found-btn">
        Try Again
      </Link>
    </div>
  )
}

export default VerificationNotFound
