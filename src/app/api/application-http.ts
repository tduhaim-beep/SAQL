import { actorFromHeaders, applicationService } from "../../infrastructure/application-runtime";
import { ApplicationError } from "../../shared/application-error";
import type { Actor } from "../../identity/actor";
import type { ApplicationService } from "../../modules/application/application/service";

export async function apiResult(action: () => Promise<unknown>, successStatus = 200): Promise<Response> {
  try { return Response.json(await action(), { status: successStatus, headers: { "Cache-Control": "no-store" } }); }
  catch (error) {
    const known = error instanceof ApplicationError;
    return Response.json({ code: known ? error.code : "INTERNAL_ERROR", message: known ? error.message : "تعذر تنفيذ الطلب الآن." },
      { status: known ? error.httpStatus : 500, headers: { "Cache-Control": "no-store" } });
  }
}

export async function validatedBody(request: Request, keys: readonly string[]): Promise<Record<string, unknown>> {
  const target = new URL(request.url);
  // Next may expose an internal localhost request URL. The incoming HTTP Host
  // is the browser's destination and cannot be overridden by a cross-site fetch.
  const expectedOrigin = `${target.protocol}//${request.headers.get("host") ?? target.host}`;
  if (request.headers.get("origin") !== expectedOrigin) {
    throw new ApplicationError("INVALID_ORIGIN", 403, "مصدر الطلب غير مسموح.");
  }
  if (!request.headers.get("content-type")?.split(";")[0]?.trim().match(/^application\/json$/i)) {
    throw new ApplicationError("INVALID_BODY", 400, "صيغة الطلب غير صالحة.");
  }
  let text = "";
  let bytes = 0;
  const reader = request.body?.getReader();
  const decoder = new TextDecoder();
  if (reader) {
    for (;;) {
      const part = await reader.read();
      if (part.done) break;
      bytes += part.value.byteLength;
      if (bytes > 8192) { await reader.cancel(); throw new ApplicationError("INVALID_BODY", 400, "حجم الطلب غير مسموح."); }
      text += decoder.decode(part.value, { stream: true });
    }
    text += decoder.decode();
  }
  let body: unknown;
  try { body = JSON.parse(text); } catch { throw new ApplicationError("INVALID_BODY", 400, "صيغة الطلب غير صالحة."); }
  if (body === null || typeof body !== "object" || Array.isArray(body) || Object.keys(body).some((key) => !keys.includes(key))) {
    throw new ApplicationError("INVALID_BODY", 400, "حقول الطلب غير مسموحة.");
  }
  return body as Record<string, unknown>;
}

export function mutateApplication(request: Request, action: (service: ApplicationService, actor: Actor | null, body: Record<string, unknown>) => Promise<unknown>, keys: readonly string[] = [], successStatus = 200) {
  return apiResult(async () => {
    const body = await validatedBody(request, keys);
    const actor = await actorFromHeaders(request.headers);
    return action(applicationService(), actor, body);
  }, successStatus);
}
