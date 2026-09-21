import { Camera, Upload, ScanLine } from 'lucide-react'

function QrScannerMock() {
  return (
    <div className="verify-qr">
      <h3>Scan Certificate QR Code</h3>
      <div className="verify-qr-area">
        <div className="verify-qr-frame">
          <span className="verify-qr-corner tl" />
          <span className="verify-qr-corner tr" />
          <span className="verify-qr-corner bl" />
          <span className="verify-qr-corner br" />
          <div className="verify-qr-scanline" />
          <div className="verify-qr-center">
            <ScanLine size={32} />
          </div>
        </div>
      </div>
      <p className="verify-qr-text">
        Position the certificate QR code inside the frame.
      </p>
      <div className="verify-qr-actions">
        <button className="verify-btn-primary">
          <Camera size={15} />
          Use Camera
        </button>
        <button className="verify-btn-secondary">
          <Upload size={15} />
          Upload QR Image
        </button>
      </div>
    </div>
  )
}

export default QrScannerMock
