import type { CertificateStatus } from '../../types/certificate'

interface Props {
  status: CertificateStatus
  issueDate: string
  blockchainVerified: boolean
}

interface TimelineEvent {
  date: string
  label: string
  current?: boolean
}

export default function CertificateTimeline({ status, issueDate, blockchainVerified }: Props) {
  const events: TimelineEvent[] = [
    { date: issueDate, label: 'Certificate Created' },
    {
      date: blockchainVerified ? issueDate : 'Not anchored',
      label: blockchainVerified ? 'Recorded on Blockchain' : 'Issued without Blockchain Anchor',
    },
    { date: issueDate, label: 'Email Sent to Recipient' },
    {
      date: 'Current',
      label:
        status === 'valid'
          ? 'Certificate Valid'
          : status === 'expired'
            ? 'Certificate Expired'
            : 'Certificate Revoked',
      current: true,
    },
  ]

  return (
    <article className="detail-card activity-card">
      <h2>Certificate Activity</h2>
      <div className="activity-timeline">
        {events.map((event, index) => (
          <div
            className={event.current ? `current ${status}` : ''}
            key={event.label}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <i />
            <small>{event.date}</small>
            <b>{event.label}</b>
          </div>
        ))}
      </div>
    </article>
  )
}
