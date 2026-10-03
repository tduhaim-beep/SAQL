# SAQL — Codex Final R0 Task Packet

## Mission
Complete **Final R0 Verification only** for the SAQL Pilot v2 repository.

**Do not start Slice 1. Do not implement business features.**
Business Coding remains **HOLD** until the result is an evidence-backed `R0 PASS`.

## Source of truth
Before changing or running anything, read the current Project Sources in this order:
1. `CAN-MI` — latest Approved/Canonical Project Master Index & Decision Register.
2. `CAN-AER` — latest Current Assumptions / Evidence / Risks / Open Decisions Register.
3. `03_ToBe_Process_Design_v2.0_AR.docx`.
4. `04_Business_Requirements_v2.0_AR.docx`.
5. `05_Project_Scope_Baseline_v2.0_AR.docx`.
6. `06_Technical_Architecture_Planning_v2.0_AR.docx`.
7. `07_UX_UI_Functional_Consolidation_v2.1_AR.docx`.
8. `SAQL_Brand_Identity_v1.1.zip`.
9. `08_Engineering_Foundation_Codex_Readiness_v2.1_AR.docx`.
10. `08A_Implementation_Control_Pack_v2.1_AR.docx` and its machine-readable control files in this repository.
11. `08B_R0_v2_Repository_Reconciliation_Verification_v0.1_AR.docx` only as **historical pre-Brand-v1.1 evidence**; it must not be reused to claim current Brand/RTL PASS.

Then read repository-local instructions in this order:
1. `/AGENTS.md`
2. `/docs/codex/codex-start-here.md`
3. `/R0_FINAL_RUNBOOK.md`
4. `/R0_V2_STATUS.md`
5. `/PRE_R0_RECONCILIATION_REPORT.md`
6. `/RG_R0_DATA_001_CLOSURE_REPORT.md`
7. `/docs/reconciliation/RG-R0-DATA-001-exceptions-persistence-decision.md`

## Current known state
- Pre-R0 reconciliation is complete.
- SAQL Brand Identity v1.1 has been reconciled into the repository.
- `RG-R0-DATA-001` is closed and the minimal `TrainingException` persistence model is present.
- Dependency-free `foundation:verify` passes in the preparation environment.
- Final R0 has **not** passed yet because the preparation environment did not provide Node 24 + npm registry + PostgreSQL.

## Required target environment
Use an environment with:
- Node.js **24.x LTS**.
- npm registry access.
- disposable PostgreSQL.
- `DATABASE_URL` pointed only to that disposable database.
- synthetic data only.

If any required environment item is unavailable, return `R0 REWORK / ENVIRONMENT BLOCKED`; do not weaken the baseline and do not downgrade Node.

## Exact execution sequence
Follow `/R0_FINAL_RUNBOOK.md`. At minimum execute and retain raw output for:

### A — environment / reproducibility
- `node -v`
- `npm -v`
- `npm run r0:env-check`
- `npm install --package-lock-only`
- review `package-lock.json`
- `npm ci`

### B — Prisma / database
- `npm run db:validate`
- `npm run db:generate`
- `npx prisma migrate dev --name r0_v2_baseline --create-only`
- review generated `prisma/migrations/*/migration.sql`
- `npm run db:assert-migration`
- `npm run db:deploy`
- `npm run db:seed`

Migration review must confirm:
- current v2 schema only; no v1 model/state resurrection;
- `TrainingException` and current lifecycle enums are represented;
- no invented closed taxonomy for Exception type/severity;
- no destructive operation without an explicit source-backed decision.

### C — engineering gates
- `npm run foundation:verify`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run ci`
- `npx playwright install --with-deps chromium`
- `npm run test:e2e`

### D — Brand / RTL evidence
Verify the running result against Brand Identity v1.1:
- Arabic root uses `lang="ar"` and `dir="rtl"`.
- approved v1.1 logo assets only.
- Tajawal 400/500/700 loads successfully.
- no old Navy/Gold/Ivory/Gray/Noto product baseline is active.
- critical Arabic Desktop/Mobile checks pass.
- semantic status colors remain separate from brand palette.

## Hard stop rules
- Do not start a Business Slice.
- Do not add product features to make tests pass.
- Do not hand-author a fake migration merely to close the gate.
- Do not change state machines, permissions, scoring rules, scope, or destructive-data behavior unless a current approved source explicitly requires it.
- Do not use real personal/government data or production credentials.
- If a requirement or relationship is unclear, create a Requirement Gap and stop that affected change instead of guessing.

## Required evidence updates
Update `/R0_V2_VERIFICATION_EVIDENCE.txt` with:
- environment/runtime/database versions;
- exact commands and exit codes;
- dependency/lockfile result;
- generated migration path + review findings;
- migration/deploy/seed result;
- test counts/failures;
- typecheck/lint/build/CI/Playwright results;
- Brand v1.1 / RTL evidence;
- changed files;
- commit/release identifier if available;
- security findings;
- any Requirement Gaps.

Also update `/R0_V2_STATUS.md` so its status matches the evidence.

## Final response contract
Return exactly one final engineering outcome:

### `R0 PASS`
Only if **every required gate has actual execution evidence**.

or

### `R0 REWORK`
List each failed/blocked gate, evidence, and the smallest corrective action.

In either case, include:
1. environment versions;
2. commands executed;
3. gate-by-gate results;
4. changed files;
5. dependency/lockfile summary;
6. migration summary;
7. test/build/CI/Playwright results;
8. security findings;
9. Brand/RTL evidence;
10. Requirement Gaps;
11. explicit statement that Slice 1 was **not** started.
