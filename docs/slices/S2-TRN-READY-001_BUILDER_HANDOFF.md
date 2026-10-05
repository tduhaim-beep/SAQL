# S2-TRN-READY-001 v0.1 — G3 Builder handoff

## Authority and candidate
Approved source: read-only SAQL_Slice02_Codex_Execution_Pack_v0.1, Task Packet §4, Current State Snapshot (Master Index v3.0 / AER v2.9) and Lean Slice Governance Addendum v1.0.
Baseline: accepted Slice01 merge `6c6772c25593f2d0454ea779eec37a18b822bee2`; baseline Hosted run 37203602483 is GREEN. Branch: `slice-02/training-journey-readiness`. The external delivery report records the exact final branch HEAD and its fresh local/Hosted results; this document does not self-approve G4/G6/G8.

## Implemented boundary
- Existing own-org officer Accept coordinates Application=ACCEPTED and exactly one TrainingJourney=PENDING_START, for the Opportunity's stored overlayMode=NOT_APPLICABLE only. Program Type is copied from that record; no new mapping or academic decision is inferred.
- Application row locking serializes decisions/retries; the existing unique applicationId constraint is a persistence backstop. Opportunity links/program mode are read under a shared row lock. A committed retry returns the same resource without duplicate audit. No accepted-record backfill or silent repair is performed.
- Decision, Journey and both audit records share one Prisma transaction. Correlation metadata includes resources/state and officer identity; creation records System execution without granting System decision authority.
- Student and Organization Training Officer read models require current role and own-user/own-org scope server-side. Admin impersonation, cross-resource reads and unsupported writes are denied.
- STU-D08 / ORG-R06-R07 link to minimal STU-T01 / ORG-O02 Journey details. Arabic PENDING_START messaging explicitly says training has not started. Journey DTOs exclude internal identity/context IDs and audit metadata. Only the Journey resource reference needed for navigation is added to Application DTOs.
- No ACTIVE/Actual Start, plan/supervisor/task/scoring/academic workflow, new IdP, dependencies, schema or migration. Missing readiness prerequisites are expected and unclaimed.

## Verification and evidence map
| Criteria | Evidence in committed tests / required gates |
|---|---|
| AC-S2-01/02/05 | integration/journey-readiness + capture-slice02-db direct SQL + Desktop/Mobile positive flow |
| AC-S2-03/04 | role/resource scoped integration reads and Desktop/Mobile HTTP denials |
| AC-S2-06 / NEG-S2-08 | 8 concurrent service Accepts + sequential retry; 4 concurrent HTTP Accepts + retry; one Journey and one audit pair |
| AC-S2-07 | real PostgreSQL transactions: injected Journey failure, each audit failure and a real audit FK violation roll back Application/Journey/audits |
| AC-S2-08 | direct SQL/Prisma audit resource, officer, timestamp and shared correlation assertions |
| AC-S2-09 | affected Desktop/Mobile screenshots, lang=ar, dir=rtl, no overflow, approved tokens/logo and actual Tajawal 400/500/700 platform-font/network evidence |
| NEG-S2-01 | pure/domain and real PostgreSQL invalid-state denial + HTTP APPLIED accept denial |
| NEG-S2-02/03/04 | role/resource isolation tests, protected read-only Journey routes, cross-user/org API and page denials |
| NEG-S2-05 | Required and Optional program-mode denials without Acceptance/Journey/academic writes |
| NEG-S2-06/07 | no start/generic mutation route; HTTP 404/405; architecture import/write guard; forged command/status adapter denial |
| NEG-S2-09 | actual optimized NODE_ENV=production build denies test identity and anonymous Journey reads |

Prisma query extensions inject failures only in tests. Their generated client overloads require a documented test-only unknown-to-PrismaClient type bridge; actual database transactions remain exercised. Production uses the concrete generated PrismaClient. strict and exactOptionalPropertyTypes remain enabled, with no any or verification bypass.

Required candidate gates: clean npm ci; production audit; Prisma validate/generate/baseline assertion/deploy/seed; foundation:verify; typecheck; lint; Vitest; build; npm run ci; both persisted-data evidence scripts; actual production test-actor guard; Playwright Desktop/Mobile; Hosted CI GREEN on exact final SHA.

The E2E wrapper preserves the runner's exit status and redacts the ephemeral test identity token from the JSON configuration before evidence/artifact delivery. Redaction failure fails the command. The test harness identity remains unavailable in production; its token is never a product credential.

## Canonical reconciliation / next-stage boundary
State/permission/scoring controls and Project Sources remain untouched. The pack's accepted G8 Slice01 traceability implementation/control statuses are newer than the repository mirror; all 225 requirement semantics agree. Read the pack as current; no G3 canonical status update. `S2-TRN-READY-001_TRACEABILITY_DELTA_PROPOSAL.csv` is a proposal only, conditional on independent review, triggered Security and Founder Closeout.

Independent Validation (G4–G5): NOT STARTED by Builder. Security (G6): TRIGGERED / REQUIRED, NOT STARTED by Builder. G7–G8, merge and Production: NOT AUTHORIZED by this G3 execution. Existing development-only SEC-R0-DEV-002/R37 remains open; report fresh production audit separately. G3 does not establish production or independent security approval.
