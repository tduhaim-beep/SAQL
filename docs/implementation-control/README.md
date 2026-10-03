# Implementation Control Pack v2.1

These files are the machine-readable control layer between approved business documentation and code. They are derived from Stage 08A v2.1; no new business rule may be inferred from this README.

- `STATE_MACHINES_V2.csv/.md` — allowed lifecycle transitions/guards/invariants.
- `PERMISSIONS_MATRIX_V2.csv` — role/resource/action/context decisions.
- `SCORING_RULEBOOK_V2.md` + CSV — scoring policy; proposed rules remain subject to explicit approval where marked.
- `SCORING_TEST_VECTORS_V2.csv` — calculation examples for automated tests.
- `TRACEABILITY_ACCEPTANCE_V2.csv` — maps 225 current requirements to domain/control/screen/permission/acceptance/test class.
- `TRACEABILITY_SUMMARY_V2.csv` — requirement counts by domain.

Repository schema state enums are checked against the state sets in `STATE_MACHINES_V2.csv`. `RG-R0-DATA-001` is closed by the approved minimal `TrainingException` persistence baseline documented in `docs/reconciliation/RG-R0-DATA-001-exceptions-persistence-decision.md`.

Do not silently “fix” a contradiction. Open a Requirement Gap.
