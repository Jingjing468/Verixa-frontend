import { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import DashboardHeader from '../components/dashboard/DashboardHeader'

interface Props {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="dashboard-page">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="dashboard-main">
        <DashboardHeader onMenu={() => setMenuOpen(true)} />
        {children}
      </main>
    </div>
  )
}
