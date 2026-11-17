# Karrik typography preview

Date: 2026-11-18
Source: https://velvetyne.fr/fonts/karrik/
Official archive: https://gitlab.com/phantomfoundry/karrik_fonts
Designers: Jean-Baptiste Morizot and Lucas Le Bihan.
License: SIL Open Font License 1.1 (included alongside the local WOFF2 files).

- H1/H2/H3 and Typography.heading now use self-hosted Karrik Regular, with natural 400 weight and relaxed tracking.
- Body, buttons, inputs, navigation labels and brand name remain system Segoe UI.
- Temporary preview only. No Git commit, GitHub push or public deployment.
- To undo, revert the typography/font changes in src/app/foundation.css and src/ui/Typography.module.css.
- Font assets are in public/fonts/karrik.

QA: Node focused test 1/1 passed; Next.js production build and TypeScript passed. Chrome desktop 1440x900, mobile 390x844 and landscape 874x402: Karrik font loaded, no JS errors and no horizontal overflow. Preview opened in Opera on Titan at http://100.110.158.49:8793/?font=karrik. Changes remain local and uncommitted.
