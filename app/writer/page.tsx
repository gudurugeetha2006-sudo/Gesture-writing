'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Eraser, Camera, CameraOff, Loader2, Hand, Download, Home, RotateCcw, Share2, Video, VideoOff } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

declare global {
  interface Window {
    Hands: any
    drawConnectors: any
    drawLandmarks: any
    HAND_CONNECTIONS: any
  }
}

interface Point { x: number; y: number }
interface Stroke { points: Point[]; color: string; width: number }

export default function GestureWriter() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const cameraCanvasRef = useRef<HTMLCanvasElement>(null)
  const drawCanvasRef = useRef<HTMLCanvasElement>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [cameraActive, setCameraActive] = useState(false)
  const [videoVisible, setVideoVisible] = useState(true)
  const [status, setStatus] = useState('Initializing...')
  const [error, setError] = useState<string | null>(null)
  const [isPointing, setIsPointing] = useState(false)
  const [isFist, setIsFist] = useState(false)
  const [fingerPos, setFingerPos] = useState<Point | null>(null)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [strokeCount, setStrokeCount] = useState(0)

  const handsRef = useRef<any>(null)
  const animationRef = useRef<number | null>(null)
  const currentStrokeRef = useRef<Point[]>([])
  const isPointingRef = useRef(false)
  const strokesRef = useRef<Stroke[]>([])

  // Fist hold-to-clear: track how long fist has been held
  const fistStartRef = useRef<number | null>(null)
  const [fistProgress, setFistProgress] = useState(0) // 0-100
  const FIST_HOLD_MS = 1500 // hold fist for 1.5s to clear

  const drawColor = '#3b82f6'

  const redrawCanvas = useCallback(() => {
    const canvas = drawCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const stroke of strokesRef.current) {
      if (stroke.points.length < 2) continue
      ctx.beginPath()
      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
      }
      ctx.stroke()
    }

    if (currentStrokeRef.current.length >= 2) {
      ctx.beginPath()
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 6
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.moveTo(currentStrokeRef.current[0].x, currentStrokeRef.current[0].y)
      for (let i = 1; i < currentStrokeRef.current.length; i++) {
        ctx.lineTo(currentStrokeRef.current[i].x, currentStrokeRef.current[i].y)
      }
      ctx.stroke()
    }
  }, [])

  // Detect pointing: index up, all others down
  const isIndexPointing = useCallback((landmarks: any[]): boolean => {
    if (landmarks.length < 21) return false
    const indexUp = landmarks[8].y < landmarks[6].y
    const middleDown = landmarks[12].y > landmarks[10].y
    const ringDown = landmarks[16].y > landmarks[14].y
    const pinkyDown = landmarks[20].y > landmarks[18].y
    return indexUp && middleDown && ringDown && pinkyDown
  }, [])

  // Detect fist: all fingers curled down
  const isFistGesture = useCallback((landmarks: any[]): boolean => {
    if (landmarks.length < 21) return false
    const indexDown = landmarks[8].y > landmarks[6].y
    const middleDown = landmarks[12].y > landmarks[10].y
    const ringDown = landmarks[16].y > landmarks[14].y
    const pinkyDown = landmarks[20].y > landmarks[18].y
    const thumbIn = Math.abs(landmarks[4].x - landmarks[3].x) < 0.08
    return indexDown && middleDown && ringDown && pinkyDown && thumbIn
  }, [])

  const clearCanvas = useCallback(() => {
    strokesRef.current = []
    currentStrokeRef.current = []
    setStrokes([])
    setStrokeCount(0)
    fistStartRef.current = null
    setFistProgress(0)
    const canvas = drawCanvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, canvas.width, canvas.height)
    }
    toast.success('Canvas cleared')
  }, [])

  const onResults = useCallback((results: any) => {
    const camCanvas = cameraCanvasRef.current
    if (!camCanvas) return
    const ctx = camCanvas.getContext('2d')
    if (!ctx) return

    ctx.save()
    ctx.clearRect(0, 0, camCanvas.width, camCanvas.height)
    if (videoVisible) {
      ctx.translate(camCanvas.width, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(results.image, 0, 0, camCanvas.width, camCanvas.height)
    } else {
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, camCanvas.width, camCanvas.height)
    }
    ctx.restore()

    const W = camCanvas.width
    const H = camCanvas.height

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0]

      if (window.drawConnectors && window.HAND_CONNECTIONS) {
        window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, { color: '#22c55e', lineWidth: 2 })
        window.drawLandmarks(ctx, landmarks, { color: '#ef4444', lineWidth: 1, radius: 3 })
      }

      const tip = landmarks[8]
      const fx = (1 - tip.x) * W
      const fy = tip.y * H

      setFingerPos({ x: fx, y: fy })

      const pointing = isIndexPointing(landmarks)
      const fist = isFistGesture(landmarks)

      // --- Fist hold-to-clear logic ---
      if (fist && !pointing) {
        setIsFist(true)
        if (fistStartRef.current === null) {
          fistStartRef.current = Date.now()
        }
        const elapsed = Date.now() - fistStartRef.current
        const progress = Math.min(100, (elapsed / FIST_HOLD_MS) * 100)
        setFistProgress(progress)
        if (elapsed >= FIST_HOLD_MS) {
          clearCanvas()
          setIsFist(false)
        }
      } else {
        setIsFist(false)
        fistStartRef.current = null
        setFistProgress(0)
      }

      // --- Drawing logic ---
      if (pointing && !fist) {
        if (!isPointingRef.current) {
          isPointingRef.current = true
          currentStrokeRef.current = [{ x: fx, y: fy }]
        } else {
          currentStrokeRef.current.push({ x: fx, y: fy })
        }
        setIsPointing(true)
        redrawCanvas()
      } else {
        if (isPointingRef.current) {
          if (currentStrokeRef.current.length > 3) {
            const newStroke: Stroke = {
              points: [...currentStrokeRef.current],
              color: drawColor,
              width: 6
            }
            strokesRef.current = [...strokesRef.current, newStroke]
            setStrokes([...strokesRef.current])
            setStrokeCount(c => c + 1)
          }
          currentStrokeRef.current = []
          isPointingRef.current = false
          redrawCanvas()
        }
        setIsPointing(false)
      }

      // Fingertip dot
      const drawCanvas = drawCanvasRef.current
      if (drawCanvas) {
        const dctx = drawCanvas.getContext('2d')
        if (dctx) {
          redrawCanvas()
          dctx.beginPath()
          dctx.arc(fx, fy, pointing ? 8 : 5, 0, Math.PI * 2)
          dctx.fillStyle = fist ? '#f97316' : pointing ? '#ef4444' : '#94a3b8'
          dctx.fill()
        }
      }
    } else {
      if (isPointingRef.current && currentStrokeRef.current.length > 3) {
        const newStroke: Stroke = {
          points: [...currentStrokeRef.current],
          color: drawColor,
          width: 6
        }
        strokesRef.current = [...strokesRef.current, newStroke]
        setStrokes([...strokesRef.current])
      }
      currentStrokeRef.current = []
      isPointingRef.current = false
      fistStartRef.current = null
      setIsPointing(false)
      setIsFist(false)
      setFistProgress(0)
      setFingerPos(null)
      redrawCanvas()
    }
  }, [isIndexPointing, isFistGesture, redrawCanvas, clearCanvas, videoVisible])

  useEffect(() => {
    let mounted = true

    const loadMediaPipe = async () => {
      try {
        setStatus('Loading hand tracking...')

        const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
          const s = document.createElement('script')
          s.src = src
          s.crossOrigin = 'anonymous'
          s.onload = () => resolve()
          s.onerror = reject
          document.head.appendChild(s)
        })

        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js')
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js')
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js')

        if (!mounted) return

        const hands = new window.Hands({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        })

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5
        })

        hands.onResults(onResults)
        handsRef.current = hands

        if (mounted) {
          setStatus('Starting camera...')
          await startCamera(hands)
        }
      } catch {
        if (mounted) {
          setError('Failed to load hand tracking. Please refresh.')
          setIsLoading(false)
        }
      }
    }

    loadMediaPipe()
    return () => {
      mounted = false
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [onResults])

  const startCamera = async (hands: any) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      })
      const video = videoRef.current
      if (!video) return
      video.srcObject = stream
      await video.play()
      setCameraActive(true)
      setIsLoading(false)
      setStatus('Ready')
      setError(null)

      const processFrame = async () => {
        if (video.readyState >= 2 && handsRef.current) {
          await handsRef.current.send({ image: video })
        }
        animationRef.current = requestAnimationFrame(processFrame)
      }
      animationRef.current = requestAnimationFrame(processFrame)
    } catch {
      setError('Camera access denied. Please allow camera permissions and refresh.')
      setIsLoading(false)
    }
  }

  const undoLast = useCallback(() => {
    if (strokesRef.current.length === 0) return
    strokesRef.current = strokesRef.current.slice(0, -1)
    setStrokes([...strokesRef.current])
    setStrokeCount(c => Math.max(0, c - 1))
    redrawCanvas()
    toast.success('Undone')
  }, [redrawCanvas])

  const downloadDrawing = useCallback(() => {
    const camCanvas = cameraCanvasRef.current
    const drawCanvas = drawCanvasRef.current
    if (!drawCanvas) return

    // Merge camera canvas + drawing canvas into one image
    const merged = document.createElement('canvas')
    merged.width = drawCanvas.width
    merged.height = drawCanvas.height
    const ctx = merged.getContext('2d')
    if (!ctx) return

    if (camCanvas) ctx.drawImage(camCanvas, 0, 0)
    ctx.drawImage(drawCanvas, 0, 0)

    const link = document.createElement('a')
    link.download = 'finger-drawing.png'
    link.href = merged.toDataURL()
    link.click()
    toast.success('Downloaded!')
  }, [])

  const shareDrawing = useCallback(async () => {
    const camCanvas = cameraCanvasRef.current
    const drawCanvas = drawCanvasRef.current
    if (!drawCanvas) return

    const merged = document.createElement('canvas')
    merged.width = drawCanvas.width
    merged.height = drawCanvas.height
    const ctx = merged.getContext('2d')
    if (!ctx) return

    if (camCanvas) ctx.drawImage(camCanvas, 0, 0)
    ctx.drawImage(drawCanvas, 0, 0)

    try {
      merged.toBlob(async (blob) => {
        if (!blob) return

        // Try Web Share API first (mobile / modern browsers)
        if (navigator.share && navigator.canShare) {
          const file = new File([blob], 'finger-drawing.png', { type: 'image/png' })
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'My Finger Drawing',
              text: 'Created with Finger Writer',
              files: [file]
            })
            toast.success('Shared!')
            return
          }
        }

        // Fallback: copy image to clipboard
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ])
          toast.success('Drawing copied to clipboard!')
        } catch {
          // Last fallback: open in new tab
          const url = URL.createObjectURL(blob)
          window.open(url, '_blank')
          toast.success('Opened in new tab - right-click to save or share!')
        }
      })
    } catch {
      toast.error('Could not share drawing')
    }
  }, [])

  const gestureStatusText = () => {
    if (isFist) return `Hold fist to clear... ${Math.round(fistProgress)}%`
    if (isPointing) return 'Drawing — lower index finger to stop'
    if (cameraActive) return 'Point index finger to draw  |  Hold fist 1.5s to clear'
    return ''
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/"><Home className="w-4 h-4" /></Link>
          </Button>
          <h1 className="font-semibold text-lg">Finger Writer</h1>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {strokeCount} stroke{strokeCount !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle video */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVideoVisible(v => !v)}
            disabled={!cameraActive}
            title={videoVisible ? 'Hide video feed' : 'Show video feed'}
          >
            {videoVisible ? <VideoOff className="w-4 h-4 mr-1.5" /> : <Video className="w-4 h-4 mr-1.5" />}
            {videoVisible ? 'Hide Video' : 'Show Video'}
          </Button>

          {/* Camera status pill */}
          <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
            isPointing ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
            isFist ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
            cameraActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            'bg-muted text-muted-foreground'
          }`}>
            {isPointing ? (
              <><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />Drawing</>
            ) : isFist ? (
              <><div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />Clearing...</>
            ) : cameraActive ? (
              <><div className="w-2 h-2 rounded-full bg-green-500" /><Camera className="w-3 h-3" />Live</>
            ) : (
              <><CameraOff className="w-3 h-3" />No camera</>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Camera + Drawing Canvas */}
        <div className="flex-1 relative bg-black flex items-center justify-center min-h-[400px] lg:min-h-0">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/80 text-white gap-3">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">{status}</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/80 text-white gap-4 p-6 text-center">
              <CameraOff className="w-10 h-10 text-red-400" />
              <p className="text-sm text-red-300">{error}</p>
              <p className="text-xs text-white/60">Open this app in a new browser tab and allow camera access.</p>
            </div>
          )}

          <video ref={videoRef} className="hidden" playsInline muted />

          <canvas ref={cameraCanvasRef} width={640} height={480}
            className="w-full h-full object-contain" />

          <canvas ref={drawCanvasRef} width={640} height={480}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none" />

          {/* Fist progress arc overlay */}
          {isFist && fistProgress > 0 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1">
              <div className="w-16 h-16 relative">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#f97316" strokeWidth="3"
                    strokeDasharray={`${fistProgress * 0.942} 94.2`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                  {Math.round(fistProgress)}%
                </span>
              </div>
              <span className="text-white text-xs bg-black/60 px-2 py-0.5 rounded-full">Hold to clear</span>
            </div>
          )}

          {/* Status bar */}
          {cameraActive && !isLoading && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap">
              {gestureStatusText()}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l bg-background flex flex-col">
          <div className="p-4 space-y-4 flex-1">

            {/* How to use */}
            <div className="bg-muted rounded-lg p-3 space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Hand className="w-4 h-4" />
                Gestures
              </h3>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 mt-1 rounded-full bg-red-500 flex-shrink-0" />
                  <span><strong>Index finger up</strong> — draw (red line)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 mt-1 rounded-full bg-blue-500 flex-shrink-0" />
                  <span><strong>Curl index / raise others</strong> — lift pen (blue stroke saved)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 mt-1 rounded-full bg-orange-500 flex-shrink-0" />
                  <span><strong>Hold fist 1.5s</strong> — clear canvas</span>
                </li>
              </ul>
            </div>

            {/* Stroke count */}
            <div className="text-center text-sm text-muted-foreground">
              {strokeCount === 0 ? 'No strokes yet' : `${strokeCount} stroke${strokeCount !== 1 ? 's' : ''} drawn`}
            </div>
          </div>

          {/* Action buttons */}
          <div className="p-4 border-t space-y-2">
            <Button onClick={undoLast} variant="outline" className="w-full" disabled={strokeCount === 0}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Undo Last Stroke
            </Button>
            <Button onClick={clearCanvas} variant="outline" className="w-full" disabled={strokeCount === 0}>
              <Eraser className="w-4 h-4 mr-2" />
              Clear All
            </Button>
            <Button onClick={shareDrawing} variant="outline" className="w-full" disabled={strokeCount === 0}>
              <Share2 className="w-4 h-4 mr-2" />
              Share Drawing
            </Button>
            <Button onClick={downloadDrawing} className="w-full" disabled={strokeCount === 0}>
              <Download className="w-4 h-4 mr-2" />
              Save as PNG
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
