import { Camera, ScanLine, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [status, setStatus] = useState('Scan a certificate QR code or upload a QR image.')
  const [cameraActive, setCameraActive] = useState(false)
  const nativeSupported = typeof window !== 'undefined' && 'BarcodeDetector' in window

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

  const decodeWithCanvas = (source: CanvasImageSource, width: number, height: number) => {
    if (width <= 0 || height <= 0) return null

    const canvas = canvasRef.current ?? document.createElement('canvas')
    canvasRef.current = canvas
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return null

    context.drawImage(source, 0, 0, width, height)
    const imageData = context.getImageData(0, 0, width, height)
    return jsQR(imageData.data, imageData.width, imageData.height)?.data ?? null
  }

  const detectQrValue = async (source: CanvasImageSource, width: number, height: number) => {
    const currentDetector = detector()

    if (currentDetector) {
      try {
        const codes = await currentDetector.detect(source)
        const nativeValue = codes[0]?.rawValue?.trim()

        if (nativeValue) return nativeValue
      } catch {
        // Fall through to jsQR. Some browsers expose BarcodeDetector but fail on video frames.
      }
    }

    return decodeWithCanvas(source, width, height)
  }

  const handleDecodedValue = (value: string) => {
    const trimmedValue = value.trim()

    if (!trimmedValue) return

    stopCamera()
    setStatus('QR code found. Opening verification result...')
    onScan(trimmedValue)
  }

  const scanFrame = async () => {
    const video = videoRef.current

    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      animationRef.current = requestAnimationFrame(scanFrame)
      return
    }

    try {
      const value = await detectQrValue(video, video.videoWidth, video.videoHeight)

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
    if (!file) return

    try {
      setStatus('Reading QR image...')
      const bitmap = await createImageBitmap(file)
      const value = await detectQrValue(bitmap, bitmap.width, bitmap.height)
      bitmap.close()

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
        {nativeSupported ? status : `${status} Using browser-compatible QR scanning.`}
      </p>
      <div className="verify-qr-actions">
        <button className="verify-btn-primary" type="button" onClick={cameraActive ? stopCamera : startCamera}>
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
