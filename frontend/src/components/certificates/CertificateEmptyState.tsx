import { FileSearch } from 'lucide-react'
export default function CertificateEmptyState({ onClear }: { onClear: () => void }) { return <div className="certificate-empty"><span><FileSearch size={27} /></span><h2>No certificates found</h2><p>Try changing your search or filters.</p><button className="cancel-action" onClick={onClear}>Clear Filters</button></div> }
