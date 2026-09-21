import { useRef, useState } from 'react'
import { ImageUp, PenLine, Palette } from 'lucide-react'
import CertificatePreview from './CertificatePreview'
import type { AccentStyle, CertificateFormData, CertificateTemplate } from '../../types/certificate'
type Props = { form: CertificateFormData; onChange: (field: string, value: string) => void }
export default function CertificateDesignStep({ form, onChange }: Props) {
  const logoInput = useRef<HTMLInputElement>(null)
  const signatureInput = useRef<HTMLInputElement>(null)
  const [signatureError, setSignatureError] = useState('')
  const [logoError, setLogoError] = useState('')
  const uploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setLogoError('')
    if (!['image/png', 'image/svg+xml'].includes(file.type)) {
      setLogoError('Choose a PNG or SVG image.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError('Logo must be 2MB or smaller.')
      return
    }
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(new Error('Could not read image'))
        reader.readAsDataURL(file)
      })
      const image = new Image()
      image.src = dataUrl
      await image.decode()
      onChange('organizationLogo', dataUrl)
    } catch {
      setLogoError('Could not read this image. Please choose another file.')
    }
  }
  const uploadSignature = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setSignatureError('')
    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
      setSignatureError('Choose a PNG, JPG or SVG image.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setSignatureError('Signature must be 2MB or smaller.')
      return
    }
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(new Error('Could not read image'))
        reader.readAsDataURL(file)
      })
      const image = new Image()
      image.src = dataUrl
      await image.decode()
      onChange('signature', dataUrl)
    } catch {
      setSignatureError('Could not read this image. Please choose another file.')
    }
  }
  const templates: CertificateTemplate[] = ['classic', 'modern', 'minimal']; const accents: AccentStyle[] = ['blue', 'violet', 'emerald']; return <div className="form-step design-step"><div className="design-intro"><h2>Design your certificate</h2><p>Choose a polished style and make it feel like yours.</p></div><div className="design-layout"><section className="design-controls"><label className="certificate-field">Certificate Template<div className="template-options">{templates.map(template => <button type="button" className={form.template === template ? 'selected' : ''} onClick={() => onChange('template', template)} key={template}><i /><span>{template}</span></button>)}</div></label><label className="certificate-field">Organization Name<div className="certificate-input"><input value={form.organizationName} onChange={e => onChange('organizationName', e.target.value)} placeholder="Kirirom Institute of Technology" /></div></label><div className="certificate-field">Organization Logo
  <input ref={logoInput} type="file" accept="image/png,image/svg+xml" aria-label="Organization logo" hidden onChange={uploadLogo} />
  <button type="button" className="upload-zone" onClick={() => logoInput.current?.click()}>
    {form.organizationLogo ? <img src={form.organizationLogo} alt="Selected organization logo" className="organization-logo-thumbnail" /> : <ImageUp size={19} />}
    <span>{form.organizationLogo ? 'Replace logo' : 'Upload logo'}<small>PNG or SVG, up to 2MB</small></span>
  </button>
  {logoError && <span className="field-error" role="alert">{logoError}</span>}
  {form.organizationLogo && <button type="button" className="cancel-action" onClick={() => onChange('organizationLogo', '')}>Remove logo</button>}
</div><div className="form-split"><label className="certificate-field">Authorized Signer Name<div className="certificate-input"><input value={form.signerName} onChange={e => onChange('signerName', e.target.value)} placeholder="Dr. Sopheak" /></div></label><label className="certificate-field">Signer Title<div className="certificate-input"><input value={form.signerTitle} onChange={e => onChange('signerTitle', e.target.value)} placeholder="Program Director" /></div></label></div><div className="certificate-field">Signature
  <input ref={signatureInput} type="file" accept="image/png,image/jpeg,image/svg+xml" aria-label="Signature image" hidden onChange={uploadSignature} />
  <button type="button" className="signature-upload" onClick={() => signatureInput.current?.click()}>
    {form.signature ? <img src={form.signature} alt="Selected signature" className="signature-thumbnail" /> : <PenLine size={16} />}
    {form.signature ? 'Replace signature' : 'Upload signature (optional)'}
  </button>
  <small>PNG, JPG or SVG, up to 2MB</small>
  {signatureError && <span className="field-error" role="alert">{signatureError}</span>}
  {form.signature && <button type="button" className="cancel-action" onClick={() => onChange('signature', '')}>Remove signature</button>}
</div><div className="accent-picker"><Palette size={17} /><span>Accent style</span>{accents.map(accent => <button type="button" onClick={() => onChange('accent', accent)} className={`${accent} ${form.accent === accent ? 'selected' : ''}`} key={accent} aria-label={`${accent} accent`} />)}</div></section><aside className="design-preview"><span>Live preview</span><CertificatePreview form={form} /></aside></div></div> }
