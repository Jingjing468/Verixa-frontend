import { CheckCircle2 } from 'lucide-react'

interface Props {
  visible: boolean
  message: string
}

function CopyLinkToast({ visible, message }: Props) {
  if (!visible) return null

  return (
    <div className="vr-toast">
      <CheckCircle2 size={15} />
      {message}
    </div>
  )
}

export default CopyLinkToast
