import { CalendarDays, Download } from 'lucide-react'
import { useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import ReportStats from '../components/reports/ReportStats'
import IssuanceTrendChart from '../components/reports/IssuanceTrendChart'
import StatusBreakdownChart from '../components/reports/StatusBreakdownChart'
import VerificationActivityChart from '../components/reports/VerificationActivityChart'
import TopPrograms from '../components/reports/TopPrograms'
import RecentReportActivity from '../components/reports/RecentReportActivity'
import ExportReportModal from '../components/reports/ExportReportModal'

export default function Reports() {
  const [exportOpen, setExportOpen] = useState(false)

  return (
    <DashboardLayout>
      <div className="dashboard-content">
        {/* Header */}
        <header className="dashboard-welcome dashboard-enter">
          <div>
            <p>Analytics</p>
            <h1>Reports</h1>
            <span>Track certificate issuance, verification, and status trends.</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="date-button">
              <CalendarDays size={16} /> May 1, 2026 – May 31, 2026
            </button>
            <button className="issue-action" onClick={() => setExportOpen(true)}>
              <Download size={16} /> Export Report
            </button>
          </div>
        </header>

        <ReportStats />

        {/* Charts row 1 */}
        <div className="report-charts-grid">
          <IssuanceTrendChart />
          <StatusBreakdownChart />
        </div>

        {/* Charts row 2 */}
        <div className="report-charts-grid">
          <VerificationActivityChart />
          <TopPrograms />
        </div>

        {/* Activity */}
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
