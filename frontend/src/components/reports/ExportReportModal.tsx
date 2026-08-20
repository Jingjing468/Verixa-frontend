import { Download, FileText, X } from 'lucide-react'
import { useState } from 'react'

interface Props {
  onClose: () => void
}

export default function ExportReportModal({ onClose }: Props) {
  const [format, setFormat] = useState('pdf')
  const [exported, setExported] = useState(false)

  const handleExport = () => {
    setExported(true)
    setTimeout(() => onClose(), 1800)
  }

  return (
    <div className="success-backdrop" onClick={onClose}>
      <div className="export-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={17} />
        </button>
        {!exported ? (
          <>
            <div className="export-modal-icon">
              <Download size={24} />
            </div>
            <h2>Export Report</h2>
            <p>Generate a report for May 1, 2026 – May 31, 2026.</p>

            <div className="export-options">
              <label className={format === 'pdf' ? 'selected' : ''}>
                <input type="radio" name="format" value="pdf" checked={format === 'pdf'} onChange={() => setFormat('pdf')} />
                <FileText size={18} />
                <div>
                  <b>PDF Report</b>
                  <small>Visual report with charts</small>
                </div>
              </label>
              <label className={format === 'csv' ? 'selected' : ''}>
                <input type="radio" name="format" value="csv" checked={format === 'csv'} onChange={() => setFormat('csv')} />
                <FileText size={18} />
                <div>
                  <b>CSV Data</b>
                  <small>Raw data for spreadsheets</small>
                </div>
              </label>
            </div>

            <div className="export-details">
              <div><span>Period</span><b>May 1 – May 31, 2026</b></div>
              <div><span>Certificates</span><b>1,248 issued</b></div>
              <div><span>Verifications</span><b>5,362 total</b></div>
            </div>

            <button className="issue-action" style={{ width: '100%' }} onClick={handleExport}>
              <Download size={15} /> Generate Export
            </button>
          </>
        ) : (
          <div className="export-success">
            <div className="export-success-icon">✓</div>
            <h2>Report Ready</h2>
            <p>Your export has been prepared successfully.</p>
          </div>
        )}
      </div>
    </div>
  )
}
