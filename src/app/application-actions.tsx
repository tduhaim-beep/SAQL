"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ApplicationStatus } from "../modules/application/domain/lifecycle";

async function execute(url: string, body: Record<string, string>) {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const result: { id?: string; message?: string } = await response.json();
  if (!response.ok) throw new Error(result.message ?? "تعذر تنفيذ الطلب الآن.");
  return result;
}

export function ApplyForm({ opportunityId }: { opportunityId: string }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  return <form onSubmit={async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    try { const result = await execute("/api/applications", { opportunityId }); router.push(`/applications/${result.id}`); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "تعذر التقديم."); setBusy(false); }
  }}><p>أكد تقديم طلبك على هذه الفرصة.</p><button disabled={busy} type="submit">{busy ? "جارٍ التقديم…" : "تأكيد التقديم"}</button>
    {error && <p className="form-error" role="alert">{error}</p>}</form>;
}

export function ApplicationActions({ id, status, officer = false }: { id: string; status: ApplicationStatus; officer?: boolean }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [reason, setReason] = useState(""); const [error, setError] = useState("");
  async function act(command: "withdraw" | "begin-review" | "accept" | "reject") {
    setBusy(true); setError("");
    try { await execute(`${officer ? "/api/organization/applicants" : "/api/applications"}/${id}/${command}`, command === "reject" ? { reason } : {}); router.refresh(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "تعذر تنفيذ الإجراء."); }
    finally { setBusy(false); }
  }
  return <section className="application-actions" aria-label="إجراءات الطلب" aria-busy={busy}>
    {!officer && (status === "APPLIED" || status === "UNDER_REVIEW") && <button className="secondary" disabled={busy} onClick={() => act("withdraw")}>سحب الطلب</button>}
    {officer && status === "APPLIED" && <button disabled={busy} onClick={() => act("begin-review")}>بدء المراجعة</button>}
    {officer && status === "UNDER_REVIEW" && <><button disabled={busy} onClick={() => act("accept")}>قبول المتقدم</button>
      <form onSubmit={(event) => { event.preventDefault(); void act("reject"); }}>
        <label htmlFor="rejection-reason">سبب الرفض</label><textarea id="rejection-reason" value={reason} onChange={(event) => setReason(event.target.value)} required maxLength={1000} />
        <button className="secondary" disabled={busy || !reason.trim()} type="submit">رفض الطلب</button>
      </form></>}
    {error && <p className="form-error" role="alert">{error}</p>}
  </section>;
}
