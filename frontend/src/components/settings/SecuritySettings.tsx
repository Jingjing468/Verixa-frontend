import { Eye, EyeOff, Monitor, Lock, ShieldAlert, ShieldCheck, AlertTriangle, LogOut, MapPin, Clock } from 'lucide-react'
import { useState } from 'react'
import type { SecuritySettings as SecuritySettingsType } from '../../types/settings'

interface Props {
  security: SecuritySettingsType
  onChange: (s: SecuritySettingsType) => void
}

function SecuritySettings({ security, onChange }: Props) {
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  return (
    <div className="settings-section-enter">
      <div className="settings-section-header">
        <h2>Security</h2>
        <p>Manage your password, two-factor authentication, and sessions.</p>
      </div>

      {/* Change Password */}
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon blue">
            <Lock size={18} />
          </div>
          <div>
            <h3>Change Password</h3>
            <p>Update your account password regularly for better security.</p>
          </div>
        </div>

        <div className="settings-form-grid compact">
          <div className="settings-field">
            <label>Current Password</label>
            <div className="settings-field-input">
              <input
                type={showCurrentPw ? 'text' : 'password'}
                placeholder="Enter current password"
              />
              <button
                className="settings-field-toggle"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                aria-label="Toggle password visibility"
              >
                {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="settings-field">
            <label>New Password</label>
            <div className="settings-field-input">
              <input
                type={showNewPw ? 'text' : 'password'}
                placeholder="Enter new password"
              />
              <button
                className="settings-field-toggle"
                onClick={() => setShowNewPw(!showNewPw)}
                aria-label="Toggle password visibility"
              >
                {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="settings-field">
            <label>Confirm New Password</label>
            <div className="settings-field-input">
              <input
                type={showConfirmPw ? 'text' : 'password'}
                placeholder="Confirm new password"
              />
              <button
                className="settings-field-toggle"
                onClick={() => setShowConfirmPw(!showConfirmPw)}
                aria-label="Toggle password visibility"
              >
                {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        </div>

        <div className="settings-password-requirements">
          <span>Password must contain:</span>
          <ul>
            <li>Minimum 8 characters</li>
            <li>At least one uppercase letter</li>
            <li>At least one number</li>
          </ul>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon green">
            <ShieldCheck size={18} />
          </div>
          <div className="settings-card-header-text">
            <h3>Two-Factor Authentication</h3>
            <p>Add an extra layer of security to your organization account.</p>
          </div>
          <div className={`settings-badge ${security.twoFactorEnabled ? 'active' : 'inactive'}`}>
            {security.twoFactorEnabled ? 'Enabled' : 'Not Enabled'}
          </div>
        </div>
        {!security.twoFactorEnabled && (
          <p className="settings-card-description">
            Two-factor authentication adds an additional layer of security by requiring a verification code from your phone when signing in.
          </p>
        )}
        <button
          className="settings-btn secondary"
          onClick={() => onChange({ ...security, twoFactorEnabled: !security.twoFactorEnabled })}
        >
          <ShieldAlert size={15} />
          {security.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
        </button>
      </div>

      {/* Active Sessions */}
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon purple">
            <Monitor size={18} />
          </div>
          <div>
            <h3>Active Sessions</h3>
            <p>Currently signed in devices and sessions.</p>
          </div>
        </div>

        <div className="settings-session-item">
          <div className="settings-session-info">
            <div className="settings-session-device">
              <Monitor size={15} />
              <span>{security.activeSession.device}</span>
              <span className="settings-session-current">Current</span>
            </div>
            <div className="settings-session-meta">
              <span><MapPin size={12} /> {security.activeSession.location}</span>
              <span><Clock size={12} /> {security.activeSession.lastActive}</span>
            </div>
          </div>
        </div>

        <button className="settings-btn secondary" style={{ marginTop: '16px' }}>
          <LogOut size={15} />
          Sign Out Other Sessions
        </button>
      </div>

      {/* Danger Zone */}
      <div className="settings-card danger-zone">
        <div className="settings-card-header">
          <div className="settings-card-icon red">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3>Danger Zone</h3>
            <p>Irreversible actions. Please proceed with caution.</p>
          </div>
        </div>
        <button className="settings-btn danger">
          <LogOut size={15} />
          Sign Out of All Devices
        </button>
      </div>
    </div>
  )
}

export default SecuritySettings
