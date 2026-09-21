import { Download, FileCheck2, ShieldAlert, ShieldCheck, Timer } from 'lucide-react'
import { useEffect, useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import IssuanceTrendChart from '../components/reports/IssuanceTrendChart'
import StatusBreakdownChart from '../components/reports/StatusBreakdownChart'
import TopPrograms from '../components/reports/TopPrograms'
import RecentReportActivity from '../components/reports/RecentReportActivity'
import ExportReportModal from '../components/reports/ExportReportModal'
import { apiRequest } from '../api/client'
import type { CertificateReportResponse, CertificateSummary, CertificatesResponse } from '../api/types'

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

function formatActivityTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function getTopPrograms(certificates: CertificateSummary[]) {
  const counts = certificates.reduce<Record<string, number>>((current, certificate) => {
    current[certificate.courseName] = (current[certificate.courseName] ?? 0) + 1
    return current
  }, {})

  return Object.entries(counts)
    .map(([name, count]) => ({ name, certificates: count }))
    .sort((a, b) => b.certificates - a.certificates)
    .slice(0, 5)
}

export default function Reports() {
  const [exportOpen, setExportOpen] = useState(false)
  const [report, setReport] = useState<CertificateReportResponse | null>(null)
  const [certificates, setCertificates] = useState<CertificateSummary[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      apiRequest<CertificateReportResponse>('/reports/certificates', { auth: true }),
      loadAllCertificates(),
    ])
      .then(([reportResponse, certificateResponse]) => {
        setReport(reportResponse)
        setCertificates(certificateResponse)
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Could not load report'))
  }, [])

  const summary = report?.summary
  const totalIssued = summary?.totalIssued ?? 0
  const valid = summary?.valid ?? 0
  const expired = summary?.expired ?? 0
  const revoked = summary?.revoked ?? 0
  const topPrograms = getTopPrograms(certificates)
  const recentActivities = certificates.slice(0, 8).map((certificate) => ({
    id: certificate.id,
    text: certificate.status === 'revoked'
      ? `Certificate ${certificate.certificateId} revoked`
      : `Certificate ${certificate.certificateId} issued to ${certificate.recipient.fullName}`,
    time: formatActivityTime(certificate.createdAt),
    type: certificate.status === 'revoked' ? 'revoke' as const : 'issue' as const,
  }))

  return (
    <DashboardLayout>
      <div className="dashboard-content reports-content">
        <header className="dashboard-welcome dashboard-enter">
          <div>
            <p>Analytics</p>
            <h1>Reports</h1>
            <span>Track certificate issuance, verification, and status trends.</span>
          </div>
          <div className="report-heading-actions">
            <span className="report-live-badge"><i /> Live overview</span>
            <button className="issue-action" onClick={() => setExportOpen(true)}>
              <Download size={16} /> Export Report
            </button>
          </div>
        </header>

        {error && <span className="field-error">{error}</span>}

        <section className="dashboard-stats">
          <ReportCard icon={FileCheck2} label="Total Issued" value={totalIssued} tone="blue" />
          <ReportCard icon={ShieldCheck} label="Valid" value={valid} tone="green" />
          <ReportCard icon={Timer} label="Expired" value={expired} tone="orange" />
          <ReportCard icon={ShieldAlert} label="Revoked" value={revoked} tone="red" />
        </section>

        <div className="report-charts-grid">
          <IssuanceTrendChart data={report?.issuanceOverTime ?? []} />
          <StatusBreakdownChart total={totalIssued} valid={valid} expired={expired} revoked={revoked} />
        </div>

        <div className="report-charts-grid">
          <TopPrograms programs={topPrograms} />
          <RecentReportActivity activities={recentActivities} />
        </div>

        <footer className="dashboard-footer">
          <span>© 2026 Verixa. All rights reserved.</span>
          <span><i /> Blockchain Network: Ethereum Sepolia</span>
        </footer>
      </div>

      {exportOpen && <ExportReportModal onClose={() => setExportOpen(false)} />}
    </DashboardLayout>
  )
}

function ReportCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof FileCheck2
  label: string
  value: number
  tone: 'blue' | 'green' | 'orange' | 'red'
}) {
  return (
    <article className={`certificate-stat ${tone}`}>
      <span><Icon size={18} /></span>
      <div>
        <small>{label}</small>
        <b>{value}</b>
        <span className={`stat-detail ${tone}`}>{tone === 'blue' ? 'All issued credentials' : tone === 'green' ? 'Ready for verification' : tone === 'orange' ? 'Past expiration date' : 'Revocation history retained'}</span>
      </div>
    </article>
  )
}
