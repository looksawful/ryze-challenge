# Rizzie drag + speech bubbles · 17.11.2026

- Private repo: `looksawful/ryze-challenge`, only existing `main`; worktree `D:\inwork\ryze-challenge`.
- Removed static/reduced-motion **toast** fallback. Messages now use the same speech bubble in all JS-capable modes.
- Pointer drag works for desktop mouse/fine pointer; touch does not start dragging, preserving scrolling and tap-to-activate.
- Positioned bubble beside Rizzie, fitted inside viewport with avoidance of Hero content; position follows drag, resize, and scroll.
- Detached Rizzie clamped to viewport on resize; message placement recalculated on each new message.
- Updated existing components/model/CSS, no new packages, branches, or CI.
- QA: `npm run typecheck` PASS; `npm run build` PASS (completed with exit 0); `git diff --check` PASS. Visual Safari/device acceptance pending.
- Remote access separation: Titan uses the **Primary RDK** connection; Mac/Lilith uses the **separate Remote Desktop Commander** connection. Do not assume a single login covers both devices.
