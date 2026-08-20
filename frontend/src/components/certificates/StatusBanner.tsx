import { TriangleAlert } from 'lucide-react'
import type { CertificateDetail } from '../../types/certificate'

interface Props {
  certificate: CertificateDetail
}

export default function StatusBanner({ certificate }: Props) {
  if (certificate.status === 'revoked') {
    return (
      <div className="detail-alert revoked">
        <TriangleAlert size={17} />
        <div>
          <b>This certificate has been revoked</b>
          <span>
            Reason: {certificate.revocationReason}. Public verification will show this credential is
            no longer valid.
          </span>
        </div>
      </div>
    )
  }

  if (certificate.status === 'expired') {
    return (
      <div className="detail-alert expired">
        <TriangleAlert size={17} />
        <div>
          <b>This certificate has expired</b>
          <span>
            Its expiration date was {certificate.expirationDate}. Review the credential history below.
          </span>
        </div>
      </div>
    )
  }

  return null
}
