import { Search, HelpCircle } from 'lucide-react'

interface Props {
  value: string
  onChange: (value: string) => void
  onVerify: () => void
  error: string | null
}

function CertificateIdForm({ value, onChange, onVerify, error }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onVerify()
  }

  return (
    <div className="verify-form">
      <label className="verify-field-label">Certificate ID</label>
      <div className="verify-input-wrapper">
        <Search size={17} className="verify-input-icon" />
        <input
          type="text"
          className={`verify-input ${error ? 'error' : ''}`}
          placeholder="e.g. CERT-2026-0001248"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
        />
      </div>
      {error && <span className="verify-field-error">{error}</span>}
      <button className="verify-submit" onClick={onVerify}>
        <Search size={15} />
        Verify Certificate
      </button>
      <span className="verify-helper">
        <HelpCircle size={13} />
        You can find the Certificate ID on the digital certificate.
      </span>
    </div>
  )
}

export default CertificateIdForm
