import { useEffect, useState } from 'react'
import { CalendarDays, FileCheck2, ShieldAlert, ShieldCheck, Timer } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import IssuedChart from '../components/dashboard/IssuedChart'
import QuickActions from '../components/dashboard/QuickActions'
import RecentCertificates from '../components/dashboard/RecentCertificates'
import StatCard from '../components/dashboard/StatCard'
import StatusChart from '../components/dashboard/StatusChart'
import { apiRequest } from '../api/client'
import type { DashboardResponse } from '../api/types'

function buildIssuedChartData(trend: DashboardResponse['issuanceTrend'] = []) {
  const formatter = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' })
  const points = trend.length > 0 ? trend : Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    return {
      date: date.toISOString().slice(0, 10),
      count: 0,
    }
  })

  return points.map((point) => ({
    day: formatter.format(new Date(`${point.date}T00:00:00`)),
    value: point.count,
  }))
}

function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest<DashboardResponse>('/dashboard', { auth: true })
      .then(setDashboard)
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : 'Could not load dashboard')
      })
  }, [])

  const stats = dashboard?.stats
  const recentCertificates = dashboard?.recentCertificateActivity ?? []
  const issuedChartData = buildIssuedChartData(dashboard?.issuanceTrend)
  const firstName = dashboard?.user.fullName.split(' ')[0] ?? 'there'

  return (
    <DashboardLayout>
      <div className="dashboard-content">
        <section className="dashboard-welcome dashboard-enter">
          <div>
            <p>Organization overview</p>
            <h1>Welcome back, {firstName}!</h1>
            <span>Here's what's happening with your certificates today.</span>
          </div>
          <button className="date-button">
            <CalendarDays size={18} /> Live backend data
          </button>
        </section>
        {error && <span className="field-error">{error}</span>}
        <section className="dashboard-stats">
          <StatCard icon={FileCheck2} label="Total Certificates" value={stats?.totalCertificates ?? 0} detail={`${stats?.certificatesIssuedRecently ?? 0} issued recently`} tone="blue" delay={80} />
          <StatCard icon={ShieldCheck} label="Valid Certificates" value={stats?.validCertificates ?? 0} detail="Currently active" tone="green" delay={150} />
          <StatCard icon={Timer} label="Expired Certificates" value={stats?.expiredCertificates ?? 0} detail="Past expiry date" tone="orange" delay={220} />
          <StatCard icon={ShieldAlert} label="Revoked Certificates" value={stats?.revokedCertificates ?? 0} detail={`${stats?.totalRecipients ?? 0} recipients`} tone="red" delay={290} />
        </section>
        <section className="dashboard-charts">
          <StatusChart
            total={stats?.totalCertificates ?? 0}
            valid={stats?.validCertificates ?? 0}
            expired={stats?.expiredCertificates ?? 0}
            revoked={stats?.revokedCertificates ?? 0}
          />
          <IssuedChart data={issuedChartData} />
        </section>
        <QuickActions />
        <RecentCertificates certificates={recentCertificates} />
        <footer className="dashboard-footer">
          <span>© 2026 Verixa. All rights reserved.</span>
          <span>
            <i /> Blockchain Network: Ethereum Sepolia
          </span>
        </footer>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
