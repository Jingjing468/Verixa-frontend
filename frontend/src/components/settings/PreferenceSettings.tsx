import { Globe, Clock, Calendar, LayoutGrid } from 'lucide-react'
import type { Preferences as PreferencesType } from '../../types/settings'

interface Props {
  preferences: PreferencesType
  onChange: (p: PreferencesType) => void
}

function PreferenceSettings({ preferences, onChange }: Props) {
  const update = (field: keyof PreferencesType, value: string | number) => {
    onChange({ ...preferences, [field]: value })
  }

  return (
    <div className="settings-section-enter">
      <div className="settings-section-header">
        <h2>Preferences</h2>
        <p>Customize your workspace experience.</p>
      </div>

      <div className="settings-card">
        <div className="settings-form-grid">
          <div className="settings-field">
            <label>
              <Globe size={14} />
              Language
            </label>
            <select
              value={preferences.language}
              onChange={(e) => update('language', e.target.value)}
            >
              <option value="English">English</option>
              <option value="French">French</option>
              <option value="Khmer">Khmer</option>
            </select>
          </div>

          <div className="settings-field">
            <label>
              <Clock size={14} />
              Timezone
            </label>
            <select
              value={preferences.timezone}
              onChange={(e) => update('timezone', e.target.value)}
            >
              <option value="Asia/Phnom_Penh">Asia/Phnom_Penh (GMT+7)</option>
              <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
              <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
              <option value="UTC">UTC (GMT+0)</option>
            </select>
          </div>

          <div className="settings-field">
            <label>
              <Calendar size={14} />
              Date Format
            </label>
            <select
              value={preferences.dateFormat}
              onChange={(e) => update('dateFormat', e.target.value)}
            >
              <option value="DD MMM YYYY">DD MMM YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            </select>
          </div>

          <div className="settings-field">
            <label>
              <LayoutGrid size={14} />
              Items per Page
            </label>
            <div className="settings-radio-group">
              {[10, 25, 50].map((n) => (
                <button
                  key={n}
                  className={`settings-radio ${preferences.itemsPerPage === n ? 'active' : ''}`}
                  onClick={() => update('itemsPerPage', n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>


        </div>
      </div>
    </div>
  )
}

export default PreferenceSettings
