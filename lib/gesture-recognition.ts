// Gesture recognition utility for detecting hand gestures
// Maps hand landmarks to letters and numbers

export type GestureType =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z'
  | 'SPACE'
  | 'DELETE'
  | 'NONE'

export interface HandLandmark {
  x: number
  y: number
  z: number
}

export interface GestureResult {
  gesture: GestureType
  confidence: number
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(point1: HandLandmark, point2: HandLandmark): number {
  return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2) + Math.pow(point1.z - point2.z, 2))
}

/**
 * Get angle between three points
 */
export function getAngle(point1: HandLandmark, point2: HandLandmark, point3: HandLandmark): number {
  const a = Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2) + Math.pow(point2.z - point1.z, 2)
  )
  const b = Math.sqrt(
    Math.pow(point3.x - point2.x, 2) + Math.pow(point3.y - point2.y, 2) + Math.pow(point3.z - point2.z, 2)
  )
  const c = Math.sqrt(
    Math.pow(point3.x - point1.x, 2) + Math.pow(point3.y - point1.y, 2) + Math.pow(point3.z - point1.z, 2)
  )

  const cosine = (a * a + b * b - c * c) / (2 * a * b)
  const angle = Math.acos(Math.max(-1, Math.min(1, cosine)))
  return angle * (180 / Math.PI)
}

/**
 * Detect gesture from hand landmarks (simplified detection)
 * This is a basic implementation. For production, use MediaPipe Hand Gestures
 */
export function detectGesture(landmarks: HandLandmark[]): GestureResult {
  if (landmarks.length < 21) {
    return { gesture: 'NONE', confidence: 0 }
  }

  // Simplified gesture detection - detect if hand is open or closed
  const thumbTip = landmarks[4]
  const indexTip = landmarks[8]
  const middleTip = landmarks[12]
  const ringTip = landmarks[16]
  const pinkyTip = landmarks[20]

  const palmBase = landmarks[0]

  // Calculate distances from palm base to finger tips
  const thumbDist = calculateDistance(palmBase, thumbTip)
  const indexDist = calculateDistance(palmBase, indexTip)
  const middleDist = calculateDistance(palmBase, middleTip)
  const ringDist = calculateDistance(palmBase, ringTip)
  const pinkyDist = calculateDistance(palmBase, pinkyTip)

  const fingerDistances = [thumbDist, indexDist, middleDist, ringDist, pinkyDist]
  const avgDistance = fingerDistances.reduce((a, b) => a + b) / fingerDistances.length

  // Simple gesture detection
  const openFingers = fingerDistances.filter((d) => d > avgDistance * 0.8).length

  if (openFingers >= 4) {
    return { gesture: 'A', confidence: 0.7 } // Palm open
  } else if (openFingers <= 1) {
    return { gesture: 'Z', confidence: 0.7 } // Fist closed
  } else {
    return { gesture: 'NONE', confidence: 0.5 }
  }
}

/**
 * Draw hand landmarks on canvas for debugging
 */
export function drawHandLandmarks(ctx: CanvasRenderingContext2D, landmarks: HandLandmark[], width: number, height: number) {
  // Draw finger connections
  const connections = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [0, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [0, 9],
    [9, 10],
    [10, 11],
    [11, 12],
    [0, 13],
    [13, 14],
    [14, 15],
    [15, 16],
    [0, 17],
    [17, 18],
    [18, 19],
    [19, 20],
  ]

  ctx.strokeStyle = '#00FF00'
  ctx.lineWidth = 2

  for (const [start, end] of connections) {
    const p1 = landmarks[start]
    const p2 = landmarks[end]
    ctx.beginPath()
    ctx.moveTo(p1.x * width, p1.y * height)
    ctx.lineTo(p2.x * width, p2.y * height)
    ctx.stroke()
  }

  // Draw landmarks
  ctx.fillStyle = '#FF0000'
  for (const landmark of landmarks) {
    ctx.beginPath()
    ctx.arc(landmark.x * width, landmark.y * height, 5, 0, 2 * Math.PI)
    ctx.fill()
  }
}
