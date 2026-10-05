import { ApplicationError } from "../../../shared/application-error";

export type ProgramType = "COOPERATIVE_ACADEMIC" | "INDEPENDENT_SUMMER" | "GRADUATE_TAMHEER_LIKE";
export interface AcceptedPlacement {
  applicationId: string;
  opportunityId: string;
  traineeUserId: string;
  organizationId: string;
  programType: ProgramType;
  overlayMode: "REQUIRED" | "OPTIONAL" | "NOT_APPLICABLE";
  applicationStatus: string;
}

// S2-TRN-READY-001 §4: creation is a consequence of an authorized decision,
// not training start. Readiness prerequisites remain outside this slice.
export function pendingJourney(placement: AcceptedPlacement) {
  if (placement.applicationStatus !== "ACCEPTED") {
    throw new ApplicationError("INVALID_TRANSITION", 409, "لا يمكن إنشاء رحلة قبل قبول الطلب.");
  }
  if (placement.overlayMode !== "NOT_APPLICABLE") {
    throw new ApplicationError("UNSUPPORTED_ACADEMIC_PATH", 409, "مسار البرنامج الأكاديمي غير متاح في هذه المرحلة.");
  }
  const { applicationId, opportunityId, traineeUserId, organizationId, programType } = placement;
  if (![applicationId, opportunityId, traineeUserId, organizationId].every(Boolean)) {
    throw new ApplicationError("INVALID_PLACEMENT", 409, "روابط الطلب المقبول غير مكتملة.");
  }
  return { applicationId, opportunityId, traineeUserId, organizationId, programType,
    overlayMode: "NOT_APPLICABLE" as const, status: "PENDING_START" as const };
}
