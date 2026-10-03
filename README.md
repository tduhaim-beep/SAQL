# صقل — SAQL | R0 v2 Engineering Foundation

Founder-supervised, AI-assisted modular-monolith foundation for Pilot v2.0 of the Saudi training-journey platform.

## Current status
**Pre-R0 reconciliation patch applied. Final R0 has not been run. Business feature coding is HOLD.**

The repository is reconciled to SAQL Brand Identity v1.1 and the current Stage 07/08/08A v2.1 control references at the file/scaffold level. Final R0 still requires actual Node 24 + registry + PostgreSQL execution evidence.

## Approved runtime baseline
- Node.js 24 LTS
- Next.js / React / TypeScript
- PostgreSQL + Prisma
- Vitest + Playwright

## Start here
1. Read `AGENTS.md`.
2. Read `docs/codex/codex-start-here.md`.
3. Read `docs/reconciliation/pre-r0-reconciliation.md`.
4. Read `docs/implementation-control/README.md`.
5. Run `npm run foundation:verify` (dependency-free precheck).
6. Read `R0_FINAL_RUNBOOK.md`.
7. In the target environment, set `DATABASE_URL` to a disposable PostgreSQL database and run `npm run r0:env-check`.
8. Generate/review the first lockfile and Prisma baseline migration using the installed Node 24 + Prisma toolchain.
9. After migration review, run the full commands in `R0_FINAL_RUNBOOK.md`, then update `R0_V2_VERIFICATION_EVIDENCE.txt` and return R0 PASS or R0 REWORK.

## Mandatory product rules
- Arabic-first RTL UI.
- SAQL Brand Identity v1.1 only for current visual implementation.
- Training Journey Core separated from Academic Overlay.
- Organization training score separated from academic grade.
- Government production remains compliance-gated.
- Synthetic data only until production/security gates are passed.

See `R0_V2_STATUS.md` for reconciled vs blocked evidence.

## Final R0 handoff
For the next Codex task, start with `CODEX_FINAL_R0_TASK_PACKET.md` and follow `R0_FINAL_RUNBOOK.md`. This task is Final R0 verification only; do not start Slice 1.
