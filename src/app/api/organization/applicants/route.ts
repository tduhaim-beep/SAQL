import { actorFromHeaders, applicationService } from "../../../../infrastructure/application-runtime";
import { apiResult } from "../../application-http";

export function GET(request: Request) {
  return apiResult(async () => applicationService().applicants(await actorFromHeaders(request.headers)));
}
