import type { ApplicationCommand, ApplicationStatus } from "../domain/lifecycle";

export type ApplicationScope = { studentUserId: string } | { organizationIds: string[] };
// Approved presentation DTO only. Internal AuditEvent evidence is retained in
// persistence and must not be serialized into Slice01 API or screen responses.
export interface ApplicationView {
  id: string;
  studentName: string;
  opportunityTitle: string;
  organizationName: string;
  status: ApplicationStatus;
  createdAt: string;
}

export interface ApplicationStore {
  list(scope: ApplicationScope): Promise<ApplicationView[]>;
  find(id: string, scope: ApplicationScope): Promise<ApplicationView | null>;
  submitWithAudit(studentUserId: string, opportunityId: string): Promise<ApplicationView>;
  transitionWithAudit(input: {
    id: string; scope: ApplicationScope; actorUserId: string; command: ApplicationCommand;
    expectedStatus: ApplicationStatus; nextStatus: ApplicationStatus; rejectionReason?: string;
  }): Promise<ApplicationView>;
}
