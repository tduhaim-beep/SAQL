# SAQL State Machines v2.0 — Draft

## SM-VER — Verification & Trust
**States:** REGISTERED, PENDING_VERIFICATION, MORE_INFO_REQUIRED, VERIFIED, SUSPENDED, REJECTED

| From | To | Command/Event | Actor | Guard | Requirement refs |
|---|---|---|---|---|---|
| REGISTERED | PENDING_VERIFICATION | Submit verification package | Applicant/Organization Representative | Required verification information present | BR-VER-001, BR-VER-007 |
| PENDING_VERIFICATION | MORE_INFO_REQUIRED | Request more information | Verification Admin | Reason required; no verification granted | BR-VER-007 |
| MORE_INFO_REQUIRED | PENDING_VERIFICATION | Resubmit information | Applicant/Organization Representative | Requested information supplied | BR-VER-007 |
| PENDING_VERIFICATION | VERIFIED | Approve verification | Verification Admin | Verification criteria satisfied; audit required | BR-VER-001, BR-VER-003 |
| PENDING_VERIFICATION | REJECTED | Reject verification | Verification Admin | Reason required; audit required | BR-VER-001, BR-VER-007 |
| VERIFIED | SUSPENDED | Suspend verified account/entity | Authorized Platform Admin | Reason + privileged audit required | BR-VER-006, BR-ADM-009 |
| SUSPENDED | VERIFIED | Restore verified state | Authorized Platform Admin | Review completed; reason + audit required | BR-ADM-009 |

## SM-OPP — Opportunity Lifecycle
**States:** DRAFT, PUBLISHED, CLOSED, FILLED, EXPIRED, SUSPENDED

| From | To | Command/Event | Actor | Guard | Requirement refs |
|---|---|---|---|---|---|
| DRAFT | PUBLISHED | Publish opportunity | Organization Training Officer | Organization verified; required opportunity fields valid; moderation rules pass | BR-OPP-001..007 |
| PUBLISHED | CLOSED | Close opportunity to new applications | Organization Training Officer | Existing applications retained | BR-OPP-003, BR-OPP-009 |
| PUBLISHED | FILLED | Mark capacity filled | Organization Training Officer/System | Accepted/allocated capacity satisfies configured seat rule; no new applications | BR-OPP-004, BR-OPP-009 |
| PUBLISHED | EXPIRED | Expire opportunity | System | Configured application/availability period elapsed | BR-OPP-003 |
| PUBLISHED | SUSPENDED | Suspend public opportunity | Moderation Admin | Policy/moderation reason + audit | BR-OPP-007, BR-ADM-004 |
| SUSPENDED | DRAFT | Return for correction | Moderation Admin/Organization Training Officer | Issue corrected; republish requires normal publish guard | BR-OPP-007 |

## SM-APL — Application Lifecycle
**States:** APPLIED, UNDER_REVIEW, MORE_INFO_REQUIRED, ACCEPTED, REJECTED, WITHDRAWN

| From | To | Command/Event | Actor | Guard | Requirement refs |
|---|---|---|---|---|---|
| APPLIED | UNDER_REVIEW | Begin review | Organization Training Officer | Organization owns opportunity; application visible in scope | BR-APL-004, BR-APL-005 |
| UNDER_REVIEW | MORE_INFO_REQUIRED | Request information | Organization Training Officer | Request recorded; applicant notified | BR-APL-005 |
| MORE_INFO_REQUIRED | UNDER_REVIEW | Submit requested information | Student/Trainee | Applicant owns application; requested information supplied | BR-APL-005 |
| UNDER_REVIEW | ACCEPTED | Accept applicant | Organization Training Officer | Decision authority valid; audit retained | BR-APL-005, BR-GOV-001 |
| UNDER_REVIEW | REJECTED | Reject applicant | Organization Training Officer | Reason captured per policy; history retained | BR-APL-005, BR-APL-008 |
| APPLIED | WITHDRAWN | Withdraw application | Student/Trainee | Own application; before ACCEPTED | BR-APL-008 |
| UNDER_REVIEW | WITHDRAWN | Withdraw application | Student/Trainee | Own application; before ACCEPTED | BR-APL-008 |
| MORE_INFO_REQUIRED | WITHDRAWN | Withdraw application | Student/Trainee | Own application; before ACCEPTED | BR-APL-008 |

## SM-TRN — Training Journey Lifecycle
**States:** PENDING_START, ACTIVE, ON_HOLD, COMPLETION_PENDING, COMPLETED, WITHDRAWN, TERMINATED

| From | To | Command/Event | Actor | Guard | Requirement refs |
|---|---|---|---|---|---|
| PENDING_START | ACTIVE | Confirm actual training start | Authorized Actor | Readiness satisfied; actual start recorded; required plan/supervisor present | BR-TRN-004..007 |
| PENDING_START | WITHDRAWN | Withdraw before start | Student/Organization Authorized Role | Reason required; history retained | BR-TRN-009 |
| ACTIVE | ON_HOLD | Place training on hold | Authorized Journey Owner | Reason + expected action; blocking/exception context if applicable | BR-TRN-009, BR-EXC-002 |
| ON_HOLD | ACTIVE | Resume training | Authorized Journey Owner | Blocking condition resolved or approved continuation | BR-TRN-009 |
| ACTIVE | COMPLETION_PENDING | Begin completion review | System/Organization Training Officer | Training period/execution reached completion review; outstanding final items may remain | BR-TRN-010 |
| COMPLETION_PENDING | COMPLETED | Complete training journey | Organization Training Officer/System | Required plan tasks/evidence/field evaluation satisfied; no blocking exception | BR-TRN-011, BR-EXC-007 |
| COMPLETION_PENDING | ACTIVE | Extend/resume active training | Organization Training Officer | Approved extension/change; dates and audit updated | BR-TRN-013 |
| ACTIVE | TERMINATED | Terminate early | Authorized Organization Role | Reason mandatory; exception/audit preserved | BR-TRN-009, BR-EXC-006 |
| ON_HOLD | TERMINATED | Terminate from hold | Authorized Organization Role | Reason mandatory; exception/audit preserved | BR-TRN-009, BR-EXC-006 |
| COMPLETION_PENDING | TERMINATED | Terminate before completion | Authorized Organization Role | Reason mandatory; audit preserved | BR-TRN-009 |

## SM-PLANT — Training Plan Template Version Lifecycle
**States:** DRAFT, PUBLISHED, ARCHIVED

| From | To | Command/Event | Actor | Guard | Requirement refs |
|---|---|---|---|---|---|
| DRAFT | PUBLISHED | Publish plan version | Organization Training Officer | Plan structure valid; required completion/scoring configuration valid | BR-TPL-003..010, BR-SCR-001..007 |
| PUBLISHED | ARCHIVED | Archive plan version | Organization Training Officer | Existing plan instances unaffected; history retained | BR-TPL-015 |
| PUBLISHED | DRAFT | Create new version (not mutate current) | Organization Training Officer | New version references parent; published version remains immutable | BR-TPL-014, BR-TPL-015 |
| ARCHIVED | DRAFT | Clone into new version | Organization Training Officer | Creates a new draft; archived version remains historical | BR-TPL-011, BR-TPL-015 |

## SM-PLANI — Training Plan Instance Lifecycle
**States:** ASSIGNED, ACTIVE, COMPLETION_PENDING, COMPLETED, CANCELLED

| From | To | Command/Event | Actor | Guard | Requirement refs |
|---|---|---|---|---|---|
| ASSIGNED | ACTIVE | Activate assigned plan instance | System/Organization Training Officer | Training Journey starts; snapshot/version frozen | BR-TPL-012..014 |
| ACTIVE | COMPLETION_PENDING | Submit plan for completion | System/Organization Training Officer | Required stages/tasks ready for completion validation | BR-TPL-010, BR-TPL-016 |
| COMPLETION_PENDING | COMPLETED | Complete plan instance | System | Mandatory completion rules and required assessments satisfied | BR-TPL-010, BR-SCR-005 |
| ASSIGNED | CANCELLED | Cancel before execution | Organization Training Officer | Journey cancelled/reassigned; reason retained | BR-TPL-012 |
| ACTIVE | CANCELLED | Cancel due to journey termination | System/Organization Training Officer | Training Journey terminated; history retained | BR-TRN-009 |

## SM-TASK — Training Task / Evidence Lifecycle
**States:** NOT_STARTED, IN_PROGRESS, SUBMITTED, REVISION_REQUIRED, COMPLETED, CANCELLED

| From | To | Command/Event | Actor | Guard | Requirement refs |
|---|---|---|---|---|---|
| NOT_STARTED | IN_PROGRESS | Begin task | Assigned Actor | Task assigned and plan/stage active | BR-TPL-005..008 |
| NOT_STARTED | SUBMITTED | Submit evidence directly | Student/Trainee/Assigned Actor | Evidence/completion method satisfied | BR-TPL-008, BR-TPL-009 |
| IN_PROGRESS | SUBMITTED | Submit task/evidence | Student/Trainee/Assigned Actor | Required evidence present | BR-TPL-009 |
| SUBMITTED | REVISION_REQUIRED | Request revision | Authorized Reviewer | Feedback required; prior submission retained | BR-SUP-003, BR-STU-007 |
| REVISION_REQUIRED | SUBMITTED | Resubmit | Assigned Actor | New attempt retained with history | BR-STU-007 |
| SUBMITTED | COMPLETED | Accept/complete task | Authorized Reviewer/System | Completion/assessment rule satisfied | BR-TPL-010, BR-SCR-005 |
| IN_PROGRESS | COMPLETED | Confirm non-evidence task completion | Authorized Actor/Reviewer | Configured completion method allows direct completion | BR-TPL-008 |
| NOT_STARTED | CANCELLED | Cancel task by controlled plan change | Authorized Plan/Journey Owner | Change reason recorded; no silent deletion | BR-CFG-005, BR-GOV-006 |

## SM-ALN — Academic Alignment Lifecycle
**States:** DRAFT, IN_REVIEW, ADJUSTMENT_REQUESTED, APPROVED, APPROVED_WITH_SUPPLEMENT, REJECTED

| From | To | Command/Event | Actor | Guard | Requirement refs |
|---|---|---|---|---|---|
| DRAFT | IN_REVIEW | Submit alignment for review | University Training Officer/System | Framework and plan versions fixed for review | BR-ALN-001..004 |
| IN_REVIEW | APPROVED | Approve alignment | University Authorized Approver | Coverage acceptable; decision audited | BR-ALN-007 |
| IN_REVIEW | APPROVED_WITH_SUPPLEMENT | Approve with academic supplement | University Authorized Approver | Supplement requirements recorded/versioned | BR-ALN-005, BR-ALN-007 |
| IN_REVIEW | ADJUSTMENT_REQUESTED | Request plan adjustment | University Authorized Approver | Gap/partial coverage identified; reason required | BR-ALN-006, BR-ALN-007 |
| ADJUSTMENT_REQUESTED | IN_REVIEW | Resubmit adjusted alignment | Organization/University Training Officer | New/updated plan or supplement version linked | BR-ALN-006, BR-ALN-008 |
| IN_REVIEW | REJECTED | Reject alignment | University Authorized Approver | Reason required; history retained | BR-ALN-007, BR-ALN-009 |

## SM-ACA — Academic Overlay Lifecycle
**States:** NOT_STARTED, APPROVAL_PENDING, MORE_INFO_REQUIRED, APPROVED, ACADEMIC_ACTIVE, COMPLETION_PENDING, CLOSED, REJECTED

**Notes:** AcademicParticipationMode = INSTITUTIONAL / GUEST / SELF_DOCUMENTED. AcademicTrustState = NONE / STUDENT_REPORTED / EVIDENCE_UPLOADED / UNIVERSITY_VERIFIED. Self-documented evidence must not transition to APPROVED or CLOSED as University Verified without a verified authorized university actor.

| From | To | Command/Event | Actor | Guard | Requirement refs |
|---|---|---|---|---|---|
| NOT_STARTED | APPROVAL_PENDING | Create academic overlay / request approval | Student/University/System | Program type requires/permits overlay; university/program context captured | BR-ACA-001..005 |
| APPROVAL_PENDING | MORE_INFO_REQUIRED | Request academic information | University Authorized Role | Request scoped to case; reason required | BR-ACA-005 |
| MORE_INFO_REQUIRED | APPROVAL_PENDING | Provide requested information | Student/Organization | Requested information/evidence supplied | BR-ACA-005, BR-ACA-013 |
| APPROVAL_PENDING | APPROVED | Approve academic placement/overlay | Verified University Authorized Role | Authorized institutional/guest actor; decision audited | BR-ACA-005, BR-ACA-014 |
| APPROVAL_PENDING | REJECTED | Reject academic placement/overlay | Verified University Authorized Role | Reason required; history retained | BR-ACA-005 |
| APPROVED | ACADEMIC_ACTIVE | Activate academic supervision | University/System | Required academic supervisor/framework/alignment present per program configuration | BR-ACA-006..008 |
| ACADEMIC_ACTIVE | COMPLETION_PENDING | Begin academic completion review | University/System | Training completion or academic requirements trigger review | BR-ACA-011 |
| COMPLETION_PENDING | CLOSED | Close academic record | University Authorized Role | Academic completion rules satisfied; grade/closure audit recorded | BR-ACA-010..012 |

## SM-EXC — Exception Lifecycle
**States:** OPEN, IN_PROGRESS, WAITING_EXTERNAL, RESOLVED, CLOSED

**Notes:** Severity and Blocking are attributes, not states. Escalation is an audited action/flag. An open blocking exception prevents only the transitions explicitly governed by its rule; it does not overwrite Training Journey state.

| From | To | Command/Event | Actor | Guard | Requirement refs |
|---|---|---|---|---|---|
| OPEN | IN_PROGRESS | Accept/own exception | Assigned Owner | Owner and severity/impact/blocking recorded | BR-EXC-001..003 |
| IN_PROGRESS | WAITING_EXTERNAL | Wait for external action | Assigned Owner | Waiting party/action recorded | BR-EXC-002, BR-EXC-004 |
| WAITING_EXTERNAL | IN_PROGRESS | External response received | Assigned Owner/System | Required external input received | BR-EXC-004 |
| IN_PROGRESS | RESOLVED | Record resolution | Assigned Owner | Resolution + actor + evidence recorded | BR-EXC-003 |
| RESOLVED | CLOSED | Close exception | Authorized Owner/System | Resolution accepted; history retained | BR-EXC-008 |

