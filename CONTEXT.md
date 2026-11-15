# Project context

A static-exportable, responsive interface preview demonstrating the first screen of a product landing page. Related navigation, form and consent interactions are modeled without building other pages or external services.

## Vocabulary
- `ProductLandingPage`: page type; current preview contains its first screen only.
- `Hero`: first screen, not a complete home page.
- `SiteHeader`: site-wide shell; `PrimaryNavigation` owns navigation choices; `MegaMenu` presents expanded choices.
- `HeroAction`: prominent interaction that transforms from an action into a guided domain input flow.
- `BrandMark`: standalone symbol; `BrandWordmark`: lettering; `BrandLockup`: combination.
- Customer logos indicate customers. Integration logos indicate connected or planned services; these are distinct.
- Two separate particle effects serve brand entrance and integration logo transitions. Shared technology does not imply shared component behavior.
- `Mascot` gives contextual explanations of simulated navigation.
- `CookieConsent` is demonstrative UI whose selection is deliberately not retained across reloads.

## Technical boundaries
React, TypeScript and Next.js with static export. Feature-based structure, locally scoped CSS Modules and global design tokens. GSAP for interface motion; WebGL/GLSL for particle/shader effects; Three.js only when an actual 3D scene is required. Static first; optional enhancements are non-blocking. Storybook must import the same components as the application.

For agreed behavior read `docs/spec/hero.md`; for pending choices read `docs/spec/open-questions.md`; for long-lived decisions read `docs/adr/`.
