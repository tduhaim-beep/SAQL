import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { actorFromHeaders, journeyService } from "../infrastructure/application-runtime";
import type { JourneyView } from "../modules/training-journey/application/read";
import { ApplicationError } from "../shared/application-error";
import { SliceScreen } from "./application-ui";

const programs: Record<JourneyView["programType"], string> = {
  INDEPENDENT_SUMMER: "تدريب صيفي مستقل", COOPERATIVE_ACADEMIC: "تدريب تعاوني أكاديمي", GRADUATE_TAMHEER_LIKE: "تدريب خريجين",
};

export async function journeyPage(id: string, officer = false) {
  let content: React.ReactNode;
  try {
    const actor = await actorFromHeaders(new Headers(await headers()));
    const item = await (officer ? journeyService().organization(actor, id) : journeyService().own(actor, id));
    content = <><div className="application-summary"><h2>{item.opportunityTitle}</h2>
      <span className="application-status" data-status={item.status}>بانتظار بدء التدريب</span></div>
      <p>تم قبول الطلب وإنشاء الرحلة. التدريب لم يبدأ بعد.</p>
      <dl className="application-facts"><div><dt>جهة التدريب</dt><dd>{item.organizationName}</dd></div>
        <div><dt>المتدرب</dt><dd>{item.studentName}</dd></div>
        <div><dt>نوع البرنامج</dt><dd>{programs[item.programType]}</dd></div>
        <div><dt>تاريخ إنشاء الرحلة</dt><dd><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString("ar-SA")}</time></dd></div></dl></>;
  } catch (error) {
    if (!(error instanceof ApplicationError)) throw error;
    if (error.httpStatus === 404) notFound();
    content = <p role="alert">{error.message}</p>;
  }
  return <SliceScreen title="تفاصيل رحلة التدريب" screenId={officer ? "ORG-O02" : "STU-T01"}>{content}</SliceScreen>;
}
