# Interactive landing interface

A static-first TypeScript/React frontend with a single product-page preview, built using Next.js.

## Development

Install dependencies with `npm install`, then run `npm run dev`. Project verification scripts are listed in `package.json`.

## Storybook

- `npm run storybook` opens the local-only workbench at `http://127.0.0.1:6007/`. It fails instead of silently choosing another port if 6007 is occupied.
- `npm run build-storybook` verifies the static Storybook build; its output is ignored by Git.
- The workbench uses the application's foundation CSS with `dusk` / `dawn` theme controls. Stories include the real Hero, the SiteHeader/MegaMenu and the assembled first screen with navigation. Use the viewport toolbar to review responsive behavior.

## Documentation

- `CONTEXT.md` — terminology and project boundaries.
- `docs/spec/hero.md` — agreed behavior.
- `docs/spec/visual-system.md` — CSS and theme contract.
- `docs/spec/component-inventory.md` — first-screen component boundaries.
- `docs/spec/open-questions.md` — design choices not yet approved.
- `docs/adr/` — architectural decisions.
- `AGENTS.md` — contributor and agent rules.

Components and Storybook stories will be introduced as interaction designs are approved. Static publication is not configured yet.
