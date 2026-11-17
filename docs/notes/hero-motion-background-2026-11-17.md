# Ryze Hero: full-viewport motion canvas

Date: 2026-11-17
Source: D:\inwork\ryze-motionpath-3d-component (local-only).
Destination: public/ryze-canvas/ in current main workspace.

- Full-viewport animated canvas is behind Hero copy, action, Rizzie, and navigation; it does not affect hit targets.
- Motion stays in a separate visual layer via a local iframe. No external CDN is required. Three.js and GSAP are copied as vendored static assets, and six locally curated card images/videos are included.
- The renderer clears with alpha 0 so the parent Hero background remains visible.
- iframe mounts only on the client, skips no-JS and reduced-motion cases.
- Hero's existing constrained content width and responsive layout are unchanged.
- No public deployment. Review browser composition at desktop/phone/landscape before approving design.

## QA, 2026-11-17

- Next.js production build: PASS. Next type generation and TypeScript check: PASS.
- Static-export asset URLs returned HTTP 200: index, scene JS, Three.js, and an MP4 sample.
- Chrome visual capture at 1440x900, 390x844, 874x402: PASS for full-screen layer size, WebGL status, 118 original fragments, and three video textures; reduced-motion has no iframe.
- Screenshots: docs/notes/hero-motion-desktop.png, hero-motion-mobile.png, hero-motion-landscape.png.
- Design observation: bright pink logo fragments temporarily overlap and visually compete with the Hero headline and description. No redesign of user-approved Hero composition was made.
- Static export preview currently hosted on Titan Tailscale port 8793; not deployed publicly.

## Проверка непосредственно на Титане (2026-11-17)

- Tailscale-сервер 100.110.158.49:8793 продолжает отвечать HTTP 200.
- Opera ранее была открыта лишь на основном экране; второе окно с превью теперь размещено на дополнительном мониторе.
- Скриншоты реальной Opera на Титане: titan-live-2.png, titan-live-5.png, titan-live-9.png. На 2-й секунде видны розовые фрагменты, на 5-й карточки с реальными медиа, на 9-й круг.
- Проверка Chrome за 20 секунд показала два цикла WebGL, 118 фрагментов и 3 видео; ошибок JS нет.
- Снимок двух мониторов: titan-both-displays-small.jpg.
- Код анимации при этой диагностике не менялся.


## Six more photo cards (2026-11-17)

- Kept original cards 01-06 intact (3 still photos + 3 MP4 videos).
- Added 07 fashion shopping bag, 08 studio jewelry portrait, 09 leather fashion with laptop, 10 black glossy product advertising, 11 delivery/grocery editorial, 12 warm marketplace still life.
- All six selected from D:\inwork\RYZE-MEDIA or its ryze_commerce_media_2026-11-17 subfolder, compressed to WebP without adding any source screenshots of Pinterest UI.
- Synchronized src/media.js, src/orbit.js and card images in the live Hero static assets and the standalone ryze-motionpath-3d-component.
- 12 cards total: 9 images + 3 MP4 videos; path, perspective and per-card timing unchanged.
- Focused regression: scripts/hero-motion-media.test.mjs. Red 6 vs 12, green 12 vs 12.
- Next production build PASSED; browser validation at 1440x900: 12 cards present, 9 images and 3 videos, cards 8-11 mid-flight, no page errors or HTTP failures.
- Verification screenshot: docs/notes/hero-12-media-chrome.png.
- Private/Tailscale preview only; no public deployment.
