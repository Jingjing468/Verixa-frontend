import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { apiRequest } from '../../api/client'
import type { RecipientSummary } from '../../api/types'

export default function AddRecipientModal({ onClose, onCreated }: { onClose: () => void; onCreated: (recipient: RecipientSummary) => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { dialog.current?.showModal() }, [])
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (saving) return
    if (!fullName.trim()) { setError('Enter the recipient’s full name.'); return }
    setSaving(true)
    setError('')
    try {
      const result = await apiRequest<{ success: true; recipient: RecipientSummary }>('/recipients', {
        method: 'POST', auth: true,
        body: { fullName: fullName.trim(), email: email.trim(), phone: phone.trim() || null },
      })
      onCreated(result.recipient)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not add recipient')
    } finally { setSaving(false) }
  }
  return (
    <dialog ref={dialog} className="add-recipient-modal" aria-labelledby="add-recipient-title" onCancel={(event) => { event.preventDefault(); if (!saving) onClose() }}>
      <header><h2 id="add-recipient-title">Add Recipient</h2><button type="button" className="cancel-action" aria-label="Close" disabled={saving} onClick={onClose}><X size={18} /></button></header>
      <p>Add someone to your organization’s recipient list.</p>
      <form onSubmit={submit}>
        <div className="settings-field"><label htmlFor="recipient-name">Full Name</label><input id="recipient-name" autoFocus required maxLength={200} value={fullName} onChange={e => setFullName(e.target.value)} disabled={saving} /></div>
        <div className="settings-field"><label htmlFor="recipient-email">Email Address</label><input id="recipient-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={saving} /></div>
        <div className="settings-field"><label htmlFor="recipient-phone">Phone Number (optional)</label><input id="recipient-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} disabled={saving} /></div>
        {error && <p className="field-error" role="alert">{error}</p>}
        <footer><button type="button" className="cancel-action" disabled={saving} onClick={onClose}>Cancel</button><button type="submit" className="issue-action" disabled={saving}>{saving ? 'Adding...' : 'Add Recipient'}</button></footer>
      </form>
    </dialog>
  )
}
