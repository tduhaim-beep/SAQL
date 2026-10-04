import { slicePage } from "../../application-page";
import { ApplicationDetails } from "../../application-ui";
import { ApplicationActions } from "../../application-actions";

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return slicePage("تفاصيل الطلب", "STU-D08", async (service, actor) => {
    const item = await service.myApplication(actor, id);
    return <><ApplicationDetails application={item} /><ApplicationActions id={id} status={item.status} /></>;
  });
}
