import { Palette, Pen, Upload } from 'lucide-react'
import type { CertificateBranding as CertificateBrandingType } from '../../types/settings'

interface Props {
  branding: CertificateBrandingType
  onChange: (b: CertificateBrandingType) => void
}

function CertificateBranding({ branding, onChange }: Props) {
  const update = (field: keyof CertificateBrandingType, value: string) => {
    onChange({ ...branding, [field]: value })
  }

  return (
    <div className="settings-section-enter">
      <div className="settings-section-header">
        <h2>Certificate Branding</h2>
        <p>Customize how your certificates appear to recipients.</p>
      </div>

      <div className="settings-card">
        <div className="settings-branding-layout">
          <div className="settings-form-grid">
            <div className="settings-field">
              <label>Organization Display Name</label>
              <input
                type="text"
                value={branding.displayName}
                onChange={(e) => update('displayName', e.target.value)}
              />
            </div>

            <div className="settings-field">
              <label>Certificate Footer Text</label>
              <input
                type="text"
                value={branding.footerText}
                onChange={(e) => update('footerText', e.target.value)}
              />
            </div>

            <div className="settings-field">
              <label>
                <Palette size={14} />
                Primary Brand Color
              </label>
              <div className="settings-color-picker">
                <input
                  type="color"
                  value={branding.primaryColor}
                  onChange={(e) => update('primaryColor', e.target.value)}
                  className="settings-color-input"
                />
                <span className="settings-color-value">{branding.primaryColor}</span>
                <div className="settings-color-presets">
                  {['#3975ff', '#8264df', '#2fa879'].map((c) => (
                    <button
                      key={c}
                      className={`settings-color-swatch ${branding.primaryColor === c ? 'selected' : ''}`}
                      style={{ background: c }}
                      onClick={() => update('primaryColor', c)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="settings-field">
              <label>
                <Pen size={14} />
                Authorized Signer Name
              </label>
              <input
                type="text"
                value={branding.signerName}
                onChange={(e) => update('signerName', e.target.value)}
              />
            </div>

            <div className="settings-field">
              <label>Authorized Signer Position</label>
              <input
                type="text"
                value={branding.signerPosition}
                onChange={(e) => update('signerPosition', e.target.value)}
              />
            </div>

            <div className="settings-field full-width">
              <label>Signature Upload</label>
              <div className="settings-upload-zone compact">
                <div className="settings-signature-preview">
                  <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '14px', color: '#3e4a5e' }}>
                    {branding.signerName ? branding.signerName.split(' ').map(n => n[0]).join('') : '—'}
                  </span>
                </div>
                <div className="settings-upload-info">
                  <span>Upload signature image</span>
                  <small>PNG or SVG with transparent background</small>
                </div>
                <Upload size={16} className="settings-upload-icon" />
              </div>
            </div>
          </div>

          <div className="settings-branding-preview">
            <span className="settings-preview-label">Certificate Preview</span>
            <div className="settings-mini-certificate" style={{ borderColor: `${branding.primaryColor}30` }}>
              <div className="settings-mini-cert-header" style={{ color: branding.primaryColor }}>
                <div className="settings-mini-cert-logo" style={{ background: branding.primaryColor }}>🏛</div>
                <div>
                  <strong>{branding.displayName || 'Organization Name'}</strong>
                  <small>{branding.footerText || 'Certificate of Completion'}</small>
                </div>
              </div>
              <div className="settings-mini-cert-body">
                <small>Certificate of Achievement</small>
                <h4>John Doe</h4>
                <p>has successfully completed the program</p>
              </div>
              <div className="settings-mini-cert-footer">
                <div>
                  <div className="settings-mini-signature-line" style={{ borderColor: `${branding.primaryColor}40` }} />
                  <small>{branding.signerName || 'Signer Name'}</small>
                  <small>{branding.signerPosition || 'Position'}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CertificateBranding
