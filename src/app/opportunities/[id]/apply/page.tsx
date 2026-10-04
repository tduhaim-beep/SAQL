import { requireStudent } from "../../../../identity/actor";
import { ApplyForm } from "../../../application-actions";
import { slicePage } from "../../../application-page";

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return slicePage("التقديم على الفرصة", "STU-D04", async (service, actor) => {
    requireStudent(actor); const item = await service.publishedOpportunity(id);
    return <><h2>{item.titleAr}</h2><p>{item.organizationName}</p><ApplyForm opportunityId={id} /></>;
  });
}
