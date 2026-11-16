# First-screen component inventory

Status: Current `dev` implementation map, not evidence of final visual approval. Code is authoritative for implementation; GitHub Issues for acceptance.

| Role | Implementation | Boundary |
|---|---|---|
| First screen | `src/features/hero/Hero.tsx` | Single responsive Hero, visual/device QA in #16 |
| Navigation and product previews | `SiteHeader.tsx`, `link-model.ts` | Shared verified destinations, desktop MegaMenu and mobile dock/dialog; no destination pages |
| Page composition | `HeroWithNavigation.tsx` | Combines Hero and navigation on the actual page and in Storybook |
| Domain demo | `HeroAction.tsx` | Responsive inline/drawer input, mock thinking and result; no backend |
| Mascot and explanation | `RizzieMascot.tsx`, `RizzieMessage.tsx` | Real sprite/poster, accessible feedback; acceptance tracked in #11/#16 |
| Integration marks | `IntegrationLogos.tsx` | Static semantic logos and optional motion fallback |
| Brand intro | `public/ryze-logo-intro.html` | Separate optional demo, not the live Hero intro (#15) |
| Cookie notice | `HomeworkCookieNotice.tsx` | Local demo preferences, persistent selection, reopenable settings |
| Design references | `docs/reference/` | Visual evidence, not implementation or automatic approval |

No real product pages, full footer, backend, authentication or live AI workflow are part of this first-screen preview. Storybook imports actual components. Avoid placeholder duplicate components and separate implementations for design previews.
