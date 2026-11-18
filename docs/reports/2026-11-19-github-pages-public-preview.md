# Ryze Challenge · public GitHub Pages preview
Date: 2026-11-19

## Public URL
https://looksawful.github.io/ryze-challenge-pages/

## Repositories and privacy
- Canonical **source of truth**: private `looksawful/ryze-challenge`, `dev` branch.
- Source commit incorporating the compact gray Footer and Legal cookies: `d5101b2`.
- Public **compiled artifacts only**: `looksawful/ryze-challenge-pages`, `main` branch, initial deployment `cfa5a9b6a8c9acbb9d28030c50209c2dacf6243b`.
- The original project repository remains PRIVATE. No repository visibility changes, branch deletions, Pages exposure of source code, or new product design were made.
- The deploy-only public repository contains `out/` static HTML, browser JS/CSS, images, videos, web fonts, `.nojekyll`, `robots.txt` (disallow crawling), and a short README. It does not contain GitHub source history, environment files, source TypeScript, node_modules, or worktree notes.
- Access to the static website is necessarily public. The browser-delivered compiled JS/CSS and assets are accessible as with any public website. This is not a confidentiality mechanism for deployed assets.

## Why a separate public repository?
Direct GitHub Pages creation for the private source repository returned GitHub HTTP 422: `Your current plan does not support GitHub Pages for this repository.` A public **build-only** repository permits GitHub Pages on the current plan without making the source repository public.

## Build and deployment
1. Next.js static export: `NEXT_PUBLIC_BASE_PATH=/ryze-challenge-pages npm run build -- --webpack`.
2. `out/` copied into a separate public deployment repository on Titan, currently `F:\Temp\ryze-pages-publish`.
3. `.nojekyll` preserves Next's `_next/` asset paths. `robots.txt` and page meta specify noindex.
4. Pushed public repo `main` and enabled Pages from `main` repository root.
5. GitHub Pages API: status `built`, HTTPS enforced; build record `1382398174`.
6. Verified the public page, Next CSS, iframe motion HTML, and navigation image independently return HTTP 200.
7. **Public HTTPS URL browser smoke: 12/12 PASS**, covering responsive viewports (320–1920 px), forms/validation and GSAP chat typing, Solutions/Pricing, mobile dialog/focus, gray compact Footer/Legal Cookie settings, reduced-motion and the 118-piece intro animation.
8. The temporary Cloudflare quick tunnel and its snapshot HTTP server were shut down after GitHub Pages became available.

## Future updates
**The public deployment is a snapshot, not an automatic mirror of `dev`.** New work in `looksawful/ryze-challenge` does NOT appear on Pages until rebuilt and republished. Never claim otherwise.

For a future publication:
1. Reconcile and test the latest private `dev`, preserving parallel local work.
2. Export with `NEXT_PUBLIC_BASE_PATH=/ryze-challenge-pages`.
3. Sync only generated static `out/` files into the public deployment repo, removing obsolete generated assets and retaining its `.git`, `.nojekyll`, `robots.txt`, README.
4. Scan the export for secrets, local paths/IPs and source maps before publication.
5. Run browser smoke against the actual public URL; commit and push only to build repository `main`; verify GitHub Pages built status and HTTP 200 assets.
6. Avoid exposing other private sources, screenshots or project docs.

## Remaining owner decisions
- Publication on a custom brand domain, if desired, needs separate domain/DNS configuration.
- Public Pages deployment uses GitHub's static hosting, not a server-side Next.js runtime.
- The original private project can keep its independent Git branch and release policy; Pages updates should only happen after explicit publish/review intent.
