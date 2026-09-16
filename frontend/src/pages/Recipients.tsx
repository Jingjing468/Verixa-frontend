import { Ellipsis, Eye, Mail, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import RecipientStats from '../components/recipients/RecipientStats'
import RecipientFilters from '../components/recipients/RecipientFilters'
import RecipientEmptyState from '../components/recipients/RecipientEmptyState'
import RecipientDetailDrawer from '../components/recipients/RecipientDetailDrawer'
import type { Recipient, RecipientCertificate, RecipientFilter, RecipientSort } from '../types/recipient'
import { apiRequest } from '../api/client'
import type { CertificateSummary, CertificatesResponse, RecipientsResponse } from '../api/types'

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2)
}

function formatDate(value: string | null) {
  if (!value) return 'Not issued yet'

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

async function loadAllCertificates() {
  const firstPage = await apiRequest<CertificatesResponse>('/certificates?limit=100&page=1', { auth: true })
  const remainingPages = Array.from(
    { length: Math.max(firstPage.pagination.totalPages - 1, 0) },
    (_, index) => index + 2
  )

  const remainingResponses = await Promise.all(
    remainingPages.map((page) =>
      apiRequest<CertificatesResponse>(`/certificates?limit=100&page=${page}`, { auth: true })
    )
  )

  return [firstPage, ...remainingResponses].flatMap((response) => response.data)
}

export default function Recipients() {
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [certificates, setCertificates] = useState<CertificateSummary[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<RecipientFilter>('all')
  const [sort, setSort] = useState<RecipientSort>('newest')
  const [selected, setSelected] = useState<Recipient | null>(null)
  const [actionMenu, setActionMenu] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      apiRequest<RecipientsResponse>('/recipients', { auth: true }),
      loadAllCertificates(),
    ])
      .then(([recipientResponse, certificateResponse]) => {
        setCertificates(certificateResponse)
        setRecipients(recipientResponse.recipients.map((recipient) => ({
          id: recipient.id,
          name: recipient.fullName,
          email: recipient.email,
          organization: recipient.organizationId,
          totalCertificates: recipient.totalCertificates,
          validCertificates: recipient.validCertificates,
          expiredCertificates: recipient.expiredCertificates,
          revokedCertificates: recipient.revokedCertificates,
          lastIssued: formatDate(recipient.lastIssuedAt),
          createdAt: recipient.createdAt,
        })))
      })
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : 'Could not load recipients')
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return recipients
      .filter((r) => {
        const q = search.toLowerCase()
        const matchSearch = !q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
        const matchFilter =
          filter === 'all' ||
          (filter === 'valid' && r.validCertificates > 0) ||
          (filter === 'expired' && r.expiredCertificates > 0) ||
          (filter === 'revoked' && r.revokedCertificates > 0)
        return matchSearch && matchFilter
      })
      .sort((a, b) => {
        if (sort === 'name') return a.name.localeCompare(b.name)
        if (sort === 'certificates') return b.totalCertificates - a.totalCertificates
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }, [recipients, search, filter, sort])

  const recipientsThisMonth = recipients.filter((recipient) => {
    const createdAt = new Date(recipient.createdAt)
    const now = new Date()
    return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
  }).length

  const activeCertificates = recipients.reduce(
    (total, recipient) => total + recipient.validCertificates,
    0
  )

  const selectedCertificates: RecipientCertificate[] = useMemo(() => {
    if (!selected) return []

    return certificates
      .filter((certificate) =>
        certificate.recipient.id === selected.id || certificate.recipient.email === selected.email
      )
      .slice(0, 5)
      .map((certificate) => ({
        id: certificate.certificateId,
        course: certificate.courseName,
        status: certificate.status,
        issueDate: formatDate(certificate.issueDate),
      }))
  }, [certificates, selected])

  const clear = () => { setSearch(''); setFilter('all'); setSort('newest') }

  return (
    <DashboardLayout>
      <div className="dashboard-content" onClick={() => setActionMenu(null)}>
        {/* Header */}
        <header className="dashboard-welcome dashboard-enter">
          <div>
            <p>People</p>
            <h1>Recipients</h1>
            <span>View the people who have received credentials from your organization.</span>
          </div>
          <button className="issue-action">
            <Plus size={16} /> Add Recipient
          </button>
        </header>

        <RecipientStats
          totalRecipients={recipients.length}
          activeCertificates={activeCertificates}
          recipientsThisMonth={recipientsThisMonth}
        />
        {error && <span className="field-error">{error}</span>}

        <RecipientFilters
          search={search} onSearchChange={setSearch}
          filter={filter} onFilterChange={setFilter}
          sort={sort} onSortChange={setSort}
          onClear={clear}
        />

        {/* Table */}
        <section className="recipient-table-card">
          {loading ? (
            <div className="recipient-table-wrap">
              <div className="recipient-empty">
                <h3>Loading recipients...</h3>
                <p>Fetching live records from the backend.</p>
              </div>
            </div>
          ) : filtered.length > 0 ? (
            <div className="recipient-table-wrap">
              <table className="recipient-table">
                <thead>
                  <tr>
                    <th style={{ width: '25%' }}>Recipient</th>
                    <th style={{ width: '20%' }}>Email</th>
                    <th style={{ width: '8%', textAlign: 'center' }}>Total</th>
                    <th style={{ width: '8%', textAlign: 'center' }}>Valid</th>
                    <th style={{ width: '8%', textAlign: 'center' }}>Expired</th>
                    <th style={{ width: '8%', textAlign: 'center' }}>Revoked</th>
                    <th style={{ width: '14%' }}>Last Issued</th>
                    <th style={{ width: '9%' }} aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.id} style={{ animationDelay: `${i * 35}ms` }} onClick={() => setSelected(r)}>
                      <td>
                        <div className="recipient-name-cell">
                          <span className="recipient-avatar-sm">{initials(r.name)}</span>
                          <b>{r.name}</b>
                        </div>
                      </td>
                      <td className="recipient-email">{r.email}</td>
                      <td className="recipient-count">{r.totalCertificates}</td>
                      <td className="recipient-count valid">{r.validCertificates}</td>
                      <td className="recipient-count expired">{r.expiredCertificates}</td>
                      <td className="recipient-count revoked">{r.revokedCertificates}</td>
                      <td className="recipient-date">{r.lastIssued}</td>
                      <td className="action-cell" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="action-trigger"
                          onClick={() => setActionMenu(actionMenu === r.id ? null : r.id)}
                          aria-label={`Actions for ${r.name}`}
                        >
                          <Ellipsis size={16} />
                        </button>
                        {actionMenu === r.id && (
                          <div className="recipient-action-menu">
                            <button onClick={() => { setSelected(r); setActionMenu(null) }}><Eye size={14} /> View Recipient</button>
                            <button><Mail size={14} /> Send Email</button>
                            <button><Plus size={14} /> Issue Certificate</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <RecipientEmptyState onClear={clear} />
          )}
        </section>

        <footer className="dashboard-footer">
          <span>© 2026 Verixa. All rights reserved.</span>
          <span><i /> Blockchain Network: Ethereum Sepolia</span>
        </footer>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <RecipientDetailDrawer
          recipient={selected}
          certificates={selectedCertificates}
          onClose={() => setSelected(null)}
        />
      )}
    </DashboardLayout>
  )
}
