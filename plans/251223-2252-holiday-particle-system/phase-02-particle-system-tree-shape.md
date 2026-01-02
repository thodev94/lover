# Phase 02: Particle System & Tree Shape

## Context

- **Plan:** [plan.md](plan.md)
- **Research:** [Three.js Particles](research/researcher-threejs-particles.md)
- **Previous:** [Phase 01](phase-01-foundation-scene-setup.md)
- **Next:** [Phase 03](phase-03-particle-physics-animations.md)

---

## Overview

| Field | Value |
|-------|-------|
| Priority | P0 - Critical |
| Status | ⬜ Pending |
| Est. Time | 1.5h |
| Review Status | Not Started |

Create 5000 particle BufferGeometry in Christmas tree (cone) shape with multi-color distribution.

---

## Key Insights

- BufferGeometry with custom attributes: position, homePosition, velocity, color
- Cone distribution algorithm: radius decreases with height
- Colors: gold (60%), white (25%), green (15%) for Christmas feel
- PointsMaterial with size attenuation for depth perception

---

## Requirements

### Functional
- 5000 particles forming cone/tree shape
- Each particle stores home position for return animation
- Multi-color particles (gold, white, green)
- Particle size varies for visual interest

### Non-Functional
- BufferGeometry for GPU efficiency
- No frame drops on initial render
- Tree centered in camera view

---

## Architecture

```
ParticleSystem
├── BufferGeometry
│   ├── position (Float32Array, 5000 * 3)
│   ├── homePosition (Float32Array, 5000 * 3)
│   ├── velocity (Float32Array, 5000 * 3)
│   ├── color (Float32Array, 5000 * 3)
│   └── scale (Float32Array, 5000)
├── PointsMaterial
│   ├── vertexColors: true
│   ├── size: 0.05
│   ├── sizeAttenuation: true
│   └── transparent: true
└── Points (mesh)
```

---

## Related Code Files

| Action | Path | Description |
|--------|------|-------------|
| MODIFY | `/index.html` | Add particle system code |

---

## Implementation Steps

### Step 1: Define Constants

```javascript
// Particle configuration
const PARTICLE_COUNT = 5000;
const TREE_HEIGHT = 4;
const TREE_MAX_RADIUS = 1.5;

// Colors (Christmas palette)
const COLORS = {
  gold: new THREE.Color(0xffd700),
  white: new THREE.Color(0xffffff),
  green: new THREE.Color(0x228b22)
};
```

### Step 2: Create BufferGeometry with Attributes

```javascript
function createParticleSystem() {
  const geometry = new THREE.BufferGeometry();

  // Typed arrays for attributes
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const homePositions = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const scales = new Float32Array(PARTICLE_COUNT);

  // Populate arrays
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;

    // Cone distribution (tree shape)
    const t = Math.random();  // 0=bottom, 1=top
    const radius = (1 - t) * TREE_MAX_RADIUS * Math.random();
    const angle = Math.random() * Math.PI * 2;
    const height = t * TREE_HEIGHT - TREE_HEIGHT / 2;

    // Position
    const x = Math.cos(angle) * radius;
    const y = height;
    const z = Math.sin(angle) * radius;

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    // Home position (same as initial)
    homePositions[i3] = x;
    homePositions[i3 + 1] = y;
    homePositions[i3 + 2] = z;

    // Velocity (starts at 0)
    velocities[i3] = 0;
    velocities[i3 + 1] = 0;
    velocities[i3 + 2] = 0;

    // Color distribution: 60% gold, 25% white, 15% green
    const colorRand = Math.random();
    let color;
    if (colorRand < 0.6) {
      color = COLORS.gold;
    } else if (colorRand < 0.85) {
      color = COLORS.white;
    } else {
      color = COLORS.green;
    }

    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    // Random scale for variety
    scales[i] = 0.5 + Math.random() * 0.5;
  }

  // Set attributes
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('homePosition', new THREE.BufferAttribute(homePositions, 3));
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

  return geometry;
}
```

### Step 3: Create PointsMaterial

```javascript
function createParticleMaterial() {
  return new THREE.PointsMaterial({
    size: 0.08,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,  // Glow effect
    depthWrite: false  // Proper transparency
  });
}
```

### Step 4: Assemble and Add to Scene

```javascript
// Create particle system
const particleGeometry = createParticleSystem();
const particleMaterial = createParticleMaterial();
const particles = new THREE.Points(particleGeometry, particleMaterial);

scene.add(particles);

// Adjust camera to view tree
camera.position.set(0, 0, 6);
camera.lookAt(0, 0, 0);
```

### Step 5: Add Star at Top (Optional Enhancement)

```javascript
// Add brighter particle at top (star effect)
// Already included in cone distribution - top particles naturally cluster
// Could add dedicated star mesh later in polish phase
```

---

## Todo List

- [ ] Define particle constants (count, tree dimensions)
- [ ] Create BufferGeometry with typed arrays
- [ ] Implement cone distribution algorithm
- [ ] Add color distribution (gold/white/green)
- [ ] Create PointsMaterial with additive blending
- [ ] Add particles to scene
- [ ] Adjust camera position for optimal view
- [ ] Test bloom effect on particles
- [ ] Verify 60fps maintained

---

## Success Criteria

- [ ] 5000 particles visible forming tree shape
- [ ] Colors distributed (gold dominant, white accent, green sparse)
- [ ] Particles glow with bloom effect
- [ ] No frame drops (60fps stable)
- [ ] Tree centered in viewport

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Too many particles | Reduce to 3000 if <60fps |
| Colors too dim | Increase emissive or bloom strength |
| Tree shape unclear | Adjust TREE_MAX_RADIUS ratio |

---

## Security Considerations

- No user input processed
- Static geometry creation

---

## Next Steps

After completion, proceed to [Phase 03: Particle Physics & Animations](phase-03-particle-physics-animations.md)
