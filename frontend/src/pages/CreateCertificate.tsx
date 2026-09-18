import { ArrowLeft, ArrowRight, FileText, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import CertificateStepper from '../components/certificates/CertificateStepper'
import RecipientStep from '../components/certificates/RecipientStep'
import CertificateDetailsStep from '../components/certificates/CertificateDetailsStep'
import CertificateDesignStep from '../components/certificates/CertificateDesignStep'
import ReviewCertificateStep from '../components/certificates/ReviewCertificateStep'
import IssueSuccessModal from '../components/certificates/IssueSuccessModal'
import type { CertificateFormData } from '../types/certificate'
import { apiRequest, getAuthToken } from '../api/client'
import type { RecipientSummary, RecipientsResponse } from '../api/types'

const today = new Date().toISOString().slice(0, 10)
const initialForm: CertificateFormData = {
  recipient: { name: '', email: '', recipientId: '', organization: '' },
  certificateTitle: 'Certificate of Completion',
  program: '',
  description: '',
  issueDate: today,
  hasExpiration: false,
  expirationDate: '',
  achievement: '',
  template: 'classic',
  organizationName: 'Kirirom Institute of Technology',
  signerName: '',
  signerTitle: '',
  accent: 'blue',
}

export default function CreateCertificate() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const selectedRecipientId = params.get('recipientId')
  let draftOwner = 'guest'
  try {
    const payload = JSON.parse(atob((getAuthToken() || '').split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    draftOwner = `${payload.organizationId}_${payload.id}`
  } catch {}
  const draftKey = `verixa_certificate_draft_${draftOwner}`
  const [restoredDraft] = useState(() => {
    try {
      const draft = JSON.parse(localStorage.getItem(draftKey) || 'null')
      return draft?.form?.recipient && typeof draft.form.program === 'string' ? draft : null
    } catch { return null }
  })
  const [step, setStep] = useState(restoredDraft && !selectedRecipientId ? 3 : 0)
  const [form, setForm] = useState<CertificateFormData>(restoredDraft ? { ...initialForm, ...restoredDraft.form } : initialForm)
  const [draftMessage, setDraftMessage] = useState(restoredDraft ? 'Saved draft restored.' : '')
  const [issuedCertificate, setIssuedCertificate] = useState<{ id: string; certificateId: string; recipient: { fullName: string } } | null>(null)
  const [issueWarning, setIssueWarning] = useState('')
  const saveDraft = () => {
    try {
      localStorage.setItem(draftKey, JSON.stringify({ form }))
      setDraftMessage('Draft saved in this browser, including your logo and signature.')
    } catch {
      setErrors({ submit: 'Could not save draft. Browser storage may be full.' })
    }
  }
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [issued, setIssued] = useState(false)
  const [issuing, setIssuing] = useState(false)

  useEffect(() => {
    if (!selectedRecipientId) return
    let active = true
    apiRequest<{ recipient: RecipientSummary }>(`/recipients/${encodeURIComponent(selectedRecipientId)}`, { auth: true })
      .then(({ recipient }) => {
        if (!active) return
        setForm(current => ({ ...current, recipient: { name: recipient.fullName, email: recipient.email, recipientId: recipient.id, organization: '' } }))
        setStep(0)
      })
      .catch(error => { if (active) setErrors({ submit: error instanceof Error ? error.message : 'Could not load recipient' }) })
    return () => { active = false }
  }, [selectedRecipientId])

  const change = (field: string, value: string | boolean) => {
    if (field in form.recipient) {
      setForm((current) => ({ ...current, recipient: { ...current.recipient, [field]: value } }))
    } else {
      setForm((current) => ({ ...current, [field]: value }))
    }
    setDraftMessage('')
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (step === 0 || step === 3) {
      if (!form.recipient.name.trim()) nextErrors.name = 'Recipient name is required.'
      if (!/^\S+@\S+\.\S+$/.test(form.recipient.email)) nextErrors.email = 'Enter a valid email address.'
    }
    if (step === 1 || step === 3) {
      if (!form.certificateTitle.trim()) nextErrors.certificateTitle = 'Certificate title is required.'
      if (!form.program.trim()) nextErrors.program = 'Program is required.'
      if (!form.issueDate) nextErrors.issueDate = 'Issue date is required.'
    }
    setErrors(nextErrors)
    return !Object.keys(nextErrors).length
  }

  const next = () => {
    if (validate()) setStep((current) => Math.min(3, current + 1))
  }

  const issueCertificate = async () => {
    if (issuing || !validate()) return
    setIssuing(true)
    setErrors({})

    try {
      let recipientId = ''

      {
        const existingRecipients = await apiRequest<RecipientsResponse>(
          `/recipients?search=${encodeURIComponent(form.recipient.email.trim())}`,
          { auth: true }
        )
        const existingRecipient = existingRecipients.recipients.find(
          (recipient) => recipient.email.toLowerCase() === form.recipient.email.trim().toLowerCase()
        )

        if (existingRecipient) {
          recipientId = existingRecipient.id
        } else {
          const recipientResponse = await apiRequest<{ success: true; recipient: RecipientSummary }>('/recipients', {
            method: 'POST',
            auth: true,
            body: {
              fullName: form.recipient.name,
              email: form.recipient.email,
              phone: null,
            },
          })
          recipientId = recipientResponse.recipient.id
        }
      }

      const pdfImage = async (source?: string) => {
        if (!source) return ''
        const image = new Image()
        image.src = source
        await image.decode()
        const canvas = document.createElement('canvas')
        const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight))
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
        canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height)
        return canvas.toDataURL('image/png')
      }
      const result = await apiRequest<{ certificate: { id: string; certificateId: string; recipient: { fullName: string } }; warnings?: string[] }>('/certificates', {
        method: 'POST',
        auth: true,
        body: {
          design: {
            recipientName: form.recipient.name, certificateTitle: form.certificateTitle, template: form.template, accent: form.accent,
            organizationName: form.organizationName, signerName: form.signerName, signerTitle: form.signerTitle,
            organizationLogo: await pdfImage(form.organizationLogo), signature: await pdfImage(form.signature),
          },
          recipientId,
          courseName: form.program,
          issueDate: form.issueDate,
          expiryDate: form.hasExpiration ? form.expirationDate : null,
        },
      })
      setIssuedCertificate(result.certificate)
      setIssueWarning(result.warnings?.join(' ') || '')
      try { localStorage.removeItem(draftKey) } catch {}
      setDraftMessage('')
      setIssued(true)
    } catch (requestError) {
      setErrors({ submit: requestError instanceof Error ? requestError.message : 'Could not issue certificate' })
    } finally {
      setIssuing(false)
    }
  }

  const startOver = () => {
    setForm(initialForm)
    setStep(0)
    setIssued(false)
  }

  return (
    <DashboardLayout>
      <div className="dashboard-content certificate-content">
        <div className="certificate-page-heading">
          <div>
            <nav>Certificates <span>/</span> Issue Certificate</nav>
            <h1>Issue a New Certificate</h1>
            <p>Create a secure digital credential for your recipient.</p>
          </div>
          <span className="draft-status"><i /> Draft</span>
        </div>
        <div className="certificate-workspace dashboard-enter">
          <CertificateStepper current={step} />
          <div className="certificate-panel">
            {step === 0 && <RecipientStep form={form} errors={errors} onChange={change} />}
            {step === 1 && <CertificateDetailsStep form={form} errors={errors} onChange={change} />}
            {step === 2 && <CertificateDesignStep form={form} onChange={change} />}
            {step === 3 && <ReviewCertificateStep form={form} />}
            {draftMessage && <p role="status">{draftMessage}</p>}
            {errors.submit && <span className="field-error">{errors.submit}</span>}
          </div>
          <footer className="certificate-actions">
            {step === 0 ? <Link to="/dashboard" className="cancel-action">Cancel</Link> : <button className="cancel-action" disabled={issuing} onClick={() => setStep((current) => current - 1)}><ArrowLeft size={16} /> Back</button>}
            <div>
              {step === 3 && <button type="button" className="save-draft" onClick={saveDraft} disabled={issuing}><Save size={15} /> Save as Draft</button>}
              {step < 3
                ? <button className="issue-action" onClick={next}>Continue <ArrowRight size={16} /></button>
                : <button className="issue-action" onClick={issueCertificate} disabled={issuing}><FileText size={16} /> {issuing ? 'Issuing...' : 'Issue Certificate'}</button>}
            </div>
          </footer>
        </div>
      </div>
      {issued && issuedCertificate && <IssueSuccessModal certificateId={issuedCertificate.certificateId} recipientName={issuedCertificate.recipient.fullName} warning={issueWarning} onClose={() => navigate(`/certificates/${issuedCertificate.id}`)} onAnother={startOver} />}
    </DashboardLayout>
  )
}
