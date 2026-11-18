# Ryze Hero: text-only chat reply restored · 18 November 2026

## User correction and scope
Previous iterations mistakenly removed the conversational reply effect when the user requested only removal of the generated **image/capability preview step**. The requested behavior is a chat-style exchange after submitting a website address, not an email-first form, a static acknowledgement or a simulated website audit.

## Implemented
- Restored the prior GSAP character-by-character reply timing (`CHAT_RHYTHM.character`), blinking caret and original placeholder animations.
- The submitted domain is displayed as a small user chat message; the Ryze assistant's reply types out on the left.
- Example reply: “Got it, example.com. Want to explore ads, SEO, or CRO?”
- A malformed/empty address retains a visible chat error and accessible `role="alert"`; invalid addresses never trigger a fake analysis.
- For `prefers-reduced-motion: reduce`, responses appear immediately, with no caret animation.
- Screen readers receive the full reply via offscreen live `status`/`alert`, not individual keystrokes.
- No images, product cards, capability gallery, synthetic progress screen, scan results or network calls were restored. Input validity remains a local URL-format check.
- Storybook interactive validation stories now target the actual `Check for free` button and example message.

## Regression evidence
- Browser regression test written RED first: it failed against the prior static “Website address accepted.” behavior.
- Browser smoke on the built static export now verifies `example.com` as a visible user message; assistant response; 0 images/proof cards; and partial typed characters before the complete reply in normal-motion mode.
- Existing first-visit cookie, mobile-modal, footer, navigation, intro and no-JavaScript tests remain in place.
- `npm run test:all` passed after implementing the chat. Build, TypeScript, lint and Storybook were included.
- The Mac is disconnected; current verification was performed on Titan with headless Chrome. This is not a claim of manual Safari approval.

## Scope boundary
This is a recovery of approved chat behavior. Do not add generated screenshots, imitation store analysis, email-first validation, a third-party API request or an intermediate audit page. Do not merge unrelated uncommitted work or publish Pages.
