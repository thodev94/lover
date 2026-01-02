# Phase 06: Polish & Fallbacks

## Context

- **Plan:** [plan.md](plan.md)
- **Brainstorm:** [Brainstorm Report](../reports/brainstorm-251223-holiday-particle-system.md)
- **Previous:** [Phase 05](phase-05-photo-popup-system.md)

---

## Overview

| Field | Value |
|-------|-------|
| Priority | P1 - Important |
| Status | ⬜ Pending |
| Est. Time | 2h |
| Review Status | Not Started |

Add mouse/touch fallbacks, mobile responsiveness, loading states, and final polish.

---

## Key Insights

- Mouse click as fallback for pinch gesture
- Touch events for mobile devices
- Keyboard shortcuts for testing (spacebar = explosion, escape = return)
- Loading indicator while MediaPipe initializes
- Error handling for all failure modes

---

## Requirements

### Functional
- Mouse click triggers photo popup at cursor position
- Touch tap triggers photo popup on mobile
- Keyboard shortcuts for state transitions
- Loading indicator during initialization
- Error messages for camera/WebGL failures

### Non-Functional
- Responsive on all screen sizes
- Works without camera (mouse-only mode)
- Graceful degradation on unsupported browsers

---

## Architecture

```
Fallback System
├── Mouse Handler
│   ├── mousemove → track position
│   ├── click → show photo
│   └── click (on photo) → hide photo
├── Touch Handler
│   ├── touchmove → track position
│   └── touchstart → show/hide photo
├── Keyboard Handler
│   ├── Space → toggle cloud/tree
│   └── Escape → return to tree
└── UI Overlays
    ├── Loading spinner
    ├── Error messages
    └── Instructions hint
```

---

## Related Code Files

| Action | Path | Description |
|--------|------|-------------|
| MODIFY | `/index.html` | Add fallbacks and polish |

---

## Implementation Steps

### Step 1: Mouse Interaction

```javascript
// Mouse state
let mousePosition = { x: 0, y: 0 };
let isMouseDown = false;

function initMouseHandler() {
  const canvas = renderer.domElement;

  canvas.addEventListener('mousemove', (e) => {
    // Map mouse to world coordinates
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    mousePosition.x = x * 5;  // Scale to scene
    mousePosition.y = y * 4;
  });

  canvas.addEventListener('click', (e) => {
    if (currentState === AppState.TREE) {
      transitionToCloud();
    } else if (currentState === AppState.CLOUD) {
      if (!isPhotoVisible) {
        showPhotoAtPosition(mousePosition.x, mousePosition.y, 0);
      } else {
        hidePhoto();
      }
    } else if (currentState === AppState.PHOTO) {
      hidePhoto();
    }
  });

  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (currentState !== AppState.TREE) {
      transitionToTree();
    }
  });
}
```

### Step 2: Touch Interaction

```javascript
function initTouchHandler() {
  const canvas = renderer.domElement;

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();

    const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

    mousePosition.x = x * 5;
    mousePosition.y = y * 4;

    // Same logic as click
    if (currentState === AppState.TREE) {
      transitionToCloud();
    } else if (currentState === AppState.CLOUD && !isPhotoVisible) {
      showPhotoAtPosition(mousePosition.x, mousePosition.y, 0);
    } else {
      hidePhoto();
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();

    const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

    mousePosition.x = x * 5;
    mousePosition.y = y * 4;
  }, { passive: true });
}
```

### Step 3: Keyboard Shortcuts

```javascript
function initKeyboardHandler() {
  document.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        if (currentState === AppState.TREE) {
          transitionToCloud();
        } else {
          transitionToTree();
        }
        break;

      case 'Escape':
        if (isPhotoVisible) {
          hidePhoto();
        } else {
          transitionToTree();
        }
        break;

      case 'KeyP':
        // Debug: show photo at center
        if (currentState === AppState.CLOUD) {
          showPhotoAtPosition(0, 0, 0);
        }
        break;
    }
  });
}
```

### Step 4: Loading UI

```html
<!-- Add to body -->
<div id="loading-overlay">
  <div class="spinner"></div>
  <p>Loading...</p>
</div>

<div id="instructions">
  <p>Hand gestures: Open hand to interact, Pinch to view photos, Fist to return</p>
  <p>Mouse: Click to interact, Right-click to return</p>
</div>

<style>
#loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: opacity 0.5s;
}

#loading-overlay.hidden {
  opacity: 0;
  pointer-events: none;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #333;
  border-top-color: #d4af37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

#instructions {
  position: fixed;
  bottom: 20px;
  left: 20px;
  color: rgba(255,255,255,0.5);
  font-family: sans-serif;
  font-size: 12px;
  z-index: 50;
}

#instructions p {
  margin: 4px 0;
}
</style>
```

### Step 5: Error Handling

```javascript
function showError(message) {
  const overlay = document.getElementById('loading-overlay');
  overlay.innerHTML = `
    <p style="color: #ff6b6b; font-family: sans-serif;">${message}</p>
    <p style="color: #888; font-family: sans-serif; font-size: 14px;">
      Click anywhere to continue with mouse controls
    </p>
  `;
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  overlay.classList.add('hidden');
  setTimeout(() => overlay.remove(), 500);
}

// WebGL check
function checkWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

if (!checkWebGLSupport()) {
  showError('WebGL not supported. Please use a modern browser.');
}
```

### Step 6: Performance Monitor (Debug)

```javascript
// Optional: FPS counter for development
let frameCount = 0;
let lastFpsTime = performance.now();

function updateFPS() {
  frameCount++;
  const now = performance.now();

  if (now - lastFpsTime >= 1000) {
    console.log(`FPS: ${frameCount}`);
    frameCount = 0;
    lastFpsTime = now;
  }
}

// Add to animate loop if needed:
// updateFPS();
```

### Step 7: Initialize All Systems

```javascript
async function init() {
  // Check WebGL
  if (!checkWebGLSupport()) {
    showError('WebGL not supported');
    return;
  }

  // Setup Three.js scene (from Phase 01)
  setupScene();
  createParticleSystem();
  createPhotoFrame();
  preloadPhotos();

  // Initialize input handlers
  initMouseHandler();
  initTouchHandler();
  initKeyboardHandler();

  // Try hand tracking (optional)
  const handTrackingEnabled = await initHandTracking();

  if (!handTrackingEnabled) {
    console.log('Hand tracking unavailable, using mouse/touch');
    document.getElementById('webcam-preview').style.display = 'none';
  }

  // Hide loading
  hideLoading();

  // Start animation
  animate();
}

// Start app
init();
```

---

## Todo List

- [ ] Implement mouse click handler
- [ ] Implement touch handlers for mobile
- [ ] Add keyboard shortcuts (space, escape)
- [ ] Create loading overlay UI
- [ ] Add error handling for WebGL/camera
- [ ] Add instructions hint overlay
- [ ] Implement FPS monitor (debug)
- [ ] Create unified init() function
- [ ] Test on mobile devices
- [ ] Test mouse-only mode (no camera)
- [ ] Verify responsive behavior

---

## Success Criteria

- [ ] Mouse click shows photo in cloud state
- [ ] Right-click returns to tree state
- [ ] Touch works on mobile
- [ ] Spacebar toggles tree/cloud
- [ ] Escape returns to tree/hides photo
- [ ] Loading indicator shows during init
- [ ] Error message if WebGL unavailable
- [ ] Works without camera permission

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Touch conflicts with scroll | Use touch-action: none CSS |
| Mobile performance poor | Reduce particle count on mobile |
| Instructions clutter UI | Auto-hide after 5 seconds |
| Right-click context menu | preventDefault on contextmenu |

---

## Security Considerations

- No sensitive data processed
- All inputs validated (coordinates bounded)
- No external API calls

---

## Final Checklist

- [ ] All phases completed and tested
- [ ] 60fps on target devices
- [ ] Works on Chrome, Firefox, Safari
- [ ] Mobile fallback functional
- [ ] No console errors
- [ ] Loading states complete
- [ ] Error handling in place

---

## Deployment Notes

1. Create `/media/` folder with sample photos
2. Test locally with `npx serve .` or `python -m http.server`
3. Deploy to Vercel/Netlify (drag and drop)
4. Ensure HTTPS for camera access in production
