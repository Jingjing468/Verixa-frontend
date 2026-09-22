import { Camera, ScanLine, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type DetectedBarcode = {
  rawValue: string
}

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => {
  detect: (source: CanvasImageSource | Blob) => Promise<DetectedBarcode[]>
}

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor
  }
}

type Props = {
  onScan: (value: string) => void
}

function QrScanner({ onScan }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)
  const detectorRef = useRef<InstanceType<BarcodeDetectorConstructor> | null>(null)
  const [status, setStatus] = useState('Scan a certificate QR code or upload a QR image.')
  const [cameraActive, setCameraActive] = useState(false)
  const supported = typeof window !== 'undefined' && 'BarcodeDetector' in window

  const stopCamera = () => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraActive(false)
  }

  useEffect(() => stopCamera, [])

  const detector = () => {
    if (!window.BarcodeDetector) return null

    detectorRef.current ??= new window.BarcodeDetector({ formats: ['qr_code'] })

    return detectorRef.current
  }

  const handleDecodedValue = (value: string) => {
    const trimmedValue = value.trim()

    if (!trimmedValue) return

    stopCamera()
    setStatus('QR code found. Opening verification result...')
    onScan(trimmedValue)
  }

  const scanFrame = async () => {
    const currentDetector = detector()
    const video = videoRef.current

    if (!currentDetector || !video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      animationRef.current = requestAnimationFrame(scanFrame)
      return
    }

    try {
      const codes = await currentDetector.detect(video)
      const value = codes[0]?.rawValue

      if (value) {
        handleDecodedValue(value)
        return
      }
    } catch {
      setStatus('Could not read that frame yet. Keep the QR code inside the box.')
    }

    animationRef.current = requestAnimationFrame(scanFrame)
  }

  const startCamera = async () => {
    const currentDetector = detector()

    if (!currentDetector) {
      setStatus('QR scanning is not supported in this browser. Upload an image or enter the certificate ID.')
      return
    }

    try {
      stopCamera()
      setStatus('Starting camera...')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setCameraActive(true)
      setStatus('Point your camera at the certificate QR code.')
      animationRef.current = requestAnimationFrame(scanFrame)
    } catch {
      setStatus('Camera access failed. Allow camera permission or upload a QR image.')
    }
  }

  const uploadQrImage = async (file: File | undefined) => {
    const currentDetector = detector()

    if (!file) return

    if (!currentDetector) {
      setStatus('QR image scanning is not supported in this browser. Enter the certificate ID instead.')
      return
    }

    try {
      setStatus('Reading QR image...')
      const bitmap = await createImageBitmap(file)
      const codes = await currentDetector.detect(bitmap)
      bitmap.close()
      const value = codes[0]?.rawValue

      if (!value) {
        setStatus('No QR code found in that image. Try a clearer image.')
        return
      }

      handleDecodedValue(value)
    } catch {
      setStatus('Could not read that image. Try a clearer QR image.')
    }
  }

  return (
    <div className="verify-qr">
      <h3>Scan Certificate QR Code</h3>
      <div className="verify-qr-area">
        <div className="verify-qr-frame">
          <span className="verify-qr-corner tl" />
          <span className="verify-qr-corner tr" />
          <span className="verify-qr-corner bl" />
          <span className="verify-qr-corner br" />
          {cameraActive ? <video ref={videoRef} className="verify-qr-video" muted playsInline /> : <div className="verify-qr-scanline" />}
          {!cameraActive && (
            <div className="verify-qr-center">
              <ScanLine size={32} />
            </div>
          )}
        </div>
      </div>
      <p className="verify-qr-text">
        {supported ? status : 'QR scanning is not supported in this browser. Enter the certificate ID instead.'}
      </p>
      <div className="verify-qr-actions">
        <button className="verify-btn-primary" type="button" onClick={cameraActive ? stopCamera : startCamera} disabled={!supported}>
          <Camera size={15} />
          {cameraActive ? 'Stop Camera' : 'Use Camera'}
        </button>
        <label className="verify-btn-secondary">
          <Upload size={15} />
          Upload QR Image
          <input type="file" accept="image/*" onChange={(event) => void uploadQrImage(event.target.files?.[0])} />
        </label>
      </div>
    </div>
  )
}

export default QrScanner
