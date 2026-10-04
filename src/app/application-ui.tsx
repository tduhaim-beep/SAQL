import Image from "next/image";
import Link from "next/link";
import type { ApplicationStatus } from "../modules/application/domain/lifecycle";
import type { ApplicationView } from "../modules/application/application/ports";

export const statusLabels: Record<ApplicationStatus, string> = {
  APPLIED: "تم التقديم", UNDER_REVIEW: "قيد المراجعة", MORE_INFO_REQUIRED: "معلومات إضافية مطلوبة",
  ACCEPTED: "مقبول", REJECTED: "مرفوض", WITHDRAWN: "مسحوب",
};

export function SliceScreen({ title, screenId, children }: { title: string; screenId: string; children: React.ReactNode }) {
  return <main className="application-shell" data-screen-id={screenId}>
    <header className="application-header">
      <Link href="/" aria-label="صقل — الرئيسية"><Image className="brand-logo" src="/brand/saql-horizontal-colour.svg" alt="صقل SAQL" width={2058} height={546} priority /></Link>
      <nav aria-label="مسارات الطلبات"><Link href="/applications">طلباتي</Link><Link href="/organization/applicants">المتقدمون</Link></nav>
    </header>
    <section className="application-card"><h1>{title}</h1>{children}</section>
  </main>;
}

export function Status({ status }: { status: ApplicationStatus }) {
  return <span className="application-status" data-status={status}>{statusLabels[status]}</span>;
}

export function ApplicationList({ applications, officer = false }: { applications: ApplicationView[]; officer?: boolean }) {
  if (!applications.length) return <p className="empty-state">لا توجد طلبات لعرضها.</p>;
  return <ul className="application-list">{applications.map((item) => <li key={item.id}>
    <div><Link href={`${officer ? "/organization/applicants" : "/applications"}/${item.id}`}>{item.opportunityTitle}</Link>
      <p>{officer ? item.studentName : item.organizationName}</p></div><Status status={item.status} />
  </li>)}</ul>;
}

export function ApplicationDetails({ application }: { application: ApplicationView }) {
  return <><div className="application-summary"><h2>{application.opportunityTitle}</h2><Status status={application.status} /></div>
    <dl className="application-facts"><div><dt>جهة التدريب</dt><dd>{application.organizationName}</dd></div>
      <div><dt>المتقدم</dt><dd>{application.studentName}</dd></div>
      <div><dt>تاريخ التقديم</dt><dd><time dateTime={application.createdAt}>{new Date(application.createdAt).toLocaleDateString("ar-SA")}</time></dd></div></dl>
  </>;
}
