import { ArrowDownToLine, ChevronDown, ChevronLeft, ChevronRight, Edit3, Ellipsis, Eye, FileCheck2, Mail, Plus, Search, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CertificateEmptyState from '../components/certificates/CertificateEmptyState'
import CertificateStatusBadge from '../components/certificates/CertificateStatusBadge'
import RevokeCertificateModal from '../components/certificates/RevokeCertificateModal'
import DashboardLayout from '../layouts/DashboardLayout'
import type { Certificate } from '../types/certificate'
import { apiRequest, apiUrl, getAuthToken } from '../api/client'
import type { CertificatesResponse } from '../api/types'

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
}

type ActionMenuState = { certificate: Certificate; top: number; right: number }

export default function CertificateList() {
  const [searchParams] = useSearchParams()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(searchParams.get('status') === 'revoked' ? 'revoked' : 'all')
  const [course, setCourse] = useState('All Courses')
  const [sort, setSort] = useState('Newest')
  const [selected, setSelected] = useState<string[]>([])
  const [actionMenu, setActionMenu] = useState<ActionMenuState | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<Certificate | null>(null)
  const [error, setError] = useState('')

  const loadCertificates = () => {
    const query = new URLSearchParams({ limit: '100' })
    if (status !== 'all') query.set('status', status)
    if (search.trim()) query.set('search', search.trim())

    apiRequest<CertificatesResponse>(`/certificates?${query.toString()}`, { auth: true })
      .then((response) => {
        setCertificates(response.data.map((certificate) => ({
          id: certificate.id,
          certificateId: certificate.certificateId,
          recipientName: certificate.recipient.fullName,
          recipientEmail: certificate.recipient.email,
          course: certificate.courseName,
          issueDate: certificate.issueDate,
          expirationDate: certificate.expiryDate ?? 'No expiry',
          status: certificate.status,
          blockchainVerified: true,
        })))
      })
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : 'Could not load certificates')
      })
  }

  useEffect(() => {
    loadCertificates()
  }, [search, status])

  const filtered = useMemo(
    () =>
      certificates
        .filter((certificate) => course === 'All Courses' || certificate.course === course)
        .sort((a, b) =>
          sort === 'Recipient Name'
            ? a.recipientName.localeCompare(b.recipientName)
            : sort === 'Oldest'
              ? a.id.localeCompare(b.id)
              : b.id.localeCompare(a.id)
        ),
    [certificates, course, sort]
  )

  const clear = () => {
    setSearch('')
    setStatus('all')
    setCourse('All Courses')
    setSort('Newest')
  }

  const toggle = (id: string) =>
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))

  const revoke = () => {
    if (revokeTarget) {
      apiRequest(`/certificates/${revokeTarget.id}/revoke`, {
        method: 'POST',
        auth: true,
        body: { reason: 'Revoked from admin dashboard' },
      })
        .then(loadCertificates)
        .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Could not revoke certificate'))
    }
    setRevokeTarget(null)
  }

  const sendCertificateEmail = (certificate: Certificate) => {
    apiRequest(`/certificates/${certificate.id}/send`, { method: 'POST', auth: true })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Could not send certificate email'))
  }

  const downloadPdf = (certificate: Certificate) => {
    const token = getAuthToken()
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
    <DashboardLayout>
      <div className="dashboard-content certificate-list-content" onClick={() => setActionMenu(null)}>
        <header className="certificate-list-heading dashboard-enter">
          <div>
            <nav>Dashboard <span>/</span> Certificates</nav>
            <h1>Certificates</h1>
            <p>Manage, search, and review all issued digital credentials.</p>
          </div>
          <Link className="issue-action" to="/certificates/create">
            <Plus size={16} /> Issue Certificate
          </Link>
        </header>

        <section className="certificate-stats">
          {[
            ['Total Certificates', String(certificates.length), FileCheck2, 'blue', 'All issued credentials'],
            ['Valid', String(certificates.filter((item) => item.status === 'valid').length), ShieldCheck, 'green', 'Current certificates'],
            ['Expired', String(certificates.filter((item) => item.status === 'expired').length), ChevronDown, 'orange', 'Past expiry date'],
            ['Revoked', String(certificates.filter((item) => item.status === 'revoked').length), FileCheck2, 'red', 'Revocation history kept'],
          ].map(([title, value, Icon, tone, detail], index) => {
            const Glyph = Icon as typeof FileCheck2
            return (
              <article className={`certificate-stat ${tone}`} style={{ animationDelay: `${index * 70}ms` }} key={String(title)}>
                <span><Glyph size={18} /></span>
                <div>
                  <small>{String(title)}</small>
                  <b>{String(value)}</b>
                  <span className={`stat-detail ${tone}`}>{String(detail)}</span>
                </div>
              </article>
            )
          })}
        </section>

        <section className="certificate-toolbar">
          <div className="certificate-search">
            <Search size={17} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by Certificate ID, recipient, or course..." />
          </div>
          <div className="filter-set">
            <label>
              <span>Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="all">All</option>
                <option value="valid">Valid</option>
                <option value="expired">Expired</option>
                <option value="revoked">Revoked</option>
              </select>
            </label>
            <label>
              <span>Course</span>
              <select value={course} onChange={(event) => setCourse(event.target.value)}>
                {['All Courses', ...Array.from(new Set(certificates.map((item) => item.course)))].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              <span>Sort by</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option>Newest</option>
                <option>Oldest</option>
                <option>Recipient Name</option>
              </select>
            </label>
          </div>
          <button className="clear-filters" onClick={clear}>
            <SlidersHorizontal size={15} /> Clear Filters
          </button>
        </section>
        {error && <span className="field-error">{error}</span>}

        <section className="certificate-table-card">
          {filtered.length ? (
            <div className="table-wrap certificate-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th><input type="checkbox" aria-label="Select all certificates" checked={filtered.length > 0 && selected.length === filtered.length} onChange={() => setSelected(selected.length === filtered.length ? [] : filtered.map((certificate) => certificate.id))} /></th>
                    <th>Certificate ID</th>
                    <th>Recipient</th>
                    <th>Course / Program</th>
                    <th>Issue Date</th>
                    <th>Expiration Date</th>
                    <th>Status</th>
                    <th>Blockchain</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((certificate, index) => (
                    <tr className={selected.includes(certificate.id) ? 'selected' : ''} style={{ animationDelay: `${index * 35}ms` }} key={certificate.id}>
                      <td><input type="checkbox" aria-label={`Select ${certificate.certificateId}`} checked={selected.includes(certificate.id)} onChange={() => toggle(certificate.id)} /></td>
                      <td><Link className="certificate-id" to={`/certificates/${certificate.id}`}>{certificate.certificateId}</Link></td>
                      <td>
                        <Link className="recipient-cell" to={`/certificates/${certificate.id}`}>
                          <span>{initials(certificate.recipientName)}</span>
                          <div><b>{certificate.recipientName}</b><small>{certificate.recipientEmail}</small></div>
                        </Link>
                      </td>
                      <td>{certificate.course}</td>
                      <td>{certificate.issueDate}</td>
                      <td>{certificate.expirationDate}</td>
                      <td><CertificateStatusBadge status={certificate.status} /></td>
                      <td><span className="blockchain-verified"><ShieldCheck size={15} /> Verified</span></td>
                      <td className="action-cell">
                        <button
                          className="action-trigger"
                          onClick={(event) => {
                            event.stopPropagation()
                            const bounds = event.currentTarget.getBoundingClientRect()
                            setActionMenu((current) => current?.certificate.id === certificate.id ? null : { certificate, top: bounds.bottom + 7, right: window.innerWidth - bounds.right })
                          }}
                          aria-label={`Actions for ${certificate.certificateId}`}
                        >
                          <Ellipsis size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <CertificateEmptyState onClear={clear} />
          )}
          <footer className="certificate-pagination">
            <span>Showing {filtered.length ? 1 : 0}-{filtered.length} of {certificates.length} certificates</span>
            <div>
              <button disabled><ChevronLeft size={15} /> Previous</button>
              <button className="current-page">1</button>
              <button disabled>Next <ChevronRight size={15} /></button>
            </div>
          </footer>
        </section>
      </div>

      {actionMenu && (
        <div className="certificate-action-menu floating" style={{ top: actionMenu.top, right: actionMenu.right }} onClick={(event) => event.stopPropagation()}>
          <Link to={`/certificates/${actionMenu.certificate.id}`}><Eye size={14} /> View Details</Link>
          <button onClick={() => downloadPdf(actionMenu.certificate)}><ArrowDownToLine size={14} /> Download PDF</button>
          <button onClick={() => sendCertificateEmail(actionMenu.certificate)}><Mail size={14} /> Send Email</button>
          <Link to={`/certificates/${actionMenu.certificate.id}/edit`}><Edit3 size={14} /> Edit Certificate</Link>
          <button className="revoke-menu" onClick={() => { setRevokeTarget(actionMenu.certificate); setActionMenu(null) }}>Revoke Certificate</button>
        </div>
      )}

      {revokeTarget && <RevokeCertificateModal certificate={revokeTarget} onClose={() => setRevokeTarget(null)} onRevoke={revoke} />}
    </DashboardLayout>
  )
}
