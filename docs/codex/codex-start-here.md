# Codex Start Here — SAQL Pilot v2.0 / Pre-R0

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
The repository is in Pre-R0 reconciliation. Complete Final R0 Verification only after the documented blockers are resolved. Do not start Slice 1 or implement business features in the same task.

## Do not do
- Do not use the old University-centric v1 module layout as product truth.
- Do not use previous brand/logo/token/site references as the current visual source.
- Do not invent transitions, permissions, scoring formulas, verification policy, retention policy, or missing data-model relations.
- Do not build deferred AI, payments, full ATS/LMS, deep integrations or native mobile apps.
- Do not use production data or credentials.

## Task packet required
Every task must include: requirement IDs, owning domain, current/target state, actor, authorization condition, acceptance criteria, tests, UI/RTL target and explicit out-of-scope.

If any item is unknown, stop and create a Requirement Gap.
