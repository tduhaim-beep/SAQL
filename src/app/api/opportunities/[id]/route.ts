import { applicationService } from "../../../../infrastructure/application-runtime";
import { apiResult } from "../../application-http";

export function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  return apiResult(async () => applicationService().publishedOpportunity((await context.params).id));
}
