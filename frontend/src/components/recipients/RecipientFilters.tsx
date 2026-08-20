import { Search, SlidersHorizontal } from 'lucide-react'
import type { RecipientFilter, RecipientSort } from '../../types/recipient'

interface Props {
  search: string
  onSearchChange: (value: string) => void
  filter: RecipientFilter
  onFilterChange: (value: RecipientFilter) => void
  sort: RecipientSort
  onSortChange: (value: RecipientSort) => void
  onClear: () => void
}

export default function RecipientFilters({ search, onSearchChange, filter, onFilterChange, sort, onSortChange, onClear }: Props) {
  return (
    <section className="recipient-filters">
      <div className="recipient-search">
        <Search size={17} />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or email..."
        />
      </div>
      <div className="recipient-filter-set">
        <label>
          <span>Status</span>
          <select value={filter} onChange={(e) => onFilterChange(e.target.value as RecipientFilter)}>
            <option value="all">All Recipients</option>
            <option value="valid">Has Valid Certificate</option>
            <option value="expired">Has Expired Certificate</option>
            <option value="revoked">Has Revoked Certificate</option>
          </select>
        </label>
        <label>
          <span>Sort</span>
          <select value={sort} onChange={(e) => onSortChange(e.target.value as RecipientSort)}>
            <option value="newest">Newest</option>
            <option value="name">Name A–Z</option>
            <option value="certificates">Most Certificates</option>
          </select>
        </label>
      </div>
      <button className="recipient-clear" onClick={onClear}>
        <SlidersHorizontal size={15} /> Clear Filters
      </button>
    </section>
  )
}
