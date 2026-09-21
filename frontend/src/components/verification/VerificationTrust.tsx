import { ShieldCheck, Zap, Lock } from 'lucide-react'

const cards = [
  {
    icon: ShieldCheck,
    title: 'Blockchain Verified',
    description: 'Certificate proof is checked against its blockchain record.',
  },
  {
    icon: Zap,
    title: 'Instant Results',
    description: 'Verification normally takes only a few seconds.',
  },
  {
    icon: Lock,
    title: 'Privacy Friendly',
    description: 'You do not need to create an account or provide personal information.',
  },
]

function VerificationTrust() {
  return (
    <section className="verify-trust">
      {cards.map(({ icon: Icon, title, description }, index) => (
        <div
          className="verify-trust-card"
          key={title}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <span className="verify-trust-icon">
            <Icon size={20} />
          </span>
          <h4>{title}</h4>
          <p>{description}</p>
        </div>
      ))}
    </section>
  )
}

export default VerificationTrust
