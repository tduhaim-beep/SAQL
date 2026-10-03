# SAQL R0 v2 — Pre-R0 Repository Reconciliation Report

Status: PATCH APPLIED / FINAL R0 NOT RUN / BUSINESS CODING HOLD

## Scope of this patch
This patch reconciles the repository scaffold to the current Project Sources before Final R0. It does not implement Business Slice 1 and does not claim R0 PASS.

## Applied changes
1. Brand Identity v1.1
   - Added approved v1.1 SVG logo assets under `public/brand/`.
   - Mirrored exact digital palette in `docs/design/brand-colors.json`.
   - Updated active CSS tokens to Ink `#142F43`, Blue `#2F5BEA`, Canvas `#F4F7FB`, White `#FFFFFF`, Muted `#566575`, Divider `#D9E2EE`.
   - Set Tajawal as the interface font baseline.
   - Removed the superseded tagline from the foundation page.
   - Moved previous logo/token/public-site references into `docs/design/references/historical/`.
   - Added current v1.1 approved logo references under `docs/design/references/current/`.
   - Preserved logo lettering as SVG artwork rather than recreating it as text.

2. Governance/source references
   - Updated `AGENTS.md`, Codex Start Here, current baselines, brand baseline, and implementation-control README to current Project Source rules.
   - Marked Stage 08B v0.1 evidence as historical pre-Brand-v1.1 evidence.
   - Current Brand/RTL PASS must be re-run after this reconciliation.

3. Prisma/state alignment
   - Aligned lifecycle enum state sets to `STATE_MACHINES_V2.csv` for Verification, Opportunity, Application, Training Journey, Plan Version, Plan Instance, Task, Alignment, Academic Overlay, and Exception.
   - Separated Academic Overlay lifecycle status, participation mode, and academic trust state.
   - Moved Training Plan lifecycle status to `TrainingPlanVersion` and typed Training Task status.
   - Closed `RG-R0-DATA-001` after explicit founder approval and implemented the minimal `TrainingException` persistence baseline without inventing type/severity taxonomies.

4. Test/CI harness
   - Fixed Vitest discovery from `*.test.ts` to the actual `*.spec.ts` suite.
   - Replaced placeholder `expect(true)` foundation specs with repository/source/state/CI contract tests.
   - Added state-machine ↔ Prisma enum alignment verification.
   - Added Playwright `webServer` so E2E starts the application.
   - CI now requires a reviewed migration baseline before `prisma migrate deploy`.
   - Preserved prior dependency-free evidence as historical and created a current evidence placeholder that explicitly forbids claiming R0 PASS.

## Patch-time verification executed
In the available environment (Node v22.16.0):

`npm run foundation:verify`

Result after RG-R0-DATA-001 closure: PASS — 14/14 Node-native foundation tests plus repository, control-pack, state/schema alignment, TrainingException persistence-baseline, architecture, and secret checks.

This is only a dependency-free Pre-R0 check. It is not Final R0 evidence.

## Remaining blockers before Final R0 can PASS
- Run in Node.js 24 LTS.
- Restore registry access and generate/commit one lockfile.
- `RG-R0-DATA-001` is closed; baseline migration generation may now proceed in the target R0 environment.
- Generate/review a real initial v2 migration and apply it to disposable PostgreSQL.
- Run synthetic seed against PostgreSQL.
- Run Prisma validate/generate, TypeScript, ESLint, Vitest, Next production build, Playwright, and full CI.
- Provision and verify actual Tajawal 400/500/700 loading from the canonical Brand Identity package in the target application environment.
- Capture commands/results plus commit/release identifiers into current R0 evidence.

## Required Final R0 outcome
Final R0 must return exactly one engineering gate decision: `R0 PASS` or `R0 REWORK`.

Do not start Business Slice 1 until `R0 PASS` is supported by actual execution evidence.
