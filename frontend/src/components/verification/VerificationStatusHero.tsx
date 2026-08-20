import { ShieldCheck, ShieldAlert, ShieldOff, SearchX } from 'lucide-react'
import type { VerificationStatus } from '../../types/verification'

interface StatusConfig {
  icon: typeof ShieldCheck
  color: string
  title: string
  message: string
  badge: string
}

const configs: Record<VerificationStatus, StatusConfig> = {
  valid: {
    icon: ShieldCheck,
    color: 'green',
    title: 'Valid Certificate',
    message: 'This credential is authentic and currently valid.',
    badge: 'Blockchain Verified',
  },
  expired: {
    icon: ShieldAlert,
    color: 'orange',
    title: 'Expired Certificate',
    message: 'This credential is authentic, but its validity period has ended.',
    badge: 'Blockchain Record Verified',
  },
  revoked: {
    icon: ShieldOff,
    color: 'red',
    title: 'Revoked Certificate',
    message:
      'This credential was revoked by the issuing organization and is no longer valid.',
    badge: 'Blockchain Record Verified',
  },
  notFound: {
    icon: SearchX,
    color: 'gray',
    title: 'Certificate Not Found',
    message:
      'We couldn\'t find a credential matching this Certificate ID.',
    badge: '',
  },
}

interface Props {
  status: VerificationStatus
}

function VerificationStatusHero({ status }: Props) {
  const config = configs[status]
  const Icon = config.icon

  return (
    <div className="vr-status-hero">
      <div className={`vr-status-icon ${config.color}`}>
        <Icon size={36} />
      </div>
      <h2>{config.title}</h2>
      <p className="vr-status-message">{config.message}</p>
      {config.badge && (
        <span className={`vr-status-badge ${config.color}`}>
          <ShieldCheck size={12} />
          {config.badge}
        </span>
      )}
    </div>
  )
}

export default VerificationStatusHero
