# S1-APL-CORE-001 v0.1 — Builder handoff

Branch: `slice-01/application-core`. Approved baseline: `9b44609aa58f2d9e221bb7011b5b20238ff4313c`.
Authority: user-confirmed Founder G2 approval; Master Index v2.6/AER v2.5/Business Development Handoff v1.0/current Task Packet v0.1. Input ZIP SHA256 `eb370ff90175fc5abd1f113fd3c7070b108fe7d088674bdd334d76a53d5e6871`. The exact final SHA and Hosted run are recorded in the external delivery report after execution; this committed document does not invent a self-referential hash or assume Hosted success.

## Built scope

Published opportunity read (PUB-08/STU-D03); student confirmation/apply (STU-D04), own list (STU-D07), own status/history/withdraw (STU-D08); own-org applicants (ORG-R05), detail and Begin Review/Accept/Reject (ORG-R06/R07). Arabic RTL, current SVG Brand v1.1, Tajawal400/500/700. No identity-provider or login/user-switcher UI.

Application use cases own authorization and invoke ports; framework-independent SM-APL domain logic permits only the approved transitions. Global Prisma adapters implement persistence. Unique `(opportunityId, studentUserId)` plus a published-opportunity row lock prevent duplicate/racy submissions. Status compare-and-set and Business Audit are in one transaction; failed audit rolls the status back, concurrent decisions record one consistent outcome. Rejection reason is required; denied actions add no decision/audit and do not disclose the foreign resource. No generic status endpoint or Request Information command.

Existing Prisma schema, migration and canonical R0 seed are unchanged. Per-test, namespaced synthetic fixtures create two verified organizations, two pre-qualified published opportunities, hidden draft/suspended opportunities, students and officers; cleanup returns canonical seed counts. Accept never creates TrainingJourney. BR-APL-001 is partial, with no generic eligibility claim.

## Authorization/runtime boundary

No authentication provider is wired by this slice. Ordinary runtime therefore has no authenticated actor and protected operations fail closed. Only the external harness enables a test actor adapter: NODE_ENV=test/development AND APP_ENV=test AND explicit enable=1 AND random token of at least32 characters. Both test ID and token must be present; comparison is timing-safe. Roles/context come from ACTIVE persisted `s1-test:` synthetic accounts ending `@example.invalid`, not request-provided roles or organization claims. NODE_ENV=production unconditionally disables this adapter, even with the other test settings. The actual production-build probe tests GET/POST and anonymous denial.

Mutation routes require same-origin JSON and reject extra fields (including status/studentUserId). The incoming Host is used because Next internally normalizes request URLs to localhost; browsers cannot override Host on cross-site fetch. Request bodies are limited to8KiB and reason text to1000 characters as transport bounds; no new business rejection taxonomy. Responses are no-store; unexpected errors expose neither SQL nor raw internal details. Audit metadata contains from/to state and the required rejection reason only; actor/resource/time are stored separately. UI read models omit email/phone and audit actor identifiers.

## Verification and review separation

Required local gates: frozen npm ci; Production audit; Prisma validate/generate/assert/deploy/seed; Foundation14/14; strict typecheck; lint; Vitest52 tests; optimized build; full local CI; production actor guard; real DB assertions; Desktop/Mobile E2E10 tests. Fresh font network/CDP rendering and screenshots cover each affected screen with no horizontal overflow. Final raw logs/exit codes, failures corrected during development, DB snapshots and Hosted headSha/steps are delivered outside code.

The Builder's test evidence is not independent G4/G6 review. G4-G8 remain NOT STARTED; no Security Reviewer approval or Founder Acceptance is claimed. This handoff is ready for the next review gate only when the external report confirms all final local gates and GREEN Hosted CI on the exact delivery commit. No merge or next slice is authorized.

Known gap: SEC-R0-DEV-002 remains the previously recorded5 High development-only braces/toolchain entries with no compatible published patch; Production audit remains0 High/0 Critical. IdP/eligibility/notifications/TrainingJourney are approved exclusions, not invented new requirements. No schema/role/state/source conflict was found in this slice. Runtime surfaces are validation-only; no production launch claim.

## Evidence map

- `tests/domain/application-lifecycle.spec.ts`: approved transition subset and all other state/command combinations denied.
- `tests/integration/application-core.spec.ts`: real PostgreSQL ownership, persisted audit, duplicate/concurrent operations and rollback.
- `tests/security/test-actor.spec.ts`: disabled non-test/production, missing/wrong token and untrusted-role rejection.
- `tests/e2e/application-core.spec.ts`: UI/API AC-S1/NEG-S1, CSRF/mass-assignment/unknown endpoints, Desktop/Mobile brand/RTL/font evidence.
- `tests/support/production-actor-guard.mjs`: actual production-build identity denial.
- `tests/support/capture-slice01-db.ts`: independent SQL over4 accepted/rejected/withdrawn applications and11 audits, zero journeys, canonical cleanup counts.
- `S1-APL-CORE-001_TRACEABILITY_DELTA_PROPOSAL.csv`: proposed requirement coverage; canonical files untouched.

To reproduce, provision a disposable PostgreSQL16 database, export DATABASE_URL/APP_ENV=test, then npm ci; database commands; npm run ci; npm run test:slice01:db-evidence; npm run test:production-actor-guard; npx playwright install --with-deps chromium; CI=1 npm run test:e2e. Playwright generates a random harness token and owns its server; never run an actor-switching product UI. Preserve strict config if Next rewrites generated development settings.
