import type { ApplicationCommand, ApplicationStatus } from "../domain/lifecycle";

export type ApplicationScope = { studentUserId: string } | { organizationIds: string[] };
export interface ApplicationHistory {
  action: string;
  createdAt: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  rejectionReason: string | null;
}
export interface ApplicationView {
  id: string;
  studentUserId: string;
  studentName: string;
  opportunityId: string;
  opportunityTitle: string;
  organizationId: string;
  organizationName: string;
  status: ApplicationStatus;
  createdAt: string;
  history: ApplicationHistory[];
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
