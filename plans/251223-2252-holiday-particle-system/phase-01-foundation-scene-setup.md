# Phase 01: Foundation & Scene Setup

## Context

- **Plan:** [plan.md](plan.md)
- **Research:** [Three.js Particles](research/researcher-threejs-particles.md)
- **Next Phase:** [Phase 02](phase-02-particle-system-tree-shape.md)

---

## Overview

| Field | Value |
|-------|-------|
| Priority | P0 - Critical |
| Status | ⬜ Pending |
| Est. Time | 1.5h |
| Review Status | Not Started |

Setup HTML/CSS structure, Three.js scene with camera/renderer, and bloom post-processing.

---

## Key Insights

- Use ES modules importmap for clean Three.js loading
- EffectComposer required for bloom (UnrealBloomPass)
- Fullscreen canvas with black background (#000000)
- Responsive resize handling critical for all devices

---

## Requirements

### Functional
- Fullscreen canvas covering viewport
- Black background scene
- Perspective camera with FOV 75°
- Bloom post-processing enabled
- Window resize handling

### Non-Functional
- 60fps render loop
- No visible seams or borders
- Works on Chrome, Firefox, Safari

---

## Architecture

```
index.html
├── <head>
│   ├── Meta tags (viewport, charset)
│   ├── Inline CSS (fullscreen, no scroll)
│   └── Three.js importmap
├── <body>
│   ├── Canvas container
│   └── Webcam preview (hidden initially)
└── <script type="module">
    ├── Scene setup
    ├── Camera setup
    ├── Renderer setup
    ├── EffectComposer + BloomPass
    └── Animation loop
```

---

## Related Code Files

| Action | Path | Description |
|--------|------|-------------|
| CREATE | `/index.html` | Main application file |
| CREATE | `/media/` | Photo assets folder (empty initially) |

---

## Implementation Steps

### Step 1: Create HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Holiday Particle Tree</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #000;
    }
    canvas { display: block; }
    #webcam-preview {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 200px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 8px;
      z-index: 100;
      display: none;
    }
  </style>
</head>
<body>
  <video id="webcam-preview" autoplay playsinline muted></video>
  <script type="importmap">
  {
    "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/"
    }
  }
  </script>
  <script type="module">
    // Application code here
  </script>
</body>
</html>
```

### Step 2: Three.js Scene Setup

```javascript
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);
```

### Step 3: Bloom Post-Processing

```javascript
// Effect Composer
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Bloom Pass
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,    // strength
  0.4,    // radius
  0.85    // threshold
);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());
```

### Step 4: Resize Handler

```javascript
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
```

### Step 5: Animation Loop

```javascript
function animate() {
  requestAnimationFrame(animate);
  composer.render();
}
animate();
```

---

## Todo List

- [ ] Create index.html with HTML structure
- [ ] Add CSS for fullscreen canvas
- [ ] Setup Three.js importmap
- [ ] Initialize Scene, Camera, Renderer
- [ ] Configure EffectComposer with UnrealBloomPass
- [ ] Implement resize handler
- [ ] Start animation loop
- [ ] Create /media/ folder
- [ ] Test on Chrome, Firefox, Safari

---

## Success Criteria

- [ ] Black fullscreen canvas renders
- [ ] No console errors
- [ ] Bloom effect visible (add test cube temporarily)
- [ ] Resize maintains aspect ratio
- [ ] 60fps in performance monitor

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Three.js CDN fails | Use unpkg as fallback |
| Bloom too bright | Adjust threshold to 0.9 |
| Mobile pixel ratio issues | Cap at 2x with `Math.min()` |

---

## Security Considerations

- All assets loaded from trusted CDNs (jsdelivr)
- No user input processed yet
- No external API calls

---

## Next Steps

After completion, proceed to [Phase 02: Particle System & Tree Shape](phase-02-particle-system-tree-shape.md)
