import { Copy, FileText, Mail, ShieldCheck, UserRound, CalendarDays, Building2, GraduationCap } from 'lucide-react'
import CertificateStatusBadge from './CertificateStatusBadge'
import type { CertificateDetail } from '../../types/certificate'

interface Props {
  certificate: CertificateDetail
  onCopy: (text: string, message: string) => void
}

export default function CertificateInfoCard({ certificate, onCopy }: Props) {
  const rows: Array<{ label: string; value: string; icon: typeof FileText; copyable?: boolean }> = [
    { label: 'Certificate ID', value: certificate.certificateId, icon: FileText, copyable: true },
    { label: 'Recipient', value: certificate.recipientName, icon: UserRound },
    { label: 'Recipient Email', value: certificate.recipientEmail, icon: Mail, copyable: true },
    { label: 'Program', value: certificate.course, icon: GraduationCap },
    { label: 'Issuer', value: certificate.issuer, icon: Building2 },
    { label: 'Issue Date', value: certificate.issueDate, icon: CalendarDays },
    { label: 'Expiration Date', value: certificate.expirationDate, icon: CalendarDays },
  ]

  return (
    <article className="detail-card certificate-info">
      <h2>Certificate Information</h2>
      <div>
        {rows.map(({ label, value, icon: Icon, copyable }) => (
          <div className="detail-info-row" key={label}>
            <span><Icon size={15} /></span>
            <small>{label}</small>
            <b>{value}</b>
            {copyable && (
              <button onClick={() => onCopy(value, `${label} copied`)} aria-label={`Copy ${label}`}>
                <Copy size={13} />
              </button>
            )}
          </div>
        ))}
        <div className="detail-info-row">
          <span><ShieldCheck size={15} /></span>
          <small>Status</small>
          <CertificateStatusBadge status={certificate.status} />
        </div>
      </div>
    </article>
  )
}
