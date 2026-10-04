import { slicePage } from "../application-page";
import { ApplicationList } from "../application-ui";

export default function MyApplicationsPage() {
  return slicePage("طلباتي", "STU-D07", async (service, actor) => <ApplicationList applications={await service.myApplications(actor)} />);
}
