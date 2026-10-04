import { ApplicationError } from "../../../shared/application-error";

export type ApplicationStatus = "APPLIED" | "UNDER_REVIEW" | "MORE_INFO_REQUIRED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
export type ApplicationCommand = "begin-review" | "accept" | "reject" | "withdraw";

// S1-APL-CORE-001 / SM-APL: Request Information and every other transition remain excluded.
export function planApplicationTransition(status: ApplicationStatus, command: ApplicationCommand, reason?: string): {
  status: ApplicationStatus; rejectionReason?: string;
} {
  if (command === "begin-review" && status === "APPLIED") return { status: "UNDER_REVIEW" };
  if (command === "accept" && status === "UNDER_REVIEW") return { status: "ACCEPTED" };
  if (command === "reject" && status === "UNDER_REVIEW") {
    if (!reason?.trim()) throw new ApplicationError("REASON_REQUIRED", 400, "أدخل سبب الرفض.");
    return { status: "REJECTED", rejectionReason: reason.trim() };
  }
  if (command === "withdraw" && (status === "APPLIED" || status === "UNDER_REVIEW")) return { status: "WITHDRAWN" };
  throw new ApplicationError("INVALID_TRANSITION", 409, "لا يسمح وضع الطلب الحالي بهذا الإجراء.");
}
