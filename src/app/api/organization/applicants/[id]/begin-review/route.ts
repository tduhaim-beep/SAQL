import { mutateApplication } from "../../../../application-http";

export function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return mutateApplication(request, async (service, actor) => service.beginReview(actor, (await context.params).id));
}
