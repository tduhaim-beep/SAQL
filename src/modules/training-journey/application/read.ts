import { officerOrganizations, requireStudent, type Actor } from "../../../identity/actor";
import { ApplicationError } from "../../../shared/application-error";
import type { ProgramType } from "../domain/readiness";

export type JourneyScope = { traineeUserId: string } | { organizationIds: string[] };
export interface JourneyView {
  id: string;
  studentName: string;
  opportunityTitle: string;
  organizationName: string;
  programType: ProgramType;
  status: "PENDING_START";
  createdAt: string;
}
export interface JourneyReader { find(id: string, scope: JourneyScope): Promise<JourneyView | null> }

export class JourneyService {
  constructor(private readonly reader: JourneyReader) {}
  private async find(id: string, scope: JourneyScope) {
    if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id)) throw new ApplicationError("INVALID_RESOURCE", 400, "معرف غير صالح.");
    const item = await this.reader.find(id, scope);
    if (!item) throw new ApplicationError("NOT_FOUND", 404, "الرحلة غير متاحة.");
    return item;
  }
  async own(actor: Actor | null, id: string) { return this.find(id, { traineeUserId: requireStudent(actor).userId }); }
  async organization(actor: Actor | null, id: string) { return this.find(id, { organizationIds: officerOrganizations(actor) }); }
}
