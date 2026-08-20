import { useEffect } from 'react'
import { CheckCircle } from 'lucide-react'

interface Props {
  message: string
  duration?: number
  onDismiss: () => void
}

export default function Toast({ message, duration = 2000, onDismiss }: Props) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, duration)
    return () => clearTimeout(timer)
  }, [duration, onDismiss])

  return (
    <div className="shared-toast" role="status" aria-live="polite">
      <CheckCircle size={16} />
      {message}
    </div>
  )
}
