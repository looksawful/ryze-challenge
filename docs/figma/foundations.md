# Figma foundations, naming and safe authoring

Status: **Partly implemented**, based on the actual desktop Figma GUI on Titan, 2026-11-16. This is a factual working inventory and change log, not a design sign-off. The approved implementation contracts remain [visual-system](../spec/visual-system.md), [Hero](../spec/hero.md) and [component-inventory](../spec/component-inventory.md).

Figma document: https://www.figma.com/design/HJMPgVAbPMvpMECkXbBXaG/Ryze-challenge

## Scope and safety boundary

- **Never edit, rename, regroup, resize, detach, or restyle any existing Hero / Header / reference screen** as part of foundations work. Approved visual appearance and frame history must survive unchanged.
- Create reusable primitives, styles, and newly isolated components **outside existing screen frames** on `DESIGN SYSTEM` only. Do not rebind screen layers to styles without separate approval and visual checks.
- Old or experimental frames must not be deleted until explicitly approved. A frame's dimensions do not automatically define a CSS breakpoint.
- Work directly through desktop Figma GUI (Local Commander / Remote Desktop Commander / MA Commander), not the Figma connector. Evidence screenshots are saved locally; they are not automatically published.
- This file records verified outcomes, flags plans as plans, and keeps screenshots out of the repo.

## Implemented Figma variables

Collection `Primitives` created inside this Figma file. No preexisting variables were found. Values below were manually verified in the Variables UI after creation.

| Figma variable | Type | Value | Use/status |
|---|---|---|---|
| `color/brand/ryze` | Color | `#FF5AF1` | Approved Ryze accent in visual-system contract |
| `color/neutral/white` | Color | `#FFFFFF` | Observed primitive |
| `color/neutral/black` | Color | `#000000` | Observed primitive |
| `color/neutral/muted` | Color | `#999BA4` | Observed in Hero heading selection |
| `space/8` | Number | 8 | Observed spacing/padding |
| `space/16` | Number | 16 | Observed spacing/padding |
| `space/24` | Number | 24 | Observed spacing/padding |

**Bindings:** these are unbound foundations; no existing Hero or Header frame uses them automatically. The grouping bug encountered during GUI authoring was corrected immediately, leaving only the seven canonical paths above. No speculative other-product accent was created.

## Verified local components and styles

- Figma **Assets → Created in this file** initially showed exactly three local components: `Arrow`, `NavButton`, `NavButtonText`.
- `NavButton` exposes `Mega` true/false; `NavButtonText` has the `Products/State` property. Exact variant inventory has not been fully verified.
- The `DESIGN SYSTEM` canvas contains labelled sections `Buttons`, `Header`, `Forms`, etc.; most are **not** local components. A section label is not a publishable component.
- No named local text/paint/effect/grid styles were visible in the Page → Styles panel at baseline.
- Some `your Shopify` heading layers are vector outlines, while at least one is editable text (Segoe UI Black, 37px, letter spacing -6%). Do not replace outlined typography or assume it can respond to text styles without an approved restoration plan.
- No new reusable components or named styles are claimed as created unless recorded in a subsequent verified entry here.

## Existing responsive Hero frames

| Current visible name | Dimensions | Figma selection | Export baseline |
|---|---|---|---|
| `Hero/Mobile/402x874` | 402×874 | [Frame](https://www.figma.com/design/HJMPgVAbPMvpMECkXbBXaG/Ryze-challenge?node-id=12-568) | Reference |
| `Hero/Mobile/874x402` | 874×402 | [Frame](https://www.figma.com/design/HJMPgVAbPMvpMECkXbBXaG/Ryze-challenge?node-id=13-710) | Reference |
| `Hero/Mobile/iPhone-Duo-Closed/466x678` | 466×678 | [Frame](https://www.figma.com/design/HJMPgVAbPMvpMECkXbBXaG/Ryze-challenge?node-id=17-955) | Additional |
| `Hero/Mobile/iPhone-Duo-Open/951x669` | 951×669 | [Frame](https://www.figma.com/design/HJMPgVAbPMvpMECkXbBXaG/Ryze-challenge?node-id=2-19) | Additional |
| `Hero/Desktop/Responsive874 (actual 918×874)` | 918×874 | [Frame](https://www.figma.com/design/HJMPgVAbPMvpMECkXbBXaG/Ryze-challenge?node-id=12-621) | Additional |
| `Hero/Tablet/iPad Pro 12.9/1024x1366` | 1024×1366 | [Frame](https://www.figma.com/design/HJMPgVAbPMvpMECkXbBXaG/Ryze-challenge?node-id=2-36) | Additional |
| `Hero/Desktop/1440xFH (first)` | 1440×1024 | [Frame](https://www.figma.com/design/HJMPgVAbPMvpMECkXbBXaG/Ryze-challenge?node-id=2-40) | Reference |
| `Hero/Desktop/1440xFH (second)` | 1897×1024 | [Frame](https://www.figma.com/design/HJMPgVAbPMvpMECkXbBXaG/Ryze-challenge?node-id=14-801) | Reference |
| `Hero/Desktop/1440xFH (third)` | 2803×1024 | [Frame](https://www.figma.com/design/HJMPgVAbPMvpMECkXbBXaG/Ryze-challenge?node-id=14-819) | Reference |

The five repository exports in `docs/reference/` are visual baselines, **not** the complete set of Figma device examples. In addition, the page has experimental `iPhone 16 Plus - 3`, `1758`, `1759`, an extra `Hero/402x874` and a `Fallbacks` section. Do not mark these obsolete without review.

## Proposed naming convention (NOT yet applied to existing screens)

Use component-oriented slash paths with consistent casing and semantically significant dimensions. Examples:

- Frames: `Hero/Mobile/402x874`, `Hero/Mobile/Landscape/874x402`, `Hero/Foldable/Duo-Closed/466x678`, `Hero/Foldable/Duo-Open/951x669`, `Hero/Tablet/1024x1366`, `Hero/Desktop/1440x1024`, `Hero/Desktop/1897x1024`, `Hero/Desktop/2803x1024`.
- Components: `Brand/Mark`, `Brand/Wordmark`, `Brand/Lockup`, `Navigation/Button`, `Button/Primary`, `Hero/Action`, using existing component roles and only adding components that are genuinely reused.
- Text layers by role: `heading/hero`, `lead/primary`, `copy/supporting`, `label/action`. Never rename unique content without checking that its Figma name is not part of a plugin or handoff workflow.
- Semantic color variables **after approval**: `color/surface/page`, `color/text/primary`, `color/text/muted`, `color/action/primary`; Dawn/Dusk modes depend on tested contrast. Keep theme role separate from product accent.
- Text styles **after verification**: `type/display/hero`, `type/heading`, `type/lead`, `type/body`, `type/control`. The font stack is `Segoe UI, system-ui, sans-serif`; sizes, line heights and variants require concrete measured source values.

Do not automatically create 9 CSS media queries from the 9 Figma sizes. Audit intermediate widths, portrait/landscape, viewport height, fold segment behavior, text wrapping, keyboard order and reduced motion.

## Handoff / acceptance checklist

- [x] Identify exact Figma file and page structure.
- [x] Inventory 9 key Hero screen sizes and verify direct frame links.
- [x] Inspect Variables, Styles and local component inventory at baseline.
- [x] Create and verify seven primitive tokens without touching screens.
- [ ] Decide which extra frames are approved versus working copies.
- [ ] Normalize frame/layer names *after explicit review*; do not rename references early.
- [ ] Inspect all inherited variants, interactions, bindings, and nested auto layouts.
- [ ] Create theme-appropriate semantic tokens; validate contrast.
- [ ] Create typography styles from verified live text, preserving vector originals.
- [ ] Make isolated reusable component masters in `DESIGN SYSTEM`, without any screen rebindings.
- [ ] Verify screen screenshots before/after any future integration and acceptance on iPhone, Mac and desktop.

## Work log

2026-11-16: Audit performed by remote GUI tools on Titan. Created Figma `Primitives` collection and verified the 7 variables listed above. Existing screen frames untouched. Collected evidence under `F:\\Temp\\ryze_figma_audit_2026-11-16\\`, notably `primitives-seven-verified.png`, `variable-brand-after-type.png` and the earlier frame/asset inventories. No issue comments or Asana updates were made; document creation is the requested durable handoff.

**Change authority:** this document is a log of performed foundations work, not approval to alter existing Figma frames.
