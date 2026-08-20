import { AlertCircle, X } from 'lucide-react'

interface Props {
  visible: boolean
  onSave: () => void
  onDiscard: () => void
}

function UnsavedChangesBar({ visible, onSave, onDiscard }: Props) {
  if (!visible) return null

  return (
    <div className="settings-unsaved-bar">
      <div className="settings-unsaved-content">
        <AlertCircle size={16} />
        <span>Changes not saved</span>
      </div>
      <div className="settings-unsaved-actions">
        <button className="settings-btn ghost" onClick={onDiscard}>
          <X size={14} />
          Discard
        </button>
        <button className="settings-btn primary" onClick={onSave}>
          Save Changes
        </button>
      </div>
    </div>
  )
}

export default UnsavedChangesBar
