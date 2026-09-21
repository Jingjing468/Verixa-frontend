import { UsersRound } from 'lucide-react'

interface Props {
  onClear: () => void
}

export default function RecipientEmptyState({ onClear }: Props) {
  return (
    <div className="recipient-empty">
      <UsersRound size={40} />
      <h3>No recipients found</h3>
      <p>Try changing your search or filters.</p>
      <button className="issue-action" onClick={onClear}>Clear Filters</button>
    </div>
  )
}
