# Brainstorm Report: Interactive Holiday Particle System

**Date:** 2024-12-23
**Status:** Agreed
**Complexity:** High
**Est. Dev Time:** 8-12 hours

---

## 1. Problem Statement

Build an interactive web-based 3D particle system that:
- Displays Christmas tree made of glowing particles
- Allows hand gesture interaction via webcam
- Transitions between Tree ↔ Cloud states with animations
- Shows photos with golden 3D frames when particles are "pinched"
- Works on desktop (webcam) and mobile (touch fallback)

---

## 2. Core Requirements (Agreed)

| Requirement | Decision |
|-------------|----------|
| Gesture detection | Full pinch/open-hand/fist via MediaPipe |
| State machine | Tree ↔ Cloud with smooth transitions |
| Photo display | 3D golden frame in scene |
| Photo source | Predefined list in `/media/` folder |
| Particle behavior | Scatter/explode when photo shown |
| Performance target | 60fps smooth |
| Platforms | Desktop (webcam) + Mobile (touch) |
| Mouse fallback | Yes |

---

## 3. Technical Architecture

### 3.1 State Machine

```
                    ┌──────────────────────────────────────┐
                    │                                      │
                    ▼                                      │
┌─────────────┐  OPEN_HAND   ┌─────────────┐   FIST    ┌──┴──────────┐
│   TREE      │ ───────────► │   CLOUD     │ ────────► │   TREE      │
│  (idle)     │              │ (interactive)│          │  (reform)   │
└─────────────┘              └──────┬──────┘           └─────────────┘
                                    │ ▲
                       ┌────────────┘ │
                       │   HAND_MOVE  │ (continuous)
                       │   ──────────►├─────────────┐
                       │              │   CLOUD     │
                       │              │ (rotating)  │
                       │              └─────────────┘
                       │
                 PINCH │ on particle
                       ▼
                ┌─────────────┐
                │   PHOTO     │
                │  (viewing)  │
                └──────┬──────┘
                       │
                 RELEASE│ pinch
                       ▼
                ┌─────────────┐
                │   CLOUD     │
                │  (return)   │
                └─────────────┘
```

**State descriptions:**
| State | Description |
|-------|-------------|
| TREE (idle) | Particles form Christmas tree shape, gentle idle animation |
| CLOUD (interactive) | Particles scattered as cloud, can rotate/interact |
| CLOUD (rotating) | Cloud rotating based on hand movement direction |
| PHOTO (viewing) | Displaying photo in 3D golden frame |
| TREE (reform) | Particles animating back to tree formation |

### 3.2 Gesture Recognition (MediaPipe)

| Gesture | Detection Logic | Action |
|---------|-----------------|--------|
| **Open Hand** | All fingers extended, spread > threshold | Tree → Cloud |
| **Pinch** | Thumb tip ↔ Index tip distance < 30px | Select particle → Show photo |
| **Fist** | All fingers curled, no finger extended | Cloud → Tree |
| **Release** | Pinch distance > 50px (was pinching) | Hide photo |
| **Hand Move** | Palm center position delta X/Y between frames | Rotate cloud in same direction |
| **Swipe Left** | Hand moves left rapidly (deltaX < -threshold) | Rotate cloud counter-clockwise |
| **Swipe Right** | Hand moves right rapidly (deltaX > threshold) | Rotate cloud clockwise |

**Landmarks used:**
- Thumb tip: #4
- Index tip: #8
- Index MCP: #5 (for curl detection)
- All fingertips: #4, #8, #12, #16, #20
- Palm center: #0 (wrist) or #9 (middle finger MCP) - for hand movement tracking

### 3.3 Coordinate Mapping (2D → 3D)

```javascript
// Webcam coordinates (0-1, mirrored)
const handX = 1 - landmark.x;  // Mirror flip
const handY = landmark.y;

// Map to Three.js world space
const worldX = (handX - 0.5) * sceneWidth;
const worldY = (0.5 - handY) * sceneHeight;
const worldZ = 0;  // Fixed Z-plane for simplicity
```

### 3.4 Particle System Design

**Geometry:** `THREE.BufferGeometry` with position, velocity, homePosition attributes

**Particle count:** 5,000 (configurable, balance quality vs performance)

**Tree shape algorithm:**
```javascript
// Cone distribution
for (let i = 0; i < particleCount; i++) {
  const t = i / particleCount;  // 0 to 1 (bottom to top)
  const radius = (1 - t) * maxRadius;  // Wider at bottom
  const angle = Math.random() * Math.PI * 2;
  const height = t * treeHeight - treeHeight / 2;

  positions[i * 3] = Math.cos(angle) * radius * Math.random();
  positions[i * 3 + 1] = height;
  positions[i * 3 + 2] = Math.sin(angle) * radius * Math.random();
}
```

**Cloud explosion:**
```javascript
// Apply radial velocity from center
const direction = particle.position.clone().normalize();
particle.velocity.copy(direction.multiplyScalar(explosionForce));
```

**Spring return (homecoming):**
```javascript
// Each frame
const toHome = homePosition.clone().sub(position);
velocity.add(toHome.multiplyScalar(springStrength));
velocity.multiplyScalar(damping);
position.add(velocity);
```

### 3.5 Photo Popup System

**3D Frame structure:**
```
┌─────────────────────────────────────┐
│  Golden Frame (BoxGeometry mesh)    │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │     Photo Texture on Plane     ││
│  │                                 ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

**Frame material:**
```javascript
new THREE.MeshStandardMaterial({
  color: 0xd4af37,      // Gold
  metalness: 0.8,
  roughness: 0.2,
  emissive: 0xd4af37,
  emissiveIntensity: 0.3
});
```

**Animation sequence:**
1. Particle pinched → spawn photo at particle position
2. Scale from 0 → 1 with easing (0.3s)
3. Move slightly toward camera (Z + 50)
4. Nearby particles scatter outward
5. On release: reverse animation, particles return

### 3.6 Performance Optimizations

| Technique | Purpose |
|-----------|---------|
| `BufferGeometry` | Efficient memory for particles |
| Shader-based movement | Offload CPU to GPU |
| `PointsMaterial` | Single draw call for all particles |
| Throttled MediaPipe | Process every 2nd frame if needed |
| Object pooling | Reuse photo frame objects |
| `EffectComposer` selective | Apply bloom only to particles layer |

---

## 4. File Structure

```
/merychristmas
├── index.html          # Single-file app (all-in-one)
├── media/              # Photo assets
│   ├── photo1.jpg
│   ├── photo2.jpg
│   └── ...
├── prd.md              # Requirements doc
├── demo.mp4            # Reference video
└── plans/
    └── reports/
        └── brainstorm-251223-holiday-particle-system.md
```

**Single HTML rationale:** KISS principle. Easy to share, deploy, no build step.

---

## 5. Implementation Phases

### Phase 1: Foundation (2h)
- HTML/CSS fullscreen setup
- Three.js scene, camera, renderer
- Basic particle system (static tree shape)
- Bloom post-processing

### Phase 2: Particle Physics (2h)
- Position/velocity buffer attributes
- Tree ↔ Cloud explosion animation
- Spring-based homecoming effect
- Particle colors (gold, white, green)

### Phase 3: Hand Tracking (2h)
- MediaPipe Hands integration
- Gesture recognition (open/pinch/fist)
- 2D → 3D coordinate mapping
- Webcam preview overlay

### Phase 4: Photo System (2h)
- 3D photo plane with texture
- Golden frame mesh
- Scale/position animations
- Particle scatter on photo show

### Phase 5: Polish & Fallbacks (2h)
- Mouse/touch interaction fallback
- Mobile responsive adjustments
- Performance tuning
- Loading states & error handling

---

## 6. Tech Stack (Final)

| Component | Choice | CDN/Source |
|-----------|--------|------------|
| 3D Engine | Three.js r158+ | unpkg/jsdelivr |
| Hand Tracking | MediaPipe Hands | cdn.jsdelivr.net |
| Post-processing | Three.js EffectComposer | Same as Three.js |
| Animation | Native requestAnimationFrame | Built-in |
| Deployment | Vercel/Netlify (static) | Free tier |

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| MediaPipe lag on low-end | Medium | High | Throttle to 15fps, reduce particles |
| Pinch detection inaccurate | Medium | Medium | Add tolerance threshold, visual feedback |
| Mobile touch conflicts | Low | Medium | Detect touch vs mouse, separate handlers |
| Large photo files slow | Low | Low | Compress to <500KB each, lazy load |

---

## 8. Success Metrics

- [ ] 60fps on mid-range laptop (GTX 1650 / M1 equivalent)
- [ ] Gesture recognition accuracy > 90%
- [ ] Tree ↔ Cloud transition < 1s
- [ ] Photo popup response < 200ms
- [ ] Works on Chrome, Firefox, Safari
- [ ] Mobile touch fallback functional

---

## 9. Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| Gesture complexity | Full pinch detection |
| State transitions | Yes, with animations |
| Photo frame style | 3D golden frame |
| Photo source | Predefined in `/media/` |
| Particle on photo | Scatter effect |

---

## 10. Next Steps

1. Create implementation plan from this brainstorm
2. Setup project structure
3. Begin Phase 1 development
4. Iterate through phases with testing

---

**Brainstorm Status:** ✅ Complete - Ready for implementation planning
