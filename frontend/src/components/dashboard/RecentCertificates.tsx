import { ArrowDownToLine, ArrowUpRight, Edit3, Ellipsis, Eye } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiUrl, getAuthToken } from '../../api/client'
import StatusBadge from './StatusBadge'

type CertificateStatus = 'valid' | 'expired' | 'revoked'

interface RecentCertificate {
  id: string
  certificateId: string
  recipientName: string
  recipientEmail?: string
  courseName: string
  status: CertificateStatus
  createdAt: string
}

interface Props {
  certificates: RecentCertificate[]
}

type ActionMenuState = { certificate: RecentCertificate; top: number; right: number }

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function statusLabel(status: CertificateStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1) as 'Valid' | 'Expired' | 'Revoked'
}

function RecentCertificates({ certificates }: Props) {
  const [actionMenu, setActionMenu] = useState<ActionMenuState | null>(null)
  const [error, setError] = useState('')

  const downloadPdf = (certificate: RecentCertificate) => {
    const token = getAuthToken()
    setError('')
    fetch(apiUrl(`/certificates/${certificate.id}/pdf`), {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((response) => {
        if (!response.ok) throw new Error('Could not download certificate PDF')
        return response.blob()
      })
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = objectUrl
        link.download = `${certificate.certificateId}.pdf`
        link.click()
        URL.revokeObjectURL(objectUrl)
      })
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : 'Could not download certificate PDF')
      })
  }

  return (
    <section className="recent-certificates dashboard-card dashboard-enter" onClick={() => setActionMenu(null)}>
      <div className="card-heading">
        <div>
          <h2>Recent Certificates</h2>
          <p>The latest credentials issued by your organization.</p>
        </div>
        <Link to="/certificates">View all certificates <ArrowUpRight size={16} /></Link>
      </div>
      {error && <span className="recent-certificates-error field-error">{error}</span>}
      {certificates.length > 0 ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Certificate ID</th>
                <th>Recipient</th>
                <th>Course / Program</th>
                <th>Issue Date</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {certificates.map((certificate) => (
                <tr key={certificate.id}>
                  <td><code>{certificate.certificateId}</code></td>
                  <td>
                    <b>{certificate.recipientName}</b>
                    <small>{certificate.recipientEmail ?? 'No email available'}</small>
                  </td>
                  <td>{certificate.courseName}</td>
                  <td>{formatDate(certificate.createdAt)}</td>
                  <td><StatusBadge status={statusLabel(certificate.status)} /></td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/certificates/${certificate.id}`} title="View certificate"><Eye size={16} /></Link>
                      <button type="button" title="Download certificate" onClick={(event) => { event.stopPropagation(); downloadPdf(certificate) }}><ArrowDownToLine size={16} /></button>
                      <button
                        type="button"
                        title="More actions"
                        aria-label={`More actions for ${certificate.certificateId}`}
                        aria-expanded={actionMenu?.certificate.id === certificate.id}
                        onClick={(event) => {
                          event.stopPropagation()
                          const bounds = event.currentTarget.getBoundingClientRect()
                          setActionMenu((current) => current?.certificate.id === certificate.id ? null : { certificate, top: bounds.bottom + 7, right: window.innerWidth - bounds.right })
                        }}
                      >
                        <Ellipsis size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="dashboard-empty-state dashboard-empty-table">
          <b>No certificates yet</b>
          <span>Issued certificates will appear here after you create them.</span>
        </div>
      )}
      {actionMenu && (
        <div className="certificate-action-menu floating" style={{ top: actionMenu.top, right: actionMenu.right }} onClick={(event) => event.stopPropagation()}>
          <Link to={`/certificates/${actionMenu.certificate.id}`}><Eye size={14} /> View Details</Link>
          <button type="button" onClick={() => { downloadPdf(actionMenu.certificate); setActionMenu(null) }}><ArrowDownToLine size={14} /> Download PDF</button>
          <Link to={`/certificates/${actionMenu.certificate.id}/edit`}><Edit3 size={14} /> Edit Certificate</Link>
        </div>
      )}
    </section>
  )
}

export default RecentCertificates
