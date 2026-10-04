import { ApplicationError } from "../../../../../../shared/application-error";
import { mutateApplication } from "../../../../application-http";

export function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return mutateApplication(request, async (service, actor, body) => {
    if (typeof body.reason !== "string" || !body.reason.trim() || body.reason.length > 1000) {
      throw new ApplicationError("REASON_REQUIRED", 400, "أدخل سبب الرفض، بحد أقصى ١٠٠٠ حرف.");
    }
    return service.reject(actor, (await context.params).id, body.reason);
  }, ["reason"]);
}
