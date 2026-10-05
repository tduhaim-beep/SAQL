# صقل — SAQL | Pilot v2.0 / Slice 2

Founder-supervised, AI-assisted modular-monolith foundation for Pilot v2.0 of the Saudi training-journey platform.

## Current status
**Slice01 G8 ACCEPTED / MERGED; Slice02 G3 Builder only.**

Current task: `S2-TRN-READY-001 v0.1`, from merge baseline `6c6772c25593f2d0454ea779eec37a18b822bee2`, under the approved portable Slice02 execution pack. Authorized own-organization acceptance creates exactly one PENDING_START journey for NOT_APPLICABLE mode; acceptance does not start training. No merge or Production is authorized. Read `docs/codex/codex-start-here.md` and `docs/slices/S2-TRN-READY-001_BUILDER_HANDOFF.md`.
## Approved runtime baseline
- Node.js 24 LTS
- Next.js / React / TypeScript
- PostgreSQL + Prisma
- Vitest + Playwright

## Start here
1. Read the current Slice02 execution pack in its required order, then `AGENTS.md` and `docs/codex/codex-start-here.md`.
2. Use Node 24 and a disposable PostgreSQL database; synthetic data only.
3. Run `npm ci`, production audit, Prisma validate/generate, reviewed migration deploy and synthetic seed.
4. Run `npm run ci`, `npm run test:slice01:db-evidence`, `npm run test:slice02:db-evidence`, `npm run test:production-actor-guard` and Desktop/Mobile `npm run test:e2e`.
5. Require Hosted CI GREEN on the exact candidate before the G3 evidence handoff. Separate Independent Validation and Security remain required afterward.

## Mandatory product rules
- Arabic-first RTL UI.
- SAQL Brand Identity v1.1 only for current visual implementation.
- Training Journey Core separated from Academic Overlay.
- Organization training score separated from academic grade.
- Government production remains compliance-gated.
- Synthetic data only until production/security gates are passed.

Historical R0 reports remain supporting foundation evidence; they do not establish the current Slice02 outcome.
