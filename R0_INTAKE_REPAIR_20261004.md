# R0 Intake Repair — 4 October 2026

Scope: repository-intake repair only; no business feature or source-document change.

Applied repairs:
- Actual Tajawal loading: added `@fontsource/tajawal@5.3.0` and imports for approved weights 400/500/700 in `src/app/layout.tsx`.
- Runner separation: Vitest discovery is limited to domain/application/integration/security specs; `tests/e2e/**` remains Playwright-only.
- Known TypeScript TS2532 guard in the domain foundation enum helper was corrected without changing business logic.
- Brand E2E now verifies that a loaded `Tajawal` FontFace exists after `document.fonts.ready`, not merely that CSS names the family.

Required next action in Codex:
1. run a clean install so `package-lock.json` resolves `@fontsource/tajawal@5.3.0`;
2. re-run Repository Intake Check;
3. only if Intake passes, proceed to Final R0 Verification.
