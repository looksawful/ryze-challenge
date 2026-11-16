# First-screen site navigation release checkpoint

Date: 2026-11-16. Scope: issue #11.

## Implemented

- Added the existing SiteHeader and desktop MegaMenu from the reviewed navigation prototype, retaining verified destination metadata.
- Added the responsive mobile navigation dialog with nested Back, Close, Escape, focus restoration and scroll lock.
- Added the shared HeroWithNavigation component, used by the application and Storybook.
- The SiteHeader `hero` variant overlays the approved Hero without moving its headline, brand, copy, integration marks or CTA. Standalone Storybook retains the original full header.
- Preview links remain on the current page and show explanatory status; without JavaScript the link list remains available.

## Verified locally before PR

- `npm test`: 25 passing (including 3 new first-screen integration checks).
- `npm run lint`, `npm run typecheck`, `npm run build`: passed.
- `npm run test:static`: 4 passing (including header SSR/no-JS link presence).
- `npm run build-storybook`: passed.
- `node --test scripts/site-header.browser.test.mjs`: 9 passing in headless Chrome.

## Known limits

- Visual approval against all five supplied SVG viewports is outstanding.
- The existing explanatory message is a temporary preview fallback, not the approved Rizzie speech bubble. Implement Rizzie integration through #10 without inventing mascot identity or rights.
- Real iPhone/Safari/manual acceptance and assistive-technology checks remain open in #16.
- This release contains no footer and does not change external pages, booking services or repository visibility.

## Rollback

Revert the integration merge commit on `prod`, rebuild the static export and republish if necessary. Keep prior release SHA and generated output for rollback. Do not change the site's visibility.

## Tracking

Issue #11 owns navigation acceptance; #10 owns mascot feedback; #16 owns manual cross-device acceptance. Do not close these issues based on build success alone.
