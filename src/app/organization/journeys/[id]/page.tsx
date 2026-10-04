import { journeyPage } from "../../../journey-page";
export default async function OrganizationJourneyPage({ params }: { params: Promise<{ id: string }> }) {
  return journeyPage((await params).id, true);
}
