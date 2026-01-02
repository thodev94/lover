# Phase 03: Particle Physics & Animations

## Context

- **Plan:** [plan.md](plan.md)
- **Research:** [Three.js Particles](research/researcher-threejs-particles.md)
- **Previous:** [Phase 02](phase-02-particle-system-tree-shape.md)
- **Next:** [Phase 04](phase-04-hand-tracking-integration.md)

---

## Overview

| Field | Value |
|-------|-------|
| Priority | P0 - Critical |
| Status | ⬜ Pending |
| Est. Time | 2h |
| Review Status | Not Started |

Implement state machine (TREE ↔ CLOUD), explosion animation, and spring-based homecoming physics.

---

## Key Insights

- State machine: TREE (idle) → CLOUD (interactive) → PHOTO (viewing)
- Explosion: Apply radial velocity from center outward
- Homecoming: Spring damping formula for natural return
- CPU-based updates acceptable for 5000 particles; GPU shader if needed later

---

## Requirements

### Functional
- State machine with TREE, CLOUD, PHOTO states
- Explosion animation: particles fly outward from center
- Homecoming: particles return to original positions with spring physics
- Smooth transitions (<1s for state changes)

### Non-Functional
- Maintain 60fps during animations
- Natural, organic particle movement
- No jitter or teleporting

---

## Architecture

```
State Machine
├── TREE (idle)
│   └── Particles at home positions, slight ambient drift
├── CLOUD (interactive)
│   └── Particles scattered, respond to hand input
└── PHOTO (viewing)
    └── Particles frozen around photo frame

Physics Engine
├── updateParticlePhysics(deltaTime)
│   ├── Apply forces (explosion, spring return)
│   ├── Update velocities
│   ├── Update positions
│   └── Mark geometry for update
└── Spring Formula
    └── velocity += (home - position) * stiffness
    └── velocity *= damping
    └── position += velocity * deltaTime
```

---

## Related Code Files

| Action | Path | Description |
|--------|------|-------------|
| MODIFY | `/index.html` | Add physics and state machine |

---

## Implementation Steps

### Step 1: Define State Machine

```javascript
// Application state
const AppState = {
  TREE: 'tree',
  CLOUD: 'cloud',
  PHOTO: 'photo'
};

let currentState = AppState.TREE;
let transitionProgress = 0;

// Physics constants
const PHYSICS = {
  explosionForce: 0.15,
  springStiffness: 0.03,
  damping: 0.92,
  ambientDrift: 0.001
};
```

### Step 2: State Transition Functions

```javascript
function transitionToCloud() {
  if (currentState === AppState.TREE) {
    currentState = AppState.CLOUD;
    applyExplosion();
  }
}

function transitionToTree() {
  if (currentState === AppState.CLOUD) {
    currentState = AppState.TREE;
    // Homecoming handled in physics update
  }
}

function applyExplosion() {
  const positions = particles.geometry.attributes.position.array;
  const velocities = particles.geometry.attributes.velocity.array;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;

    // Direction from center
    const x = positions[i3];
    const y = positions[i3 + 1];
    const z = positions[i3 + 2];

    const length = Math.sqrt(x * x + y * y + z * z) || 1;
    const force = PHYSICS.explosionForce * (0.5 + Math.random() * 0.5);

    // Apply radial velocity
    velocities[i3] = (x / length) * force;
    velocities[i3 + 1] = (y / length) * force;
    velocities[i3 + 2] = (z / length) * force;
  }

  particles.geometry.attributes.velocity.needsUpdate = true;
}
```

### Step 3: Physics Update Loop

```javascript
function updateParticlePhysics(deltaTime) {
  const positions = particles.geometry.attributes.position.array;
  const homePositions = particles.geometry.attributes.homePosition.array;
  const velocities = particles.geometry.attributes.velocity.array;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;

    if (currentState === AppState.TREE) {
      // Spring force toward home position
      const dx = homePositions[i3] - positions[i3];
      const dy = homePositions[i3 + 1] - positions[i3 + 1];
      const dz = homePositions[i3 + 2] - positions[i3 + 2];

      velocities[i3] += dx * PHYSICS.springStiffness;
      velocities[i3 + 1] += dy * PHYSICS.springStiffness;
      velocities[i3 + 2] += dz * PHYSICS.springStiffness;

      // Ambient drift for subtle motion
      velocities[i3] += (Math.random() - 0.5) * PHYSICS.ambientDrift;
      velocities[i3 + 1] += (Math.random() - 0.5) * PHYSICS.ambientDrift;
      velocities[i3 + 2] += (Math.random() - 0.5) * PHYSICS.ambientDrift;
    }

    if (currentState === AppState.CLOUD) {
      // Weak spring to keep particles from flying too far
      const dx = homePositions[i3] - positions[i3];
      const dy = homePositions[i3 + 1] - positions[i3 + 1];
      const dz = homePositions[i3 + 2] - positions[i3 + 2];

      velocities[i3] += dx * PHYSICS.springStiffness * 0.1;
      velocities[i3 + 1] += dy * PHYSICS.springStiffness * 0.1;
      velocities[i3 + 2] += dz * PHYSICS.springStiffness * 0.1;
    }

    // Apply damping
    velocities[i3] *= PHYSICS.damping;
    velocities[i3 + 1] *= PHYSICS.damping;
    velocities[i3 + 2] *= PHYSICS.damping;

    // Update positions
    positions[i3] += velocities[i3];
    positions[i3 + 1] += velocities[i3 + 1];
    positions[i3 + 2] += velocities[i3 + 2];
  }

  // Mark for GPU update
  particles.geometry.attributes.position.needsUpdate = true;
  particles.geometry.attributes.velocity.needsUpdate = true;
}
```

### Step 4: Integrate into Animation Loop

```javascript
let lastTime = performance.now();

function animate() {
  requestAnimationFrame(animate);

  const currentTime = performance.now();
  const deltaTime = (currentTime - lastTime) / 1000; // seconds
  lastTime = currentTime;

  // Update physics
  updateParticlePhysics(deltaTime);

  // Render
  composer.render();
}
```

### Step 5: Scatter Effect for Photo State

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

    if (dist < radius) {
      // Push particles away from center
      const force = (radius - dist) / radius * 0.1;
      velocities[i3] += (dx / dist) * force;
      velocities[i3 + 1] += (dy / dist) * force;
      velocities[i3 + 2] += (dz / dist) * force;
    }
  }

  particles.geometry.attributes.velocity.needsUpdate = true;
}
```

---

## Todo List

- [ ] Define state machine constants
- [ ] Implement state transition functions
- [ ] Create explosion animation (radial velocity)
- [ ] Implement spring-based homecoming physics
- [ ] Add ambient drift for TREE state
- [ ] Implement particle scatter for PHOTO state
- [ ] Integrate physics into animation loop
- [ ] Test state transitions (manual trigger for now)
- [ ] Tune physics parameters for natural feel

---

## Success Criteria

- [ ] Tree → Cloud transition with visible explosion
- [ ] Cloud → Tree transition with smooth homecoming
- [ ] Particles settle naturally (no oscillation/jitter)
- [ ] Scatter effect clears area for photo
- [ ] 60fps maintained during transitions

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Physics too slow | Reduce stiffness, increase damping |
| Particles fly off screen | Add boundary checks or stronger return spring |
| Jittery movement | Increase damping factor |
| Performance drop | Switch to shader-based physics |

---

## Security Considerations

- No external input processed yet
- Pure mathematical computation

---

## Next Steps

After completion, proceed to [Phase 04: Hand Tracking Integration](phase-04-hand-tracking-integration.md)
