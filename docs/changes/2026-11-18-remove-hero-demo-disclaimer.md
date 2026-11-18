# Remove Hero demo disclaimer

Date: 2026-11-18

- Removed the line `Demo only. No data is sent.` from the HeroAction form.
- Removed unused `helpId` and the `.help` CSS rule.
- Input retains error descriptions via `aria-describedby={error ? errorId : undefined}`. Other demo behavior and disclosures unchanged.
- Integrated into a dedicated private `main` commit together with the restrained HeroAction form transitions. No public deployment.
- Verification: `npm run build` (including TypeScript) passed; `git diff --check` passed; exact string absent from Hero source.
