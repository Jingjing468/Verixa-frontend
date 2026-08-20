import { Check } from 'lucide-react'

const steps = ['Recipient', 'Details', 'Design', 'Review']
export default function CertificateStepper({ current }: { current: number }) {
  return <nav className="certificate-stepper" aria-label="Certificate creation progress">{steps.map((name, index) => <div className={`stepper-item ${index < current ? 'complete' : ''} ${index === current ? 'current' : ''}`} key={name}><span>{index < current ? <Check size={15} /> : `0${index + 1}`}</span><b>{name}</b>{index < 3 && <i />}</div>)}</nav>
}
