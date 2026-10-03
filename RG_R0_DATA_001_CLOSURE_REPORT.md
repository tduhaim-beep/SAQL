# SAQL — RG-R0-DATA-001 Closure Report

**Date:** 3 October 2026  
**Status:** CLOSED / APPROVED FOR R0 DATA-MODEL BASELINE  
**Scope:** Exceptions persistence baseline only; Final R0 not run; Business Coding remains HOLD.

## Approved decision applied
The repository now contains one minimal Prisma persistence model, `TrainingException`, based on the approved exception lifecycle and business requirements.

The model includes:
- required `journeyId` operational root;
- optional `academicOverlayId` for academic context;
- open string `typeCode` and optional `severityCode` (no invented closed taxonomies);
- approved `ExceptionStatus` lifecycle, default `OPEN`;
- owner, impact, blocking and escalation fields;
- waiting-party/action fields;
- resolution summary, actor and JSON metadata/reference evidence;
- history-preserving relations and timestamps.

`TrainingJourney` owns many exceptions; `AcademicOverlay` may own contextual exceptions; user owner/resolution-actor relations preserve history through `SetNull`.

## Explicit invariant
If `academicOverlayId` is present, the overlay must belong to the same `journeyId`. This is documented as an application/domain invariant and requires a negative test when the Exceptions Business Slice is implemented.

## Explicitly deferred / not invented
This closure does not define:
- severity levels;
- SLA/deadlines;
- notification/escalation policy;
- additional exception-type taxonomy;
- exception UI;
- retention/delete policy.

## Files changed
- `prisma/schema.prisma`
- `src/modules/exceptions/README.md`
- `docs/reconciliation/RG-R0-DATA-001-exceptions-persistence-decision.md` (new)
- `docs/reconciliation/pre-r0-reconciliation.md`
- `docs/implementation-control/README.md`
- `scripts/check-state-schema-alignment.mjs`
- `scripts/verify-repo.mjs`
- `tests/foundation/prisma-schema.test.mjs`
- `R0_V2_STATUS.md`
- `R0_V2_VERIFICATION_EVIDENCE.txt`
- `PRE_R0_RECONCILIATION_REPORT.md`

## Verification executed
Command:

`npm run foundation:verify`

Patch environment: Node `v22.16.0` (not the approved Final R0 runtime).

Result: **PASS — 14/14 Node-native foundation tests**, plus repository structure, control-pack counts, lifecycle-state ↔ Prisma alignment, `TrainingException` persistence-baseline checks, architecture guard and secret scan.

## Gate effect
`RG-R0-DATA-001` no longer blocks generation of the reviewed baseline migration in the approved Final R0 environment.

Remaining Final R0 work still requires Node 24 LTS, registry access + committed lockfile, Prisma validate/generate, PostgreSQL baseline migration + synthetic seed, typecheck, lint, full tests, build, Playwright RTL checks, CI evidence, and Tajawal provisioning verification.

**This closure is not R0 PASS. Do not start Business Slice 1.**
