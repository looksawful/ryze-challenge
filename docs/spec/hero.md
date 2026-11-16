# Hero interaction specification

Status: Agreed behavior contract. `dev` already includes the shared Hero, responsive domain flow, animated Rizzie and Homework Cookie Notice. The code describes what is implemented; visual and device acceptance remains in #16.

## Scope
Implement one responsive Hero for a product landing page. Do not implement other pages, an exhaustive product catalog, authentication, server-side backend or a live AI integration.

## Navigation
- `SiteHeader` contains brand composition, primary navigation, an appropriate header action and a separately understandable `MegaMenu`.
- The displayed menu reflects useful real destinations, without constructing a complete site taxonomy.
- Destination data retains actual URLs. In preview mode a user action never follows a destination; it instead presents a friendly explanatory speech bubble associated with the mascot.
- The explanation states that a production site would open the destination and that this preview stays on the same screen. Keep presentation concise, minimalist and consistent with the site.
- One message at a time. Dismiss after approximately 5 seconds; pause on hover/focus and support explicit dismissal. New messages replace existing ones.
- Provide independent mobile presentation with shared navigation data. Existing menu code is a reference; its animation and organization are not approved as final.

## Hero action
- On sufficiently wide layouts, the primary button morphs in place into a domain-entry field. On narrow/mobile layouts, it instead opens an accessible bottom drawer with the field and submit control. Choose the mode by available layout width, not device identity; keep reduced-motion and no-JS paths meaningful.
- Prewritten example prompts cycle as animated placeholder-style suggestions, without extra control clutter.
- Accept domains and full URLs. Provide forgiving but unambiguous input normalization, careful IDN/transliteration handling and understandable validation feedback.
- Valid submission starts a simulated thinking sequence, then an animated prepared response containing a preview action. No live AI or external request is required.
- Activating the preview action produces the same mascot speech-bubble explanation rather than navigating.
- The visitor can revise the domain and repeat the interaction without returning to the original button.
- Existing button and transformation design are not final.

## Consent
- `HomeworkCookieNotice` presents local demo preferences; saved choices persist in localStorage until changed, without enabling tracking.
- A settings action allows preferences to be reopened; the notice appears if no saved choice exists. It does not render a misleading server-side cookie notice without JavaScript.

## Brand, integrations and effects
- Distinguish symbol, wordmark and combined lockup; distinguish customer marks from integration marks.
- An integration may be available or comingSoon; do not imply unavailable functionality works.
- Brand entrance particles and integration logo particle morphing are two separate use cases.
- The site must remain readable and functional before JS effects initialize and when advanced effects are disabled or unsupported.

## Verification targets
- Keyboard and touch navigation stay on the current page.
- Menu and CTA do not perform unexpected external navigation.
- A valid domain reaches a deterministic result; invalid input gives usable feedback.
- Repeating the CTA scenario works without reloading.
- Consent choices persist across reloads; the settings action reopens them.
- Slow or unsupported WebGL never blocks essential content.
