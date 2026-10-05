import { officerOrganizations, requireStudent, type Actor } from "../../../identity/actor";
import { ApplicationError } from "../../../shared/application-error";
import type { PublishedOpportunityReader } from "../../opportunity/application/read";
import { planApplicationTransition, type ApplicationCommand } from "../domain/lifecycle";
import type { AcceptanceCoordinator, ApplicationScope, ApplicationStore } from "./ports";

export function resourceId(value: string): string {
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(value)) throw new ApplicationError("INVALID_RESOURCE", 400, "معرف غير صالح.");
  return value;
}

export class ApplicationService {
  constructor(private readonly store: ApplicationStore, private readonly opportunities: PublishedOpportunityReader,
    private readonly acceptance: AcceptanceCoordinator) {}

  async publishedOpportunity(id: string) {
    const result = await this.opportunities.findPublished(resourceId(id));
    if (!result) throw new ApplicationError("NOT_FOUND", 404, "الفرصة غير متاحة.");
    return result;
  }

  async submit(actor: Actor | null, opportunityId: string) {
    const student = requireStudent(actor);
    await this.publishedOpportunity(opportunityId);
    return this.store.submitWithAudit(student.userId, opportunityId);
  }

  async myApplications(actor: Actor | null) {
    return this.store.list({ studentUserId: requireStudent(actor).userId });
  }

  async applicants(actor: Actor | null) {
    return this.store.list({ organizationIds: officerOrganizations(actor) });
  }

  async myApplication(actor: Actor | null, id: string) {
    return this.findScoped(id, { studentUserId: requireStudent(actor).userId });
  }

  async applicant(actor: Actor | null, id: string) {
    return this.findScoped(id, { organizationIds: officerOrganizations(actor) });
  }

  private async findScoped(id: string, scope: ApplicationScope) {
    const result = await this.store.find(resourceId(id), scope);
    if (!result) throw new ApplicationError("NOT_FOUND", 404, "الطلب غير متاح.");
    return result;
  }

  private async transition(actor: Actor | null, id: string, command: Exclude<ApplicationCommand, "accept">, reason?: string) {
    const scope: ApplicationScope = command === "withdraw"
      ? { studentUserId: requireStudent(actor).userId }
      : { organizationIds: officerOrganizations(actor) };
    const current = await this.findScoped(id, scope);
    const next = planApplicationTransition(current.status, command, reason);
    if (!actor) throw new ApplicationError("UNAUTHENTICATED", 401, "يلزم سياق مستخدم مصرح له.");
    return this.store.transitionWithAudit({
      id, scope, actorUserId: actor.userId, command, expectedStatus: current.status, nextStatus: next.status,
      ...(next.rejectionReason !== undefined ? { rejectionReason: next.rejectionReason } : {}),
    });
  }

  beginReview(actor: Actor | null, id: string) { return this.transition(actor, id, "begin-review"); }
  async accept(actor: Actor | null, id: string) {
    const organizationIds = officerOrganizations(actor);
    if (!actor) throw new ApplicationError("UNAUTHENTICATED", 401, "يلزم سياق مستخدم مصرح له.");
    return this.acceptance.accept({ id: resourceId(id), organizationIds, actorUserId: actor.userId });
  }
  reject(actor: Actor | null, id: string, reason: string) { return this.transition(actor, id, "reject", reason); }
  withdraw(actor: Actor | null, id: string) { return this.transition(actor, id, "withdraw"); }
}
