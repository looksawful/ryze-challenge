# ADR 0002: Static-first component and motion architecture

Status: Accepted

## Context
The first screen contains interactive navigation, a guided domain flow, consent UI and optional visual effects. The design is expected to evolve without requiring the implementation of unrelated pages.

## Decision
- Organize source by functional ownership instead of an enforced atoms/molecules/organisms file hierarchy.
- Use TypeScript/React and native CSS; CSS Modules isolate component styles while shared CSS variables supply tokens.
- First provide readable semantic content and working interactions; layer effects on top.
- GSAP owns interface timelines. WebGL/GLSL owns particle/shader effects. Three.js is introduced only with an approved 3D use case.
- Treat brand entrance particles and integration-logo particles as independent effects; share helpers only when justified by actual duplicate code.
- Lazy-load optional heavy effects, respect reduced motion and provide static fallback.
- Storybook stories import application components rather than shadow implementations.
- Source code is the current canonical implementation; design artifacts follow its agreed terminology.

## Consequences
No generic particle engine or universal animation framework is scaffolding work. Visual tokens and theme boundaries remain open design decisions.
