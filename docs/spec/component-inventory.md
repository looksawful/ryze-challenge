# First-screen component inventory

Status: Inventory candidates, not approved implementations.

| Role | Component name | Status / boundary |
|---|---|---|
| Page shell | `ProductLandingPage` | Single-page Hero demo only |
| First screen | `Hero` | Implemented and published as a static responsive composition; further visual/device acceptance remains open (#9, #16) |
| Shared header | `SiteHeader` | Navigation, brand and appropriate action |
| Navigation | `PrimaryNavigation`, `MegaMenu` | Existing reference is complex; finalize motion and responsive structure before refactoring |
| Navigation cards | `NavigationProductCard` (provisional) | Naming and exact content still open |
| Brand | `BrandMark`, `BrandWordmark`, `BrandLockup` | Three distinct presentational roles |
| Motion | `BrandParticleIntro`, `IntegrationParticleMorph` | Different animations; do not create a shared engine prematurely |
| Integrations | `IntegrationShowcase` (provisional) | Distinguish available vs comingSoon |
| Action | `HeroAction` | Button → input → thinking → result → simulated preview; original form is not sufficient |
| Mascot | `RizzieMascot` | Speech-bubble navigation feedback, animation design pending |
| Message | `RizzieMessage` (provisional) | Replaces previous bubble; ~5s auto-hide, pause on hover/focus |
| Consent | `CookieConsent` | Responsive collapse/reopen implemented and published (#14); real-device acceptance remains open |

Reference implementations were located for Hero, MegaMenu, CookieNotice, a domain form, integration logo morph and product shelf; their availability does **not** establish feature completeness, visual approval or permission to copy assets. Source and license review precedes any migration.

## Boundaries
No footer, destination pages, full catalog, backend, login, live model or broad imported library is part of the initial screen. Storybook has a real Hero preview; other component stories remain gated by their review. Mobile navigation is still being developed with shared destination data (#11).

## Rejected shortcuts
- Reusing the current domain form as the complete transforming HeroAction.
- Showing a generic toast in place of the mascot's speech bubble.
- Loading every component with both themes and every conceivable state.
- Copying large CSS files or old Storybook stories wholesale.
- Generating a page mock on navigation or navigating out of the prototype.
