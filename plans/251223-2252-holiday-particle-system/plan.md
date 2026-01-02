# Holiday Particle System - Implementation Plan

**Created:** 2025-12-23
**Status:** Ready for Implementation
**Complexity:** High
**Est. Dev Time:** 8-12 hours

---

## Overview

Build interactive 3D particle Christmas tree with hand gesture control, state transitions, and photo popup system.

## Tech Stack

| Component | Choice | CDN |
|-----------|--------|-----|
| 3D Engine | Three.js r158 | jsdelivr |
| Hand Tracking | MediaPipe Tasks Vision | jsdelivr |
| Post-processing | EffectComposer + UnrealBloomPass | Three.js addons |
| Architecture | Single HTML file | N/A |

## Research Reports

- [Three.js Particles Research](research/researcher-threejs-particles.md)
- [MediaPipe Hands Research](research/researcher-mediapipe-hands.md)
- [Brainstorm Report](../reports/brainstorm-251223-holiday-particle-system.md)

---

## Implementation Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Foundation & Scene Setup | ⬜ Pending | 0% |
| 02 | Particle System & Tree Shape | ⬜ Pending | 0% |
| 03 | Particle Physics & Animations | ⬜ Pending | 0% |
| 04 | Hand Tracking Integration | ⬜ Pending | 0% |
| 05 | Photo Popup System | ⬜ Pending | 0% |
| 06 | Polish & Fallbacks | ⬜ Pending | 0% |

---

## Phase Files

1. [Phase 01: Foundation & Scene Setup](phase-01-foundation-scene-setup.md)
2. [Phase 02: Particle System & Tree Shape](phase-02-particle-system-tree-shape.md)
3. [Phase 03: Particle Physics & Animations](phase-03-particle-physics-animations.md)
4. [Phase 04: Hand Tracking Integration](phase-04-hand-tracking-integration.md)
5. [Phase 05: Photo Popup System](phase-05-photo-popup-system.md)
6. [Phase 06: Polish & Fallbacks](phase-06-polish-fallbacks.md)

---

## Key Dependencies

```
Phase 01 ──► Phase 02 ──► Phase 03 ──► Phase 04 ──► Phase 05 ──► Phase 06
(Scene)     (Particles)   (Physics)   (Gestures)   (Photos)    (Polish)
```

All phases are sequential; each depends on previous.

---

## File Structure (Final)

```
/merychristmas
├── index.html          # Single-file app (all-in-one)
├── media/              # Photo assets
│   ├── photo1.jpg
│   └── ...
└── plans/
    └── 251223-2252-holiday-particle-system/
        ├── plan.md
        ├── phase-01-foundation-scene-setup.md
        ├── phase-02-particle-system-tree-shape.md
        ├── phase-03-particle-physics-animations.md
        ├── phase-04-hand-tracking-integration.md
        ├── phase-05-photo-popup-system.md
        ├── phase-06-polish-fallbacks.md
        └── research/
            ├── researcher-threejs-particles.md
            └── researcher-mediapipe-hands.md
```

---

## Success Criteria

- [ ] 60fps on mid-range laptop
- [ ] Tree ↔ Cloud transition with smooth animation
- [ ] Gesture recognition (open hand, pinch, fist, hand movement)
- [ ] Cloud rotation via hand movement (left/right)
- [ ] Photo popup with 3D golden frame
- [ ] Particle scatter effect on photo show
- [ ] Mouse/touch fallback working
- [ ] Works on Chrome, Firefox, Safari
