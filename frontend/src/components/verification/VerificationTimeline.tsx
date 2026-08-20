import { FileCheck2, Blocks, Clock, ShieldCheck, ShieldOff, AlertTriangle } from 'lucide-react'
import type { VerificationStatus } from '../../types/verification'

interface TimelineEvent {
  icon: typeof FileCheck2
  label: string
  color: string
}

interface Props {
  status: VerificationStatus
  issueDate: string
  expirationDate?: string
  revokedDate?: string
}

function VerificationTimeline({ status, issueDate, expirationDate, revokedDate }: Props) {
  const events: TimelineEvent[] = [
    { icon: FileCheck2, label: `Certificate Issued — ${issueDate}`, color: 'blue' },
    { icon: Blocks, label: 'Recorded on Blockchain', color: 'purple' },
  ]

  if (status === 'expired') {
    events.push({
      icon: AlertTriangle,
      label: `Certificate Expired — ${expirationDate || 'N/A'}`,
      color: 'orange',
    })
  } else if (status === 'revoked') {
    events.push({
      icon: ShieldOff,
      label: `Certificate Revoked — ${revokedDate || 'N/A'}`,
      color: 'red',
    })
  }

  events.push({
    icon: status === 'valid' ? ShieldCheck : Clock,
    label: status === 'valid' ? 'Verification Successful' : 'Verification Checked',
    color: status === 'valid' ? 'green' : 'slate',
  })

  return (
    <div className="vr-timeline">
      <h3>Verification Timeline</h3>
      <div className="vr-timeline-track">
        {events.map(({ icon: Icon, label, color }, index) => (
          <div
            className="vr-timeline-event"
            key={label}
            style={{ animationDelay: `${index * 100 + 200}ms` }}
          >
            <span className={`vr-timeline-dot ${color}`}>
              <Icon size={13} />
            </span>
            {index < events.length - 1 && <span className="vr-timeline-line" />}
            <span className="vr-timeline-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VerificationTimeline
