import { ArrowLeft, ArrowRight, FileText, Save } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import CertificateStepper from '../components/certificates/CertificateStepper'
import RecipientStep from '../components/certificates/RecipientStep'
import CertificateDetailsStep from '../components/certificates/CertificateDetailsStep'
import CertificateDesignStep from '../components/certificates/CertificateDesignStep'
import ReviewCertificateStep from '../components/certificates/ReviewCertificateStep'
import IssueSuccessModal from '../components/certificates/IssueSuccessModal'
import type { CertificateFormData } from '../types/certificate'
import { apiRequest } from '../api/client'
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
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [issued, setIssued] = useState(false)
  const [issuing, setIssuing] = useState(false)

  const change = (field: string, value: string | boolean) => {
    if (field in form.recipient) {
      setForm((current) => ({ ...current, recipient: { ...current.recipient, [field]: value } }))
    } else {
      setForm((current) => ({ ...current, [field]: value }))
    }
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (step === 0) {
      if (!form.recipient.name.trim()) nextErrors.name = 'Recipient name is required.'
      if (!/^\S+@\S+\.\S+$/.test(form.recipient.email)) nextErrors.email = 'Enter a valid email address.'
    }
    if (step === 1) {
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
    setIssuing(true)
    setErrors({})

    try {
      let recipientId = form.recipient.recipientId

      if (!recipientId) {
        const existingRecipients = await apiRequest<RecipientsResponse>(
          `/recipients?search=${encodeURIComponent(form.recipient.email)}`,
          { auth: true }
        )
        const existingRecipient = existingRecipients.recipients.find(
          (recipient) => recipient.email.toLowerCase() === form.recipient.email.toLowerCase()
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

      await apiRequest('/certificates', {
        method: 'POST',
        auth: true,
        body: {
          recipientId,
          courseName: form.program,
          issueDate: form.issueDate,
          expiryDate: form.hasExpiration ? form.expirationDate : null,
        },
      })
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
            {errors.submit && <span className="field-error">{errors.submit}</span>}
          </div>
          <footer className="certificate-actions">
            {step === 0 ? <Link to="/dashboard" className="cancel-action">Cancel</Link> : <button className="cancel-action" onClick={() => setStep((current) => current - 1)}><ArrowLeft size={16} /> Back</button>}
            <div>
              {step === 3 && <button className="save-draft"><Save size={15} /> Save as Draft</button>}
              {step < 3
                ? <button className="issue-action" onClick={next}>Continue <ArrowRight size={16} /></button>
                : <button className="issue-action" onClick={issueCertificate} disabled={issuing}><FileText size={16} /> {issuing ? 'Issuing...' : 'Issue Certificate'}</button>}
            </div>
          </footer>
        </div>
      </div>
      {issued && <IssueSuccessModal onClose={() => setIssued(false)} onAnother={startOver} />}
    </DashboardLayout>
  )
}
