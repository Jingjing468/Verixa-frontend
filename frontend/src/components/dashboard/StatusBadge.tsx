interface StatusBadgeProps { status: 'Valid' | 'Expired' | 'Revoked' }

function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
}

export default StatusBadge
