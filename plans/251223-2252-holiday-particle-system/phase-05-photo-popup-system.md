# Phase 05: Photo Popup System

## Context

- **Plan:** [plan.md](plan.md)
- **Brainstorm:** [Brainstorm Report](../reports/brainstorm-251223-holiday-particle-system.md)
- **Previous:** [Phase 04](phase-04-hand-tracking-integration.md)
- **Next:** [Phase 06](phase-06-polish-fallbacks.md)

---

## Overview

| Field | Value |
|-------|-------|
| Priority | P0 - Critical |
| Status | ⬜ Pending |
| Est. Time | 2h |
| Review Status | Not Started |

Create 3D photo popup with golden frame, scale animation, and particle scatter effect.

---

## Key Insights

- Photo as PlaneGeometry with texture
- Golden frame as BoxGeometry edges with metallic material
- Scale animation 0→1 over 0.3s with easeOutBack
- Particles scatter outward from photo center on show
- Photo faces camera (billboarding or fixed orientation)

---

## Requirements

### Functional
- Load photos from predefined list (/media/ folder)
- Display photo at pinch position with 3D golden frame
- Scale animation on show/hide
- Particles scatter when photo appears
- Random photo selection on each pinch

### Non-Functional
- Photo loads in <200ms
- Frame material renders with metallic gold appearance
- Smooth animation at 60fps

---

## Architecture

```
PhotoPopup System
├── PhotoManager
│   ├── photoList[]
│   ├── loadedTextures{}
│   └── currentPhotoIndex
├── PhotoFrame (Three.js Group)
│   ├── PlaneGeometry (photo texture)
│   └── BoxGeometry edges (golden frame)
├── showPhoto(x, y, z)
│   ├── Position frame at coordinates
│   ├── Load random texture
│   ├── Animate scale 0→1
│   └── Scatter nearby particles
└── hidePhoto()
    ├── Animate scale 1→0
    └── Return particles to home
```

---

## Related Code Files

| Action | Path | Description |
|--------|------|-------------|
| MODIFY | `/index.html` | Add photo popup system |
| CREATE | `/media/photo1.jpg` | Sample photo |
| CREATE | `/media/photo2.jpg` | Sample photo |

---

## Implementation Steps

### Step 1: Define Photo List

```javascript
// Predefined photo list
const PHOTOS = [
  'media/photo1.jpg',
  'media/photo2.jpg',
  'media/photo3.jpg',
  'media/photo4.jpg',
  'media/photo5.jpg'
];

// Texture loader
const textureLoader = new THREE.TextureLoader();
const loadedTextures = new Map();

// Preload textures
function preloadPhotos() {
  PHOTOS.forEach(path => {
    textureLoader.load(path, texture => {
      loadedTextures.set(path, texture);
    });
  });
}
```

### Step 2: Create Photo Frame Group

```javascript
// Photo frame components
let photoFrame = null;
let photoMesh = null;
let frameMesh = null;
let isPhotoVisible = false;

function createPhotoFrame() {
  photoFrame = new THREE.Group();

  // Photo plane
  const photoGeometry = new THREE.PlaneGeometry(2, 1.5);
  const photoMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 1
  });
  photoMesh = new THREE.Mesh(photoGeometry, photoMaterial);
  photoFrame.add(photoMesh);

  // Golden frame (using EdgesGeometry for outline effect)
  const frameSize = { width: 2.2, height: 1.7, depth: 0.1 };
  const frameGeometry = new THREE.BoxGeometry(
    frameSize.width,
    frameSize.height,
    frameSize.depth
  );

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4af37,      // Gold
    metalness: 0.9,
    roughness: 0.1,
    emissive: 0xd4af37,
    emissiveIntensity: 0.2
  });

  // Create frame border (hollow box)
  const outerBox = new THREE.Mesh(frameGeometry, frameMaterial);

  // Cut out center
  const innerGeometry = new THREE.PlaneGeometry(2.05, 1.55);
  const innerMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.DoubleSide
  });
  const innerCut = new THREE.Mesh(innerGeometry, innerMaterial);
  innerCut.position.z = 0.06;

  frameMesh = new THREE.Group();
  frameMesh.add(outerBox);

  // Simple approach: just use the box as a backing
  photoMesh.position.z = 0.06;
  photoFrame.add(frameMesh);

  // Add lighting for metallic frame
  const pointLight = new THREE.PointLight(0xffffff, 0.5);
  pointLight.position.set(0, 0, 3);
  photoFrame.add(pointLight);

  // Initial state: hidden
  photoFrame.scale.set(0, 0, 0);
  photoFrame.visible = false;

  scene.add(photoFrame);
}
```

### Step 3: Show Photo Function

```javascript
function showPhotoAtPosition(x, y, z) {
  if (isPhotoVisible) return;

  currentState = AppState.PHOTO;
  isPhotoVisible = true;

  // Random photo selection
  const randomPath = PHOTOS[Math.floor(Math.random() * PHOTOS.length)];

  // Load texture (use cached if available)
  const texture = loadedTextures.get(randomPath);
  if (texture) {
    photoMesh.material.map = texture;
    photoMesh.material.needsUpdate = true;
  } else {
    textureLoader.load(randomPath, tex => {
      photoMesh.material.map = tex;
      photoMesh.material.needsUpdate = true;
      loadedTextures.set(randomPath, tex);
    });
  }

  // Position frame
  photoFrame.position.set(x, y, z + 1); // Slightly forward
  photoFrame.visible = true;

  // Scatter particles
  scatterParticlesFromPoint(x, y, z, 1.5);

  // Scale animation
  animatePhotoIn();
}

function animatePhotoIn() {
  const duration = 300; // ms
  const startTime = performance.now();

  function animate() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // EaseOutBack curve
    const scale = easeOutBack(progress);
    photoFrame.scale.set(scale, scale, scale);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
```

### Step 4: Hide Photo Function

```javascript
function hidePhoto() {
  if (!isPhotoVisible) return;

  isPhotoVisible = false;
  currentState = AppState.CLOUD;

  // Scale animation out
  animatePhotoOut();
}

function animatePhotoOut() {
  const duration = 200; // ms
  const startTime = performance.now();

  function animate() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // EaseInQuad
    const scale = 1 - progress * progress;
    photoFrame.scale.set(scale, scale, scale);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      photoFrame.visible = false;
    }
  }

  animate();
}
```

### Step 5: Enhanced Particle Scatter

```javascript
function scatterParticlesFromPoint(centerX, centerY, centerZ, radius) {
  const positions = particles.geometry.attributes.position.array;
  const velocities = particles.geometry.attributes.velocity.array;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;

    const dx = positions[i3] - centerX;
    const dy = positions[i3 + 1] - centerY;
    const dz = positions[i3 + 2] - centerZ;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (dist < radius && dist > 0.01) {
      // Push away from photo center
      const force = ((radius - dist) / radius) * 0.15;
      const nx = dx / dist;
      const ny = dy / dist;
      const nz = dz / dist;

      velocities[i3] += nx * force;
      velocities[i3 + 1] += ny * force;
      velocities[i3 + 2] += nz * force;
    }
  }

  particles.geometry.attributes.velocity.needsUpdate = true;
}
```

### Step 6: Ambient Light for Frame

```javascript
// Add to scene setup (Phase 01)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);
```

---

## Todo List

- [ ] Define photo list constant
- [ ] Create texture loader and preload function
- [ ] Build photo frame group (plane + golden frame)
- [ ] Implement showPhotoAtPosition() with random selection
- [ ] Create scale-in animation with easeOutBack
- [ ] Implement hidePhoto() with scale-out animation
- [ ] Enhance particle scatter function
- [ ] Add scene lighting for metallic frame
- [ ] Create sample photos in /media/ folder
- [ ] Test photo loading and display
- [ ] Verify particle scatter effect

---

## Success Criteria

- [ ] Photo displays at pinch position
- [ ] Golden frame visible with metallic appearance
- [ ] Scale animation smooth (0.3s in, 0.2s out)
- [ ] Particles scatter away from photo
- [ ] Random photo on each pinch
- [ ] Photo hidden on pinch release
- [ ] No visible texture loading delay

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Large photo files slow load | Compress to <500KB, preload |
| Frame not metallic looking | Adjust metalness/roughness, add envMap |
| Animation jittery | Use requestAnimationFrame, optimize easing |
| Photo aspect ratio wrong | Calculate from texture dimensions |

---

## Security Considerations

- Photos loaded from local /media/ folder
- No user-uploaded content
- Texture URLs hardcoded (no injection risk)

---

## Next Steps

After completion, proceed to [Phase 06: Polish & Fallbacks](phase-06-polish-fallbacks.md)
