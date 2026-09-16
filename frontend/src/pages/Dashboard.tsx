import { CalendarDays, FileCheck2, ShieldAlert, ShieldCheck, Timer } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import IssuedChart from '../components/dashboard/IssuedChart'
import QuickActions from '../components/dashboard/QuickActions'
import RecentCertificates from '../components/dashboard/RecentCertificates'
import StatCard from '../components/dashboard/StatCard'
import StatusChart from '../components/dashboard/StatusChart'

function Dashboard() {
  return (
    <DashboardLayout>
      <div className="dashboard-content">
        <section className="dashboard-welcome dashboard-enter">
          <div>
            <p>Organization overview</p>
            <h1>
              Welcome back, Admin! <span>👋</span>
            </h1>
            <span>Here's what's happening with your certificates today.</span>
          </div>
          <button className="date-button">
            <CalendarDays size={18} />May 17, 2026 – May 23, 2026
          </button>
        </section>
        <section className="dashboard-stats">
          <StatCard icon={FileCheck2} label="Total Certificates" value={1248} detail="+12.5% from last week" tone="blue" delay={80} />
          <StatCard icon={ShieldCheck} label="Valid Certificates" value={1102} detail="88.3% of total" tone="green" delay={150} />
          <StatCard icon={Timer} label="Expired Certificates" value={98} detail="7.9% of total" tone="orange" delay={220} />
          <StatCard icon={ShieldAlert} label="Revoked Certificates" value={48} detail="3.8% of total" tone="red" delay={290} />
        </section>
        <section className="dashboard-charts">
          <StatusChart />
          <IssuedChart />
        </section>
        <QuickActions />
        <RecentCertificates />
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
