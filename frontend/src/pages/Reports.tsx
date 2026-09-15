import { CalendarDays, Download, FileCheck2, ShieldAlert, ShieldCheck, Timer } from 'lucide-react'
import { useEffect, useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import ReportStats from '../components/reports/ReportStats'
import IssuanceTrendChart from '../components/reports/IssuanceTrendChart'
import StatusBreakdownChart from '../components/reports/StatusBreakdownChart'
import VerificationActivityChart from '../components/reports/VerificationActivityChart'
import TopPrograms from '../components/reports/TopPrograms'
import RecentReportActivity from '../components/reports/RecentReportActivity'
import ExportReportModal from '../components/reports/ExportReportModal'
import { apiRequest } from '../api/client'
import type { CertificateReportResponse } from '../api/types'

export default function Reports() {
  const [exportOpen, setExportOpen] = useState(false)
  const [report, setReport] = useState<CertificateReportResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest<CertificateReportResponse>('/reports/certificates', { auth: true })
      .then(setReport)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Could not load report'))
  }, [])

  const summary = report?.summary

  return (
    <DashboardLayout>
      <div className="dashboard-content">
        <header className="dashboard-welcome dashboard-enter">
          <div>
            <p>Analytics</p>
            <h1>Reports</h1>
            <span>Track certificate issuance, verification, and status trends.</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="date-button">
              <CalendarDays size={16} /> Live backend report
            </button>
            <button className="issue-action" onClick={() => setExportOpen(true)}>
              <Download size={16} /> Export Report
            </button>
          </div>
        </header>

        {error && <span className="field-error">{error}</span>}

        <section className="dashboard-stats">
          <ReportCard icon={FileCheck2} label="Total Issued" value={summary?.totalIssued ?? 0} tone="blue" />
          <ReportCard icon={ShieldCheck} label="Valid" value={summary?.valid ?? 0} tone="green" />
          <ReportCard icon={Timer} label="Expired" value={summary?.expired ?? 0} tone="orange" />
          <ReportCard icon={ShieldAlert} label="Revoked" value={summary?.revoked ?? 0} tone="red" />
        </section>

        <ReportStats />

        <div className="report-charts-grid">
          <IssuanceTrendChart />
          <StatusBreakdownChart />
        </div>

        <div className="report-charts-grid">
          <VerificationActivityChart />
          <TopPrograms />
        </div>

        <RecentReportActivity />

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
        <span className={`stat-detail ${tone}`}>Loaded from backend</span>
      </div>
    </article>
  )
}
