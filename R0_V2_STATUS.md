# R0 v2 current status — seed/security correction

**R0 REWORK — Business Coding HOLD; Slice1 not started.**

Current candidate: seed TS2375 resolved via conditional object spread; strict TypeScript preserved. Typecheck, lint, Vitest7/7, production build and full npm run ci PASS; Foundation14/14. PostgreSQL16 disposable validate/generate/assert/deploy/synthetic seed and independent DB checks PASS. Desktop/Mobile Playwright2/2 and current Tajawal400/500/700 Brand/RTL PASS. Project Sources and approved implementation controls unchanged; RG-R0-DATA-001 CLOSED.

MySQL2 upgraded3.15.3→3.23.1 within major3 via scoped override. Production audit4→3 High (deepmerge-ts7.1.5 and propagated @prisma/config/prisma),0 Critical. SEC-R0-DEP-001 OPEN: fixed deepmerge-ts requires major8 outside this task; no force/downgrade/waiver. Full-tree audit8 High including unchanged dev-tool chain; SEC-R0-DEV-002 OPEN.

Hosted CI: pending validation on exact candidate commit at documentation time; no Green run is claimed. The workflow now accepts final-r0/** pushes. Final Hosted status/commit/run logs are in the external correction-run delivery evidence, not inferred from local CI.

Current local report: R0_REWORK2_LOCAL_VERIFICATION_20261004.md. Security register: docs/security/R0_DEPENDENCY_SECURITY_GAPS_20261004.md. Earlier final reports are historical relative to this technical correction. OD-21 Final R0 PASS stays OPEN. No Business Coding authorization follows local success.
