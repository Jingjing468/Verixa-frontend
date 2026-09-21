import type { NotificationFilter } from '../../types/notification'

interface Props {
  active: NotificationFilter
  onChange: (filter: NotificationFilter) => void
}

const tabs: Array<{ id: NotificationFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'certificate', label: 'Certificates' },
  { id: 'email', label: 'Email' },
  { id: 'security', label: 'Security' },
  { id: 'system', label: 'System' },
]

export default function NotificationFilters({ active, onChange }: Props) {
  return (
    <div className="notif-filter-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={active === tab.id ? 'active' : ''}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
