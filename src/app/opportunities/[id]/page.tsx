import Link from "next/link";
import { slicePage } from "../../application-page";

export default async function OpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return slicePage("تفاصيل الفرصة", "PUB-08 / STU-D03", async (service, actor) => {
    const item = await service.publishedOpportunity(id);
    return <><p className="eyebrow">{item.organizationName}</p><h2>{item.titleAr}</h2><p className="opportunity-description">{item.descriptionAr}</p>
      {item.city && <p>الموقع: {item.city}</p>}
      {actor?.grants.some((grant) => grant.role === "STUDENT_TRAINEE") && <Link className="button-link" href={`/opportunities/${id}/apply`}>التقديم على الفرصة</Link>}</>;
  });
}
