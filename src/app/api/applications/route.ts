import { actorFromHeaders, applicationService } from "../../../infrastructure/application-runtime";
import { ApplicationError } from "../../../shared/application-error";
import { apiResult, mutateApplication } from "../application-http";

export function GET(request: Request) {
  return apiResult(async () => applicationService().myApplications(await actorFromHeaders(request.headers)));
}
export function POST(request: Request) {
  return mutateApplication(request, async (service, actor, body) => {
    if (typeof body.opportunityId !== "string") throw new ApplicationError("INVALID_BODY", 400, "حدد الفرصة.");
    return service.submit(actor, body.opportunityId);
  }, ["opportunityId"], 201);
}
