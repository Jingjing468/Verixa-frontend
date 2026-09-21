import type { CertificateStatus } from '../../types/certificate'
export default function CertificateStatusBadge({ status }: { status: CertificateStatus }) { return <span className={`certificate-status ${status}`}>{status}</span> }
