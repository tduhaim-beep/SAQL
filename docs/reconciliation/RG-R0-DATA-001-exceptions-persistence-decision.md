# RG-R0-DATA-001 — Exceptions Persistence Decision

**Status:** CLOSED / APPROVED FOR R0 DATA-MODEL BASELINE  
**Decision date:** 3 October 2026  
**Scope:** persistence baseline only; no Business Slice implementation

## Source-derived constraints

Current approved sources require an Exception that can be attached to a Training Journey or Academic Overlay, with type, owner, lifecycle status, impact, Blocking flag, resolution actor/evidence, escalation support, and historical retention. The approved lifecycle is:

`OPEN → IN_PROGRESS → WAITING_EXTERNAL → RESOLVED → CLOSED`

Severity and Blocking are attributes, not states. Escalation is an audited action/flag.

## Approved persistence baseline

Use one Prisma model: `TrainingException`.

- `journeyId` — required operational root.
- `academicOverlayId` — optional academic context.
- `typeCode` — required string code; no closed enum/taxonomy at R0.
- `status` — `ExceptionStatus`, default `OPEN`.
- `ownerUserId` — nullable at creation; required by the business guard before active ownership/handling.
- `severityCode` — optional string code; no severity taxonomy invented at R0.
- `impactSummary` — optional persistence field; business guard requires impact to be recorded for active handling.
- `blocking` — Boolean, default `false`.
- `escalated` — Boolean, default `false`; escalation details/history remain audit events.
- `waitingParty`, `waitingAction` — optional.
- `resolutionSummary`, `resolutionActorUserId`, `resolutionEvidence` — optional until resolution.
- `resolutionEvidence` contains JSON metadata/references only, not file binaries.
- `createdAt`, `updatedAt` — timestamps.

## Relationships and deletion behavior

- `TrainingJourney 1 → many TrainingException`, with `onDelete: Restrict` to avoid silent historical loss.
- `AcademicOverlay 1 → many TrainingException` optional, with `onDelete: SetNull`.
- owner/resolution actor relations use `SetNull` to preserve exception history if an account is removed.
- `AuditEvent` remains the append-oriented action/history mechanism; no new history table is introduced for R0.

## Required invariant

If `academicOverlayId` is present, the Academic Overlay must belong to the same `journeyId`. This cannot be safely inferred from the UI and must be enforced in domain/application logic and covered by a negative test when the Exceptions slice is implemented.

## Explicitly not decided here

This decision does **not** define severity levels, SLA/deadlines, notification/escalation policy, additional type taxonomy, exception UI, or retention/delete policy. Those remain controlled by their own approved sources/gates.

## Gate effect

`RG-R0-DATA-001` is closed. The repository may proceed to reviewed baseline migration generation in the approved Node 24 + registry + PostgreSQL Final R0 environment. This closure does not itself constitute R0 PASS.
