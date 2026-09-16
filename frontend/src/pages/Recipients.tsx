import { Download, Ellipsis, Eye, Mail, Plus, Send } from 'lucide-react'
import { useMemo, useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import RecipientStats from '../components/recipients/RecipientStats'
import RecipientFilters from '../components/recipients/RecipientFilters'
import RecipientEmptyState from '../components/recipients/RecipientEmptyState'
import RecipientDetailDrawer from '../components/recipients/RecipientDetailDrawer'
import type { Recipient, RecipientCertificate, RecipientFilter, RecipientSort } from '../types/recipient'

const mockRecipients: Recipient[] = [
  { id: 'REC-001', name: 'Lim Potkolbotey', email: 'lim@example.com', organization: 'Kirirom Institute of Technology', totalCertificates: 5, validCertificates: 4, expiredCertificates: 1, revokedCertificates: 0, lastIssued: 'May 23, 2026' },
  { id: 'REC-002', name: 'Yean Sreymom', email: 'sreymom@example.com', organization: 'Kirirom Institute of Technology', totalCertificates: 3, validCertificates: 3, expiredCertificates: 0, revokedCertificates: 0, lastIssued: 'May 22, 2026' },
  { id: 'REC-003', name: 'Dara Vimean', email: 'dara@example.com', organization: 'Kirirom Institute of Technology', totalCertificates: 2, validCertificates: 1, expiredCertificates: 1, revokedCertificates: 0, lastIssued: 'May 21, 2026' },
  { id: 'REC-004', name: 'Sokha Ngin', email: 'sokha@example.com', organization: 'Kirirom Institute of Technology', totalCertificates: 4, validCertificates: 2, expiredCertificates: 0, revokedCertificates: 2, lastIssued: 'May 19, 2026' },
  { id: 'REC-005', name: 'Vannak Keo', email: 'vannak@example.com', organization: 'Kirirom Institute of Technology', totalCertificates: 3, validCertificates: 2, expiredCertificates: 1, revokedCertificates: 0, lastIssued: 'May 18, 2026' },
  { id: 'REC-006', name: 'Sophy Chan', email: 'sophy@example.com', organization: 'Kirirom Institute of Technology', totalCertificates: 2, validCertificates: 2, expiredCertificates: 0, revokedCertificates: 0, lastIssued: 'May 16, 2026' },
  { id: 'REC-007', name: 'Bora Khem', email: 'bora@example.com', organization: 'Kirirom Institute of Technology', totalCertificates: 1, validCertificates: 0, expiredCertificates: 1, revokedCertificates: 0, lastIssued: 'May 14, 2026' },
  { id: 'REC-008', name: 'Chantrea Oum', email: 'chantrea@example.com', organization: 'Kirirom Institute of Technology', totalCertificates: 2, validCertificates: 2, expiredCertificates: 0, revokedCertificates: 0, lastIssued: 'May 12, 2026' },
]

const mockCerts: Record<string, RecipientCertificate[]> = {
  'REC-001': [
    { id: 'CERT-2026-0001248', course: 'Blockchain Development', status: 'valid', issueDate: 'May 23, 2026' },
    { id: 'CERT-2026-0001220', course: 'Smart Contract Basics', status: 'valid', issueDate: 'Apr 10, 2026' },
    { id: 'CERT-2026-0001180', course: 'Web3 Fundamentals', status: 'expired', issueDate: 'Jan 15, 2026' },
  ],
  'REC-002': [
    { id: 'CERT-2026-0001247', course: 'Smart Contract Basics', status: 'valid', issueDate: 'May 22, 2026' },
    { id: 'CERT-2026-0001200', course: 'Blockchain Development', status: 'valid', issueDate: 'Mar 5, 2026' },
  ],
  'REC-004': [
    { id: 'CERT-2026-0001245', course: 'Decentralized Applications', status: 'revoked', issueDate: 'May 19, 2026' },
    { id: 'CERT-2026-0001190', course: 'Ethereum Development', status: 'valid', issueDate: 'Feb 28, 2026' },
  ],
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2)
}

export default function Recipients() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<RecipientFilter>('all')
  const [sort, setSort] = useState<RecipientSort>('newest')
  const [selected, setSelected] = useState<Recipient | null>(null)
  const [actionMenu, setActionMenu] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return mockRecipients
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
        return a.id.localeCompare(b.id)
      })
  }, [search, filter, sort])

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

        <RecipientStats />

        <RecipientFilters
          search={search} onSearchChange={setSearch}
          filter={filter} onFilterChange={setFilter}
          sort={sort} onSortChange={setSort}
          onClear={clear}
        />

        {/* Table */}
        <section className="recipient-table-card">
          {filtered.length > 0 ? (
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
          certificates={mockCerts[selected.id] || []}
          onClose={() => setSelected(null)}
        />
      )}
    </DashboardLayout>
  )
}
