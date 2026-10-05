import { journeyPage } from "../../journey-page";
export default async function JourneyPage({ params }: { params: Promise<{ id: string }> }) {
  return journeyPage((await params).id);
}
