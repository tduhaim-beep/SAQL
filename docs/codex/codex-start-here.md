# Codex Start Here — SAQL Pilot v2.0 / Slice02

## Mandatory read order
1. `/AGENTS.md`
2. `docs/requirements/current-baselines.md`
3. `docs/implementation-control/README.md`
4. `docs/architecture/domain-map-v2.md` and `module-boundaries.md`
5. `docs/security/authorization-baseline.md`
6. `docs/design/brand-and-rtl-baseline.md`
7. Relevant requirement/state/permission/scoring rows for the requested task

## Historical / Supporting context only
`docs/reconciliation/pre-r0-reconciliation.md` records the earlier foundation phase. It is not part of the mandatory current read order and does not govern the approved Slice01 task.

## Current task boundary
Slice01 is G8 ACCEPTED / MERGED at `6c6772c25593f2d0454ea779eec37a18b822bee2` with post-merge Hosted CI GREEN. Read the portable execution pack's `00_READ_FIRST.md` fully, then its approved `19_Slice02_Training_Journey_Readiness_Bridge_Task_Packet_v0.1_AR.docx`, current-state snapshot and state/permission/traceability controls. The sources stay outside the repository and are read-only.

G3 releases **S2-TRN-READY-001 v0.1 only**, on `slice-02/training-journey-readiness`, descending from that merge. The approved §4 Control Delta allows authorized own-organization Accept to create exactly one PENDING_START journey atomically with correlated audit, for configured AcademicOverlayMode=NOT_APPLICABLE only. Read `docs/slices/S2-TRN-READY-001_BUILDER_HANDOFF.md` for implementation/evidence boundaries.

Stop after Builder tests and exact-commit Hosted CI evidence. Independent Validation (G4–G5), triggered Security (G6), Closeout/Founder Acceptance (G7–G8), merge and Production remain separate and NOT STARTED by Builder. No ACTIVE/Actual Start, Plan Instance, supervisor assignment, Academic Overlay, Request Information, scoring, identity provider or further slice is authorized. Any requirement gap or missing authority means STOP; do not guess.

## Historical / Supporting context only
`docs/slices/S1-APL-CORE-001_BUILDER_HANDOFF.md` records the earlier Builder submission. The execution pack's Slice01 G7/G8 Closeout is the current accepted baseline evidence.

## Do not do
- Do not use the old University-centric v1 module layout as product truth.
- Do not use previous brand/logo/token/site references as the current visual source.
- Do not invent transitions, permissions, scoring formulas, verification policy, retention policy, or missing data-model relations.
- Do not build deferred AI, payments, full ATS/LMS, deep integrations or native mobile apps.
- Do not use production data or credentials.

## Task packet required
Every task must include: requirement IDs, owning domain, current/target state, actor, authorization condition, acceptance criteria, tests, UI/RTL target and explicit out-of-scope.

If any item is unknown, stop and create a Requirement Gap.
