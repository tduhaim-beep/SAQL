import { slicePage } from "../../application-page";
import { ApplicationList } from "../../application-ui";

export default function ApplicantsPage() {
  return slicePage("المتقدمون", "ORG-R05", async (service, actor) => <ApplicationList officer applications={await service.applicants(actor)} />);
}
