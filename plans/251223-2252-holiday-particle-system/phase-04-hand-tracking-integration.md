# Phase 04: Hand Tracking Integration

## Context

- **Plan:** [plan.md](plan.md)
- **Research:** [MediaPipe Hands](research/researcher-mediapipe-hands.md)
- **Previous:** [Phase 03](phase-03-particle-physics-animations.md)
- **Next:** [Phase 05](phase-05-photo-popup-system.md)

---

## Overview

| Field | Value |
|-------|-------|
| Priority | P0 - Critical |
| Status | ⬜ Pending |
| Est. Time | 2h |
| Review Status | Not Started |

Integrate MediaPipe Hands for gesture detection (open hand, pinch, fist, hand movement) and map to state transitions including cloud rotation.

---

## Key Insights

- Use @mediapipe/tasks-vision for modern API
- Landmarks: Thumb tip (#4), Index tip (#8), all fingertips (#4,8,12,16,20), Palm center (#0 or #9)
- Gesture detection: Open hand (fingers extended), Pinch (thumb-index <30px), Fist (fingers curled), Hand movement (palm delta X/Y)
- Mirror webcam X-coordinate for natural interaction
- Show webcam preview in corner for user feedback
- Track hand position delta between frames for cloud rotation

---

## Requirements

### Functional
- Request webcam permission
- Detect hand landmarks via MediaPipe
- Recognize gestures: open hand, pinch, fist, hand movement (left/right)
- Map gestures to state transitions
- Track hand movement delta for cloud rotation
- Display webcam preview with landmark overlay

### Non-Functional
- <100ms gesture detection latency
- Graceful fallback if camera denied
- Works on Chrome, Firefox, Safari

---

## Architecture

```
HandTracking Module
├── initHandTracking()
│   ├── Request camera permission
│   ├── Create video element
│   └── Initialize HandLandmarker
├── detectGestures(landmarks)
│   ├── isOpenHand() → Tree → Cloud
│   ├── isPinching() → Show photo
│   ├── isFist() → Cloud → Tree
│   └── getHandMovement() → Rotate cloud
├── mapHandToScene(landmarks)
│   └── Convert 2D coords to 3D world space
├── trackHandMovement(landmarks)
│   ├── Calculate deltaX/Y from previous frame
│   ├── Apply rotation to cloud (Y-axis)
│   └── Store current position for next frame
└── drawLandmarks(canvas, landmarks)
    └── Visual feedback in preview
```

---

## Related Code Files

| Action | Path | Description |
|--------|------|-------------|
| MODIFY | `/index.html` | Add MediaPipe scripts and hand tracking |

---

## Implementation Steps

### Step 1: Add MediaPipe Script

```html
<!-- Add before importmap -->
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/vision_bundle.js" crossorigin="anonymous"></script>
```

### Step 2: Initialize Hand Tracking

```javascript
// Hand tracking state
let handLandmarker = null;
let videoElement = null;
let lastHandPosition = { x: 0, y: 0, z: 0 };
let isPinching = false;
let wasPinching = false;

async function initHandTracking() {
  try {
    // Request camera
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: 640, height: 480 }
    });

    // Setup video element
    videoElement = document.getElementById('webcam-preview');
    videoElement.srcObject = stream;
    videoElement.style.display = 'block';
    await videoElement.play();

    // Initialize MediaPipe
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
    );

    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      numHands: 1,
      minHandDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    console.log('Hand tracking initialized');
    return true;
  } catch (err) {
    console.warn('Hand tracking unavailable:', err.message);
    return false;
  }
}
```

### Step 3: Gesture Detection Functions

```javascript
function detectOpenHand(landmarks) {
  // Check if all fingertips are above their MCP joints (extended)
  const fingerTips = [4, 8, 12, 16, 20];
  const mcpJoints = [2, 5, 9, 13, 17];

  let extendedCount = 0;
  for (let i = 0; i < 5; i++) {
    if (landmarks[fingerTips[i]].y < landmarks[mcpJoints[i]].y) {
      extendedCount++;
    }
  }

  return extendedCount >= 4; // At least 4 fingers extended
}

function detectPinch(landmarks) {
  const thumb = landmarks[4];
  const index = landmarks[8];

  const distance = Math.sqrt(
    Math.pow(thumb.x - index.x, 2) +
    Math.pow(thumb.y - index.y, 2)
  );

  return distance < 0.05; // Normalized threshold
}

function detectFist(landmarks) {
  // Check if middle, ring, pinky are curled (tips below MCP)
  const curled =
    landmarks[12].y > landmarks[9].y &&   // Middle
    landmarks[16].y > landmarks[13].y &&  // Ring
    landmarks[20].y > landmarks[17].y;    // Pinky

  return curled;
}
```

### Step 3b: Hand Movement Tracking for Cloud Rotation

```javascript
// Track hand movement state
let previousHandX = null;
let previousHandY = null;
const MOVEMENT_THRESHOLD = 0.02;  // Minimum delta to trigger rotation
const ROTATION_SENSITIVITY = 2.0; // How fast cloud rotates

function trackHandMovement(landmarks) {
  // Use palm center (landmark #9 - middle finger MCP) for stable tracking
  const palmCenter = landmarks[9];
  const currentX = 1 - palmCenter.x; // Mirror X
  const currentY = palmCenter.y;

  let deltaX = 0;
  let deltaY = 0;

  if (previousHandX !== null && previousHandY !== null) {
    deltaX = currentX - previousHandX;
    deltaY = currentY - previousHandY;
  }

  previousHandX = currentX;
  previousHandY = currentY;

  return { deltaX, deltaY };
}

function applyCloudRotation(deltaX, deltaY) {
  if (currentState !== AppState.CLOUD) return;
  if (Math.abs(deltaX) < MOVEMENT_THRESHOLD) return;

  // Rotate cloud around Y-axis based on hand movement
  cloudRotationY += deltaX * ROTATION_SENSITIVITY;

  // Apply rotation to particle group
  particleGroup.rotation.y = cloudRotationY;
}
```

### Step 4: Map Hand Position to 3D

```javascript
function mapHandToWorld(landmarks) {
  // Use index finger base (landmark 5) as hand center
  const hand = landmarks[5];

  // Mirror X for natural interaction
  const x = (1 - hand.x - 0.5) * 10;  // Map to scene width
  const y = (0.5 - hand.y) * 8;        // Map to scene height
  const z = 0;                          // Fixed Z plane

  return { x, y, z };
}

function getPinchPosition(landmarks) {
  // Midpoint between thumb and index
  const thumb = landmarks[4];
  const index = landmarks[8];

  const midX = (thumb.x + index.x) / 2;
  const midY = (thumb.y + index.y) / 2;

  // Mirror X
  const x = (1 - midX - 0.5) * 10;
  const y = (0.5 - midY) * 8;

  return { x, y, z: 0 };
}
```

### Step 5: Process Hand Frame

```javascript
let lastProcessTime = 0;
const PROCESS_INTERVAL = 33; // ~30fps for hand tracking

function processHandFrame() {
  if (!handLandmarker || !videoElement) return;

  const now = performance.now();
  if (now - lastProcessTime < PROCESS_INTERVAL) return;
  lastProcessTime = now;

  const results = handLandmarker.detectForVideo(videoElement, now);

  if (results.landmarks.length > 0) {
    const landmarks = results.landmarks[0];

    // Update hand position
    lastHandPosition = mapHandToWorld(landmarks);

    // Detect gestures and trigger state transitions
    const openHand = detectOpenHand(landmarks);
    const pinching = detectPinch(landmarks);
    const fist = detectFist(landmarks);

    // Track hand movement for cloud rotation
    const { deltaX, deltaY } = trackHandMovement(landmarks);
    if (currentState === AppState.CLOUD) {
      applyCloudRotation(deltaX, deltaY);
    }

    // State machine transitions
    if (currentState === AppState.TREE && openHand) {
      transitionToCloud();
    }

    if (currentState === AppState.CLOUD && fist) {
      transitionToTree();
    }

    // Pinch detection for photo
    if (currentState === AppState.CLOUD && pinching && !wasPinching) {
      const pinchPos = getPinchPosition(landmarks);
      showPhotoAtPosition(pinchPos.x, pinchPos.y, pinchPos.z);
    }

    if (wasPinching && !pinching) {
      hidePhoto();
    }

    wasPinching = pinching;
  }
}
```

### Step 6: Integrate into Animation Loop

```javascript
function animate() {
  requestAnimationFrame(animate);

  const currentTime = performance.now();
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  // Process hand tracking
  processHandFrame();

  // Update physics
  updateParticlePhysics(deltaTime);

  // Render
  composer.render();
}

// Initialize on load
initHandTracking().then(success => {
  if (!success) {
    console.log('Using mouse fallback');
  }
  animate();
});
```

---

## Todo List

- [ ] Add MediaPipe script to HTML
- [ ] Implement initHandTracking() with camera request
- [ ] Create gesture detection functions (open, pinch, fist)
- [ ] Implement hand movement tracking (trackHandMovement)
- [ ] Implement cloud rotation (applyCloudRotation)
- [ ] Implement hand-to-world coordinate mapping
- [ ] Create processHandFrame() for continuous tracking
- [ ] Connect gestures to state machine transitions
- [ ] Connect hand movement to cloud rotation
- [ ] Show webcam preview with landmarks
- [ ] Test gesture recognition accuracy
- [ ] Handle camera permission denied gracefully

---

## Success Criteria

- [ ] Camera permission requested on load
- [ ] Hand landmarks detected in webcam preview
- [ ] Open hand triggers Tree → Cloud transition
- [ ] Fist triggers Cloud → Tree transition
- [ ] Pinch detected with position tracking
- [ ] Hand movement left/right rotates cloud correspondingly
- [ ] Cloud rotation smooth and responsive to hand speed
- [ ] <100ms gesture response time
- [ ] Graceful fallback message if camera unavailable

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Camera permission denied | Show message, enable mouse fallback |
| MediaPipe model load fails | Retry with timeout, fallback to mouse |
| Gesture misdetection | Add confidence threshold, debouncing |
| Performance impact | Throttle to 30fps hand detection |

---

## Security Considerations

- Camera access requires HTTPS in production
- MediaPipe model loaded from Google CDN (trusted)
- No camera data stored or transmitted

---

## Next Steps

After completion, proceed to [Phase 05: Photo Popup System](phase-05-photo-popup-system.md)
