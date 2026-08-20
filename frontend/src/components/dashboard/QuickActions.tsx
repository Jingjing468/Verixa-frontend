import { BarChart3, FilePlus2, SearchCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

function QuickActions() {
  const actions: Array<[LucideIcon, string, string, string]> = [[FilePlus2, 'Issue Certificate', 'Create a new credential', 'blue'], [SearchCheck, 'Verify Certificate', 'Confirm a credential', 'purple'], [BarChart3, 'View Reports', 'Explore your insights', 'orange']]
  return <section className="quick-actions dashboard-enter"><div className="section-card-title"><div><h2>Quick Actions</h2><p>Get the most important things done.</p></div></div><div>{actions.map(([Icon, title, text, tone]) => <a href="#coming-soon" key={title}><span className={tone}><Icon size={21} /></span><strong>{title}</strong><small>{text}</small></a>)}</div></section>
}
export default QuickActions
