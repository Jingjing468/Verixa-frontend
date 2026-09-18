import { ArrowUpRight, BarChart3, FilePlus2, SearchCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

function QuickActions() {
  const actions = [
    { icon: FilePlus2, title: 'Issue Certificate', text: 'Create a new credential', tone: 'blue', to: '/certificates/create' },
    { icon: SearchCheck, title: 'Verify Certificate', text: 'Confirm a credential', tone: 'purple', to: '/verify' },
    { icon: BarChart3, title: 'View Reports', text: 'Explore your insights', tone: 'orange', to: '/reports' },
  ]
  return (
    <section className="dashboard-quick-actions dashboard-enter">
      <header><h2>Quick Actions</h2><p>Everything you need to manage your credentials.</p></header>
      <div className="dashboard-quick-actions-grid">
        {actions.map(({ icon: Icon, title, text, tone, to }) => (
          <Link to={to} key={title}>
            <span className={`quick-action-icon ${tone}`}><Icon size={21} /></span>
            <div><strong>{title}</strong><small>{text}</small></div>
            <ArrowUpRight className="quick-action-arrow" size={16} />
          </Link>
        ))}
      </div>
    </section>
  )
}
export default QuickActions
