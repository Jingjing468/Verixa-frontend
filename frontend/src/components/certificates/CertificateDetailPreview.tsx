import { useEffect, useRef, useState } from 'react'
import { apiUrl, getAuthToken } from '../../api/client'
import { ArrowUpRight, Award, QrCode, ShieldCheck, Link2 } from 'lucide-react'
import type { CertificateDetail } from '../../types/certificate'

interface Props {
  certificate: CertificateDetail
}

export default function CertificateDetailPreview({ certificate }: Props) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [pdfUrl, setPdfUrl] = useState('')
  const [qrUrl, setQrUrl] = useState('')
  const [previewError, setPreviewError] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    let url = ''
    const token = getAuthToken()

    fetch(apiUrl(`/certificates/${certificate.id}/qr`), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: controller.signal,
    })
      .then(async response => {
        if (!response.ok) throw new Error('Could not load certificate QR')
        const blob = await response.blob()
        if (controller.signal.aborted) return
        url = URL.createObjectURL(blob)
        setQrUrl(url)
      })
      .catch(() => setQrUrl(''))

    return () => {
      controller.abort()
      if (url) URL.revokeObjectURL(url)
    }
  }, [certificate.id])

  useEffect(() => {
    if (!previewOpen) return
    dialog.current?.showModal()
    const controller = new AbortController()
    let url = ''
    setPreviewError('')
    setPdfUrl('')
    const token = getAuthToken()
    fetch(apiUrl(`/certificates/${certificate.id}/pdf`), { headers: token ? { Authorization: `Bearer ${token}` } : {}, signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error('Could not load certificate PDF')
        const blob = await response.blob()
        if (controller.signal.aborted) return
        url = URL.createObjectURL(blob)
        setPdfUrl(url)
      }).catch(error => { if (!controller.signal.aborted) setPreviewError(error.message) })
    return () => { controller.abort(); if (url) URL.revokeObjectURL(url) }
  }, [previewOpen, certificate.id])
  return (
    <section className="detail-preview-column">
      <div className="detail-certificate">
        {/* Decorative corners */}
        <div className="cert-decor cert-decor-tl" />
        <div className="cert-decor cert-decor-br" />

        {/* Blockchain watermark */}
        <div className="cert-blockchain-watermark">
          <Link2 size={90} />
        </div>

        {/* Header */}
        <div className="detail-cert-header">
          {certificate.organizationLogo && <img src={certificate.organizationLogo} alt="Organization logo" className="detail-organization-logo" />}
          <span className="detail-cert-verified">
            <ShieldCheck size={15} /> {certificate.blockchainVerified ? 'Blockchain verified' : 'Credential issued'}
          </span>
        </div>

        {/* Body */}
        <div className="detail-cert-body">
          <p>Certificate of Completion</p>
          <h2>{certificate.title}</h2>
          <span>Presented to</span>
          <h3>{certificate.recipientName}</h3>
          <span>For successfully completing</span>
          <h4>{certificate.course}</h4>
        </div>

        {/* Footer */}
        <div className="detail-cert-footer">
          <div>
            <small>Issued by</small>
            <b>{certificate.issuer}</b>
          </div>
          <div>
            <small>Issue Date</small>
            <b>{certificate.issueDate}</b>
          </div>
          <div>
            <small>Expiration Date</small>
            <b>{certificate.expirationDate}</b>
          </div>
          <div className="detail-qr">
            <div className="cert-qr-box">
              {qrUrl ? <img src={qrUrl} alt={`Verification QR for ${certificate.certificateId}`} /> : <QrCode size={38} />}
            </div>
            <small className="cert-qr-id">{certificate.certificateId}</small>
          </div>
        </div>

        {/* Signature area */}
        <div className="detail-cert-signature">
          <div className="signature-line">
            <b>Dr. Sopheak</b>
            <span>Program Director</span>
          </div>
          <div className="signature-line">
            <b>{certificate.issuer}</b>
            <span>Issuing Organization</span>
          </div>
        </div>

        {/* Credential ID bar */}
        <div className="detail-cert-id-bar">
          <Award size={13} />
          <span>Credential ID: {certificate.certificateId}</span>
        </div>

        {/* Status overlay for revoked/expired */}
        {certificate.status === 'revoked' && (
          <div className="cert-status-stamp revoked-stamp">REVOKED</div>
        )}
        {certificate.status === 'expired' && (
          <div className="cert-status-stamp expired-stamp">EXPIRED</div>
        )}
      </div>

      <button type="button" className="full-preview" onClick={() => setPreviewOpen(true)}>
        <ArrowUpRight size={15} /> Open Full Preview
      </button>
      {previewOpen && <dialog ref={dialog} className="certificate-pdf-dialog" aria-label="Full certificate preview" onCancel={() => setPreviewOpen(false)}>
        <header><h2>Certificate Preview</h2><button type="button" className="cancel-action" onClick={() => setPreviewOpen(false)}>Close</button></header>
        {previewError ? <p role="alert">{previewError}</p> : pdfUrl ? <iframe src={pdfUrl} title="Certificate PDF" /> : <p role="status">Loading preview...</p>}
      </dialog>}
    </section>
  )
}
