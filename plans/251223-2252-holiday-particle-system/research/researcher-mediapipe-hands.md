# MediaPipe Hands Research Report
**Date:** 2025-12-23 | **Topic:** Web-Based Gesture Recognition

## 1. CDN Integration

**Modern Approach (Recommended):**
```html
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.js" crossorigin="anonymous"></script>
```

**Legacy Approach (Deprecated but simpler):**
```html
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>
```

**Setup (Modern):**
```javascript
const vision = await FilesetResolver.forVisionTasks(
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
);
const handLandmarker = await HandLandmarker.createFromOptions(vision, {
  baseOptions: { modelAssetPath: "hand_landmarker.task" },
  numHands: 2,
  minHandDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
```

**Alternative CDN:** unpkg also provides `@mediapipe/tasks-vision` packages.

## 2. 21 Hand Landmarks Mapping

MediaPipe detects 21 landmarks per hand:
- **0:** Wrist (origin for depth)
- **1-4:** Thumb (CMC, MCP, PIP, TIP)
- **5-8:** Index (MCP, PIP, DIP, TIP)
- **9-12:** Middle (MCP, PIP, DIP, TIP)
- **13-16:** Ring (MCP, PIP, DIP, TIP)
- **17-20:** Pinky (MCP, PIP, DIP, TIP)

**Coordinate Systems:**
- **Normalized (Screen Space):** x, y ∈ [0.0, 1.0]; z = relative depth (wrist = origin)
- **World Coordinates:** Real-world 3D in meters from hand's geometric center

## 3. Gesture Detection Algorithms

### Open Hand Detection
```javascript
function detectOpenHand(landmarks) {
  // Check if all fingertips are above MCP joints (extended)
  const fingerTips = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky tips
  const mcpJoints = [2, 6, 10, 14, 18];  // MCP joints

  return fingerTips.every((tipIdx, i) =>
    landmarks[tipIdx].y < landmarks[mcpJoints[i]].y // Tip above MCP = extended
  );
}
```

### Pinch Detection (Thumb to Index)
```javascript
function detectPinch(landmarks, threshold = 0.03) {
  const thumb = landmarks[4];   // Thumb TIP
  const index = landmarks[8];   // Index TIP

  const distance = Math.sqrt(
    Math.pow(thumb.x - index.x, 2) +
    Math.pow(thumb.y - index.y, 2)
  );

  return distance < threshold; // <30px at 1920px width ≈ 0.015
}
```

### Fist Detection
```javascript
function detectFist(landmarks) {
  // Check if middle, ring, pinky tips are below MCP joints
  const conditions = [
    landmarks[12].y > landmarks[10].y, // Middle TIP below MCP
    landmarks[16].y > landmarks[14].y, // Ring TIP below MCP
    landmarks[20].y > landmarks[18].y  // Pinky TIP below MCP
  ];

  return conditions.every(c => c);
}
```

## 4. 2D to 3D Coordinate Mapping (Three.js)

**Screen Space (Normalized) → World Space:**
```javascript
function mapToThreeJsSpace(landmarks, canvasWidth, canvasHeight) {
  return landmarks.map(lm => ({
    x: (lm.x - 0.5) * 2,        // [-1, 1] camera frustum
    y: -(lm.y - 0.5) * 2,       // Flip Y-axis (screen up = world up)
    z: -lm.z * depthScale       // Negative Z = away from camera
  }));
}
```

**Depth Calculation from Landmarks:**
```javascript
function calculateDepthFromHand(landmarks) {
  const wrist = landmarks[0];
  const middleTip = landmarks[10];

  // Distance between wrist and middle finger tip in 2D
  const distance2D = Math.sqrt(
    Math.pow(middleTip.x - wrist.x, 2) +
    Math.pow(middleTip.y - wrist.y, 2)
  );

  // Map to depth range (larger hand = closer to camera)
  return THREE.MathUtils.mapLinear(distance2D, 0.1, 0.5, 1, -1);
}
```

**Hand Position Tracking:**
```javascript
function updateHandPosition(landmarks, handObject) {
  const middleBase = landmarks[9]; // Middle finger MCP (center)

  handObject.position.x = (middleBase.x - 0.5) * 2;
  handObject.position.y = -(middleBase.y - 0.5) * 2;
  handObject.position.z = calculateDepthFromHand(landmarks);
}
```

## 5. Video Processing Loop

```javascript
const video = document.querySelector("video");
let lastTimestamp = 0;

async function processHands() {
  const now = performance.now();

  if (now - lastTimestamp > 16.67) { // ~60 FPS throttle
    const results = await handLandmarker.detectForVideo(video, now);

    if (results.landmarks.length > 0) {
      const landmarks = results.landmarks[0];

      if (detectOpenHand(landmarks)) console.log("Open hand");
      if (detectPinch(landmarks)) console.log("Pinching");
      if (detectFist(landmarks)) console.log("Fist");
    }

    lastTimestamp = now;
  }

  requestAnimationFrame(processHands);
}
```

## 6. Performance Considerations

| Metric | Details |
|--------|---------|
| **Frame Rate** | 30-60 FPS achievable; throttle detection to 30 FPS for non-critical apps |
| **Latency** | ~50-100ms inference time on modern hardware |
| **Accuracy** | Highest with good lighting, hands in-frame center, ~85-95% at 0.5 confidence |
| **WASM Loading** | ~2-3MB initial load; lazy-load model on first gesture needed |
| **Multi-Hand** | Dual-hand tracking adds ~20-30ms latency |

**Optimization Strategies:**
- Use `runningMode: "VIDEO"` for continuous tracking (not IMAGE mode)
- Throttle gesture detection logic to 30 FPS; camera loop at 60 FPS
- Reduce `numHands` to 1 if only tracking single hand
- Pre-load WASM modules at app startup
- Use web workers for gesture math (offload from main thread)

## 7. CDN URLs Summary

| Resource | URL |
|----------|-----|
| **Tasks Vision Bundle** | `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.js` |
| **WASM Modules** | `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm` |
| **Model File** | `hand_landmarker.task` (download from Google) |

## Unresolved Questions

1. **Model Path:** Where to host `hand_landmarker.task` file—inline data URI, separate CDN, or local?
2. **Fallback:** No hand detection fallback strategy defined; how to handle if WASM fails to load?
3. **Smoothing:** Should implement Kalman filtering on landmark positions for jitter reduction?
