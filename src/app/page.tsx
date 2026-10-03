import Image from "next/image";

export default function HomePage() {
  return (
    <main className="shell">
      <section className="card" aria-labelledby="foundation-title">
        <Image
          className="brand-logo"
          src="/brand/saql-horizontal-colour.svg"
          alt="صقل SAQL"
          width={2058}
          height={546}
          priority
        />
        <p className="eyebrow">R0 v2 — Pre-R0 Reconciliation</p>
        <h1 id="foundation-title">الأساس الهندسي</h1>
        <p className="body-copy">
          تمت مواءمة الأساس مع Pilot v2.0 وهوية SAQL Brand Identity v1.1. لم تبدأ خصائص الأعمال بعد.
        </p>
      </section>
    </main>
  );
}
