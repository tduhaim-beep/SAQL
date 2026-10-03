# exceptions

Pilot v2.0 domain boundary for tracked Training Journey / Academic Overlay exceptions. This module remains a foundation boundary only; no Business Slice behavior is implemented here.

## Approved R0 persistence baseline — RG-R0-DATA-001 CLOSED

The approved minimal persistence model is `TrainingException` in `prisma/schema.prisma`:

- every exception belongs to one `TrainingJourney` (`journeyId` required);
- `academicOverlayId` is optional and is used only when the exception has academic context;
- `typeCode` is an open string code in R0 — no closed taxonomy is invented;
- `status` uses the approved `ExceptionStatus` lifecycle;
- owner, severity, impact and `blocking` are recorded before/when the exception enters active handling;
- escalation is an audited flag/action, not a lifecycle state;
- waiting party/action and resolution actor/summary/evidence are persisted when applicable;
- file binaries are not stored in `resolutionEvidence`; it is metadata/reference JSON only;
- historical business actions remain in `AuditEvent`; no separate exception-history table is introduced for R0.

## Invariants

1. If `academicOverlayId` is present, that overlay must belong to the same `journeyId`. This cross-record invariant is enforced in application/domain logic and must receive a negative test before the Exceptions slice is implemented.
2. Open blocking exceptions prevent only transitions explicitly governed by the current control pack; they do not replace the Training Journey state.
3. Physical deletion of an exception is not a lifecycle operation. The journey relation uses `onDelete: Restrict`; actor relations use `SetNull` to preserve historical records.
4. `severityCode` and `typeCode` remain configuration/string codes until a newer approved source locks a taxonomy.

Keep business rules in `domain/`, use cases in `application/`, adapters in `infrastructure/`, and web/API concerns in `presentation/`.
