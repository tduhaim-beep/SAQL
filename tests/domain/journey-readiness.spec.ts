import { describe, expect, it } from "vitest";
import { pendingJourney, type AcceptedPlacement } from "../../src/modules/training-journey/domain/readiness";

const placement: AcceptedPlacement = { applicationId: "a", opportunityId: "o", traineeUserId: "s", organizationId: "org",
  programType: "INDEPENDENT_SUMMER", overlayMode: "NOT_APPLICABLE", applicationStatus: "ACCEPTED" };
describe("S2 approved acceptance/readiness separation", () => {
  it("AC-S2-02/05 derives only required links and PENDING_START", () => {
    expect(pendingJourney(placement)).toEqual({ applicationId: "a", opportunityId: "o", traineeUserId: "s", organizationId: "org",
      programType: "INDEPENDENT_SUMMER", overlayMode: "NOT_APPLICABLE", status: "PENDING_START" });
  });
  it.each(["APPLIED", "UNDER_REVIEW", "MORE_INFO_REQUIRED", "REJECTED", "WITHDRAWN"])("NEG-S2-01 denies non-accepted %s", (applicationStatus) => {
    expect(() => pendingJourney({ ...placement, applicationStatus })).toThrow("لا يمكن إنشاء رحلة قبل قبول الطلب.");
  });
  it.each(["REQUIRED", "OPTIONAL"] as const)("NEG-S2-05 denies academic mode %s", (overlayMode) => {
    expect(() => pendingJourney({ ...placement, overlayMode })).toThrow("مسار البرنامج الأكاديمي غير متاح في هذه المرحلة.");
  });
  it.each(["applicationId", "opportunityId", "traineeUserId", "organizationId"] as const)("AC-S2-02 denies absent %s", (key) => {
    expect(() => pendingJourney({ ...placement, [key]: "" })).toThrow("روابط الطلب المقبول غير مكتملة.");
  });
});
