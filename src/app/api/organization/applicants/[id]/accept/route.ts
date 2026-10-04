import { mutateApplication } from "../../../../application-http";

export function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return mutateApplication(request, async (service, actor) => service.accept(actor, (await context.params).id));
}
