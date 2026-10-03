# Pre-R0 Repository Reconciliation — Brand Identity v1.1

Status: PATCH APPLIED / FINAL R0 NOT RUN

## What changed
- Current SAQL Brand Identity v1.1 assets/tokens are the active visual baseline.
- Historical visual references were moved out of the active reference path.
- Current source references were updated to Stage 07/08/08A v2.1 and Brand Identity v1.1.
- Prisma lifecycle enums were aligned to the machine-readable State Machines v2 state sets without implementing business commands.
- Test/CI harness defects that could create false confidence were corrected.

## Closed Requirement Gap — RG-R0-DATA-001
**Topic:** Exceptions persistence model.

Status: **CLOSED / APPROVED FOR R0 DATA-MODEL BASELINE on 3 October 2026.**

The approved minimal `TrainingException` persistence shape is documented in `docs/reconciliation/RG-R0-DATA-001-exceptions-persistence-decision.md` and implemented in `prisma/schema.prisma`. No severity/type taxonomy, SLA, UI, or notification policy was invented.

The remaining cross-record invariant is explicit: when `academicOverlayId` is present, the overlay must belong to the same `journeyId`; this must be enforced in domain/application logic and covered by a negative test when the Exceptions slice is implemented.

## Execution blockers
- Approved target runtime: Node 24 LTS; patch environment: Node 22.
- npm registry unavailable in patch environment; no dependency install/lockfile evidence.
- No baseline migration exists yet.
- Full framework/database/browser/CI verification must happen in the target environment.

## Brand asset provenance
Current SVG assets and `brand-colors.json` were copied from the user-provided `SAQL_Brand_Identity_v1.1.zip` package.

Font binaries from the brand package are not duplicated in this repository artifact. Tajawal 400/500/700 remains the approved baseline and must be provisioned/verified in Final R0.
