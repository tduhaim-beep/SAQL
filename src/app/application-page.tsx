import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Actor } from "../identity/actor";
import { actorFromHeaders, applicationService } from "../infrastructure/application-runtime";
import type { ApplicationService } from "../modules/application/application/service";
import { ApplicationError } from "../shared/application-error";
import { SliceScreen } from "./application-ui";

export async function slicePage(title: string, screenId: string, render: (service: ApplicationService, actor: Actor | null) => Promise<React.ReactNode>) {
  let content: React.ReactNode;
  try { content = await render(applicationService(), await actorFromHeaders(new Headers(await headers()))); }
  catch (error) {
    if (!(error instanceof ApplicationError)) throw error;
    if (error.httpStatus === 404) notFound();
    content = <p role="alert">{error.message}</p>;
  }
  return <SliceScreen title={title} screenId={screenId}>{content}</SliceScreen>;
}
