import { ArrowUpRight, Download, Ellipsis, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
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
  return (
    <section className="recent-certificates dashboard-card dashboard-enter">
      <div className="card-heading">
        <div>
          <h2>Recent Certificates</h2>
          <p>The latest credentials issued by your organization.</p>
        </div>
        <Link to="/certificates">View all certificates <ArrowUpRight size={16} /></Link>
      </div>
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
                      <button title="Download certificate"><Download size={16} /></button>
                      <button title="More actions"><Ellipsis size={17} /></button>
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
    </section>
  )
}

export default RecentCertificates
