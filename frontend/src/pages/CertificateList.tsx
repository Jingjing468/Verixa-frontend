import { ArrowDownToLine, ChevronDown, ChevronLeft, ChevronRight, Download, Edit3, Ellipsis, Eye, FileCheck2, Mail, Plus, Search, ShieldCheck, SlidersHorizontal, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CertificateEmptyState from '../components/certificates/CertificateEmptyState'
import CertificateStatusBadge from '../components/certificates/CertificateStatusBadge'
import RevokeCertificateModal from '../components/certificates/RevokeCertificateModal'
import DashboardLayout from '../layouts/DashboardLayout'
import { mockCertificates, mockCourses } from '../data/mockCertificates'
import type { Certificate } from '../types/certificate'

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
}

function matchesIssueDate(issueDate: string, filter: string) {
  const issued = new Date(`${issueDate} 12:00:00`)
  const latestMockDate = new Date('May 23, 2026 12:00:00')
  const days = Math.round((latestMockDate.getTime() - issued.getTime()) / 86400000)
  return (
    filter === 'All Time' ||
    (filter === 'Today' && days === 0) ||
    (filter === 'This Week' && days >= 0 && days < 7) ||
    (filter === 'This Month' && issued.getMonth() === latestMockDate.getMonth() && issued.getFullYear() === latestMockDate.getFullYear())
  )
}

type ActionMenuState = { certificate: Certificate; top: number; right: number }

export default function CertificateList() {
  const [searchParams] = useSearchParams()
  const [certificates, setCertificates] = useState(mockCertificates)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(searchParams.get('status') === 'revoked' ? 'revoked' : 'all')
  const [date, setDate] = useState('All Time')
  const [course, setCourse] = useState('All Courses')
  const [sort, setSort] = useState('Newest')
  const [selected, setSelected] = useState<string[]>([])
  const [actionMenu, setActionMenu] = useState<ActionMenuState | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<Certificate | null>(null)

  const filtered = useMemo(
    () =>
      certificates
        .filter((c) => {
          const query = search.toLowerCase()
          return (
            (!query || [c.id, c.recipientName, c.recipientEmail, c.course].some((v) => v.toLowerCase().includes(query))) &&
            (status === 'all' || c.status === status) &&
            matchesIssueDate(c.issueDate, date) &&
            (course === 'All Courses' || c.course === course)
          )
        })
        .sort((a, b) =>
          sort === 'Recipient Name'
            ? a.recipientName.localeCompare(b.recipientName)
            : sort === 'Oldest'
              ? a.id.localeCompare(b.id)
              : b.id.localeCompare(a.id)
        ),
    [certificates, search, status, date, course, sort]
  )

  const clear = () => {
    setSearch('')
    setStatus('all')
    setDate('All Time')
    setCourse('All Courses')
    setSort('Newest')
  }

  const toggle = (id: string) =>
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))

  const revoke = () => {
    if (revokeTarget)
      setCertificates((current) => current.map((item) => (item.id === revokeTarget.id ? { ...item, status: 'revoked' as const } : item)))
    setRevokeTarget(null)
  }

  return (
    <DashboardLayout>
      <div className="dashboard-content certificate-list-content" onClick={() => setActionMenu(null)}>
        <header className="certificate-list-heading dashboard-enter">
          <div>
            <nav>
              Dashboard <span>/</span> Certificates
            </nav>
            <h1>Certificates</h1>
            <p>Manage, search, and review all issued digital credentials.</p>
          </div>
          <Link className="issue-action" to="/certificates/create">
            <Plus size={16} /> Issue Certificate
          </Link>
        </header>

        <section className="certificate-stats">
          {[
            ['Total Certificates', '1,248', FileCheck2, 'blue', 'All time issued'],
            ['Valid', '1,102', ShieldCheck, 'green', '88.3% of total'],
            ['Expired', '98', ChevronDown, 'orange', '7.9% of total'],
            ['Revoked', '48', FileCheck2, 'red', '3.8% of total'],
          ].map(([title, value, Icon, tone, detail], index) => {
            const Glyph = Icon as typeof FileCheck2
            return (
              <article className={`certificate-stat ${tone}`} style={{ animationDelay: `${index * 70}ms` }} key={String(title)}>
                <span>
                  <Glyph size={18} />
                </span>
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
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by Certificate ID, recipient, or course..." />
          </div>
          <div className="filter-set">
            <label>
              <span>Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="all">All</option>
                <option value="valid">Valid</option>
                <option value="expired">Expired</option>
                <option value="revoked">Revoked</option>
              </select>
            </label>
            <label>
              <span>Issue Date</span>
              <select value={date} onChange={(e) => setDate(e.target.value)}>
                <option>All Time</option>
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
              </select>
            </label>
            <label>
              <span>Course</span>
              <select value={course} onChange={(e) => setCourse(e.target.value)}>
                {mockCourses.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Sort by</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
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

        {selected.length > 0 && (
          <section className="bulk-actions">
            <b>
              {selected.length} certificate{selected.length > 1 ? 's' : ''} selected
            </b>
            <span />
            <button>
              <Download size={15} /> Download
            </button>
            <button>
              <Upload size={15} /> Export
            </button>
            <button>
              <Mail size={15} /> Send Email
            </button>
          </section>
        )}

        <section className="certificate-table-card">
          {filtered.length ? (
            <div className="table-wrap certificate-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        aria-label="Select all certificates"
                        checked={filtered.length > 0 && selected.length === filtered.length}
                        onChange={() => setSelected(selected.length === filtered.length ? [] : filtered.map((c) => c.id))}
                      />
                    </th>
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
                      <td>
                        <input type="checkbox" aria-label={`Select ${certificate.id}`} checked={selected.includes(certificate.id)} onChange={() => toggle(certificate.id)} />
                      </td>
                      <td>
                        <Link className="certificate-id" to={`/certificates/${certificate.id}`}>
                          {certificate.id}
                        </Link>
                      </td>
                      <td>
                        <Link className="recipient-cell" to={`/certificates/${certificate.id}`}>
                          <span>{initials(certificate.recipientName)}</span>
                          <div>
                            <b>{certificate.recipientName}</b>
                            <small>{certificate.recipientEmail}</small>
                          </div>
                        </Link>
                      </td>
                      <td>{certificate.course}</td>
                      <td>{certificate.issueDate}</td>
                      <td>{certificate.expirationDate}</td>
                      <td>
                        <CertificateStatusBadge status={certificate.status} />
                      </td>
                      <td>
                        <span className="blockchain-verified">
                          <ShieldCheck size={15} /> Verified
                        </span>
                      </td>
                      <td className="action-cell">
                        <button
                          className="action-trigger"
                          onClick={(event) => {
                            event.stopPropagation()
                            const bounds = event.currentTarget.getBoundingClientRect()
                            setActionMenu(
                              current =>
                                current?.certificate.id === certificate.id
                                  ? null
                                  : { certificate, top: bounds.bottom + 7, right: window.innerWidth - bounds.right }
                            )
                          }}
                          aria-label={`Actions for ${certificate.id}`}
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
            <span>Showing 1–{filtered.length} of 1,248 certificates</span>
            <div>
              <label>
                Rows{' '}
                <select>
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
              </label>
              <button disabled>
                <ChevronLeft size={15} /> Previous
              </button>
              <button className="current-page">1</button>
              <button>2</button>
              <button>3</button>
              <i>...</i>
              <button>125</button>
              <button>
                Next <ChevronRight size={15} />
              </button>
            </div>
          </footer>
        </section>
      </div>

      {actionMenu && (
        <div className="certificate-action-menu floating" style={{ top: actionMenu.top, right: actionMenu.right }} onClick={(event) => event.stopPropagation()}>
          <Link to={`/certificates/${actionMenu.certificate.id}`}>
            <Eye size={14} /> View Details
          </Link>
          <button>
            <ArrowDownToLine size={14} /> Download PDF
          </button>
          <button>
            <Mail size={14} /> Send Email
          </button>
          <Link to={`/certificates/${actionMenu.certificate.id}/edit`}>
            <Edit3 size={14} /> Edit Certificate
          </Link>
          <button
            className="revoke-menu"
            onClick={() => {
              setRevokeTarget(actionMenu.certificate)
              setActionMenu(null)
            }}
          >
            Revoke Certificate
          </button>
        </div>
      )}

      {revokeTarget && <RevokeCertificateModal certificate={revokeTarget} onClose={() => setRevokeTarget(null)} onRevoke={revoke} />}
    </DashboardLayout>
  )
}
