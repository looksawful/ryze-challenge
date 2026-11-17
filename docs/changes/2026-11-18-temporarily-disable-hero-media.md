# Temporary disable of moving Ryze Hero media (2026-11-18)

- Scene: public/ryze-canvas/ only; standalone Blender and motionpath previews unchanged.
- Switch: public/ryze-canvas/src/orbit.js -> SHOW_MEDIA_CARDS = false. Set to true to restore.
- The main.js scene skips creating moving cards, image textures and video textures while disabled.
- The logo/circle animation continues, and intro completion no longer waits for hidden media cards.
- All 12 original media entries and files remain intact. No assets removed.
- Focused tests: node --test scripts/hero-media-visibility.test.mjs scripts/hero-motion-media.test.mjs -> 2 passed.
- npm run build -> passed.
- Chrome/Titan private preview: WebGL status, 0 card objects, 0 video textures, orbitFinished=true, introEventSent=true; no JS errors.
- Unrelated uncommitted mascot edits and QA screenshots left untouched.
