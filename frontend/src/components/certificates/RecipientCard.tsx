import { Copy, Send } from 'lucide-react'

interface Props {
  name: string
  email: string
  onCopy: (text: string, message: string) => void
}

export default function RecipientCard({ name, email, onCopy }: Props) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)

  return (
    <article className="detail-card recipient-card">
      <div className="recipient-detail-avatar">{initials}</div>
      <div>
        <small>Certificate Recipient</small>
        <h2>{name}</h2>
        <p>{email}</p>
      </div>
      <div className="recipient-actions">
        <button onClick={() => onCopy(email, 'Recipient email copied')}>
          <Copy size={14} /> Copy Email
        </button>
        <button>
          <Send size={14} /> Send Certificate
        </button>
      </div>
    </article>
  )
}
