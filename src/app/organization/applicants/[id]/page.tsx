import { slicePage } from "../../../application-page";
import { ApplicationDetails } from "../../../application-ui";
import { ApplicationActions } from "../../../application-actions";

export default async function ApplicantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return slicePage("تفاصيل المتقدم وقرار الطلب", "ORG-R06 / ORG-R07", async (service, actor) => {
    const item = await service.applicant(actor, id);
    return <><ApplicationDetails application={item} /><ApplicationActions officer id={id} status={item.status} /></>;
  });
}
