# Codex Start Here — SAQL Pilot v2.0 / Slice01 G3

## Mandatory read order
1. `/AGENTS.md`
2. `docs/requirements/current-baselines.md`
3. `docs/implementation-control/README.md`
4. `docs/architecture/domain-map-v2.md` and `module-boundaries.md`
5. `docs/security/authorization-baseline.md`
6. `docs/design/brand-and-rtl-baseline.md`
7. `docs/reconciliation/pre-r0-reconciliation.md`
8. Relevant requirement/state/permission/scoring rows for the requested task

## Current task boundary
Final R0 passed at `9b44609aa58f2d9e221bb7011b5b20238ff4313c`. Founder approval in Master Index v2.6, AER v2.5, Business Development Handoff v1.0 and approved `12_Slice01_Application_Core_Task_Packet_v0.1_AR.md` releases **S1-APL-CORE-001 v0.1 only**, on `slice-01/application-core`. Earlier Pre-R0 Business Coding HOLD instructions are historical for this approved scope.

Read `docs/slices/S1-APL-CORE-001_BUILDER_HANDOFF.md` and the approved packet before changing this slice. Builder stops after implementation, required tests and Hosted CI evidence. G4 Review, G5 Test Agent, G6 independent Security Review, G7 Evidence governance and G8 Founder Acceptance remain NOT STARTED. No merge, later slice, Training Journey, Request Information, identity provider, schema migration or scope expansion is authorized.

## Do not do
- Do not use the old University-centric v1 module layout as product truth.
- Do not use previous brand/logo/token/site references as the current visual source.
- Do not invent transitions, permissions, scoring formulas, verification policy, retention policy, or missing data-model relations.
- Do not build deferred AI, payments, full ATS/LMS, deep integrations or native mobile apps.
- Do not use production data or credentials.

## Task packet required
Every task must include: requirement IDs, owning domain, current/target state, actor, authorization condition, acceptance criteria, tests, UI/RTL target and explicit out-of-scope.

If any item is unknown, stop and create a Requirement Gap.
