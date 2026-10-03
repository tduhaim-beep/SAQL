# SAQL Scoring & Calculation Rulebook v2.0 — Draft

Status: Draft for approval. Rules marked PROPOSED are not implementation-authoritative until approved.

## SCR-R01 — Internal scale
- **Status:** PROPOSED FOR APPROVAL
- **Rule:** All numeric scores are stored/calculated on a normalized 0–100 scale in addition to the original input form.
- **Requirements:** BR-SCR-001..008

## SCR-R02 — Pass/Fail
- **Status:** PROPOSED FOR APPROVAL
- **Rule:** Pass/Fail is completion-only by default. It contributes numerically only when the plan owner explicitly assigns a numeric contribution; if numeric mapping is enabled, Pass=100 and Fail=0.
- **Requirements:** BR-SCR-001, BR-SCR-005

## SCR-R03 — Points normalization
- **Status:** PROPOSED FOR APPROVAL
- **Rule:** Points normalized score = earned points / maximum points × 100. Maximum must be >0.
- **Requirements:** BR-SCR-001, BR-SCR-002

## SCR-R04 — Percentage
- **Status:** PROPOSED FOR APPROVAL
- **Rule:** Percentage inputs must be 0–100 and use the entered value as normalized score.
- **Requirements:** BR-SCR-001, BR-SCR-002

## SCR-R05 — Rating scale
- **Status:** PROPOSED FOR APPROVAL
- **Rule:** Rating scale normalized score = selected value / maximum scale value × 100. Pilot supports positive integer scales such as 1–5.
- **Requirements:** BR-SCR-001, BR-SCR-002

## SCR-R06 — Rubric
- **Status:** PROPOSED FOR APPROVAL
- **Rule:** Rubric score = weighted sum of criterion normalized scores. Criterion weights must total 100% before the rubric can be published.
- **Requirements:** BR-SCR-006, BR-SCR-007

## SCR-R07 — Task/assessment weights
- **Status:** PROPOSED FOR APPROVAL
- **Rule:** Within any scored container, positive weights must total 100%. Optional/non-scored items carry weight 0 in Pilot v2 unless a later configuration rule is approved.
- **Requirements:** BR-SCR-003, BR-SCR-004

## SCR-R08 — Stage score
- **Status:** PROPOSED FOR APPROVAL
- **Rule:** Stage score = weighted sum of completed scored items within the stage. If the stage has no scored items, it is completion-only and contributes no numeric score.
- **Requirements:** BR-SCR-003, BR-SCR-004

## SCR-R09 — Final Training Score
- **Status:** PROPOSED FOR APPROVAL
- **Rule:** Final Training Score = weighted sum of scored stage results. Scored stage weights must total 100%; completion-only stages may have weight 0.
- **Requirements:** BR-SCR-004, BR-SCR-008

## SCR-R10 — Passing threshold
- **Status:** PROPOSED FOR APPROVAL
- **Rule:** Threshold evaluation uses unrounded internal precision. Display rounding must not change pass/fail result.
- **Requirements:** BR-SCR-005

## SCR-R11 — Precision & rounding
- **Status:** PROPOSED FOR APPROVAL
- **Rule:** Keep at least 4 decimal places internally; display one decimal place unless the assessment format requires an integer. Final displayed score is rounded half-up to 1 decimal.
- **Requirements:** BR-SCR-008

## SCR-R12 — Missing required score
- **Status:** PROPOSED FOR APPROVAL
- **Rule:** A required scored item without a final accepted score blocks the parent completion/final score. The system does not silently renormalize missing required weights.
- **Requirements:** BR-SCR-005, BR-TPL-010

## SCR-R13 — Optional scored items
- **Status:** PROPOSED FOR APPROVAL
- **Rule:** Pilot v2 does not support optional items with positive weight. If optional, weight must be 0; future weighted-option behavior requires a new approved rule.
- **Requirements:** BR-SCR-003, BR-SCR-004

## SCR-R14 — Resubmission
- **Status:** PROPOSED FOR APPROVAL
- **Rule:** Resubmission preserves all attempts. The latest accepted/evaluated attempt becomes the current score; earlier attempts remain historical. No averaging/highest-score rule is assumed unless explicitly configured later.
- **Requirements:** BR-STU-007, BR-GOV-006

## SCR-R15 — Override
- **Status:** PROPOSED FOR APPROVAL
- **Rule:** Score override requires an authorized owner, mandatory reason, original value retention, timestamp and audit. Organization roles cannot override Academic Grade; university roles cannot overwrite Organization Training Score.
- **Requirements:** BR-SCR-010, BR-GOV-001..006

## SCR-R16 — Version freeze
- **Status:** CURRENT REQUIREMENT + PROPOSED IMPLEMENTATION RULE
- **Rule:** Plan Version + Scoring Version are frozen for the journey at activation. New template weights do not recalculate active/closed journey scores automatically.
- **Requirements:** BR-SCR-009, BR-SCR-012, BR-TPL-014

## SCR-R17 — Academic grade separation
- **Status:** CURRENT REQUIREMENT
- **Rule:** Academic Grade is calculated only from the University Academic Framework/Academic scoring configuration. Organization Training Score may be an explicit input component but is never copied automatically as the grade.
- **Requirements:** BR-SCR-010, BR-SCR-011, BR-UAF-007

## SCR-R18 — Closed record immutability
- **Status:** CURRENT REQUIREMENT + PROPOSED IMPLEMENTATION RULE
- **Rule:** Closed/completed result is not recalculated because of later plan/framework changes. Any authorized correction creates an audited correction record rather than silent historical mutation.
- **Requirements:** BR-SCR-012, BR-GOV-006

