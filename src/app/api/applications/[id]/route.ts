import { actorFromHeaders, applicationService } from "../../../../infrastructure/application-runtime";
import { apiResult } from "../../application-http";

export function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  return apiResult(async () => applicationService().myApplication(await actorFromHeaders(request.headers), (await context.params).id));
}
