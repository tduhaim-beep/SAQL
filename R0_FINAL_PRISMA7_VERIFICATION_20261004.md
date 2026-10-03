# SAQL — Prisma7Compat Final R0 Verification

**Final engineering outcome: R0 REWORK. Business Coding: HOLD.**

التنفيذ من clean install على الحزمة الجديدة `SAQL_R0_v2_Codex_FinalR0_Handoff_Prisma7Compat_20261004.zip` فقط، في checkout جديد مع قاعدة PostgreSQL جديدة. لم تُستخدم نتائج أو application code أو lockfile أو client أو migration من تشغيل سابق. مصادر المشروع للقراءة والمقارنة فقط خارج repository؛ الملفات المرجعية الـ23 بقيت مطابقة للحزمة الأصلية.

UTC `2026-10-03T22:43:45.091687+00:00`؛ الرياض `2026-10-04T01:43:45.091687+03:00`. اسم migration يحمل UTC الذي ولّدته Prisma تلقائيًا، ولم يُعدّل لتغيير التاريخ.
Input SHA256 `3f0442cdd6d448202871418e2dd942fb26ab3bd5dda847635e6e3442299387ed`.
Baseline commit `7d2013c560c2d38f472d367d2f94e90c829b21b8`؛ reviewed lock commit `18fa7bc8d9668dde972ee21c930b40c7834fae98`؛ reviewed migration commit `d46ac3d5ec8261e32f65a39bef9c699d31218b21`. Final commit في `evidence/release.json` وGit bundle لتجنب مرجع ذاتي داخل commit.

## البيئة والتثبيت

Node **24.19.0**، npm **11.9.0**، PostgreSQL **16.15**، Prisma CLI/client/adapter **7.10.0**، Docker **28.4.0**، Chromium **153.0.8010.12**، Python **3.12.14**. Linux-6.18.44-x86_64-with-glibc2.41.
Next **16.3.8**، React **19.3.0**، Vitest **5.0.3**، Playwright **1.63.0**، TypeScript **5.9.3**، pg **8.23.1**، dotenv **17.4.2**، tsx **4.23.15**، Fontsource Tajawal **5.3.0**، ESLint **9.39.5**.

630 lock entries تشمل optional packages، و530 packages مثبّتة فعليًا. كل remote package entry له integrity ويستخدم registry.npmjs.org. lockfile واحد npm v3 روجع وقُيّد قبل npm ci؛ SHA256 `ca5b09ccedec3e5ae07ffed65c6ffbd2f66a2074692f55cc86cb84fab3008060`. Prisma CLI/client/adapter versions متطابقة. لا تغيير في package.json أو major version من جانب المنفّذ؛ adapter-pg/pg/dotenv/tsx والخط موجودة في input patch. تراخيصها موثقة في A05-lock-review.json. تحذير ESLint9 unsupported محفوظ في السجل، دون إخفائه أو خفض النسخة.

قاعدة test-only على loopback port55434 وtmpfs، ببيانات اصطناعية فقط. زوج saql/saql مطابق لنمط CI التجريبي وليس secret إنتاجيًا. لا production data أو credentials. أُزيلت حاوية هذا التشغيل فقط بعد حفظ الأدلة.

## نتائج جميع البوابات

| البوابة | النتيجة | الدليل |
|---|---|---|
| Node24/npm/PostgreSQL | PASS | `A01-node.log, A02-npm.log, A03-env.log, postgres-version-before.log` |
| Clean install / reviewed lockfile | PASS | `A04-lock.log, A05-lock-review.json, A06-clean-install.log` |
| Prisma validate | PASS | `B01-validate.log` |
| Prisma generate | PASS | `B02-generate.log, generated-prisma-sha256.json` |
| Baseline create-only | PASS | `B03-create-migration.log, B04-db-before-deploy.log` |
| Migration SQL review | PASS | `B05-migration-review.json, generated-migration.sql` |
| Migration assertion/deployment | PASS | `B06-assert-migration.log, B07-deploy.log` |
| Persisted synthetic seed | PASS | `B08-seed.log, B09-verify-seed.log, seed-first.json` |
| Seed repeatability | PASS | `B10-seed-repeat.log, B11-verify-repeat.log, seed-repeat.json` |
| Foundation/architecture/basic secrets | PASS | `C01-foundation.log` |
| TypeScript | FAIL | `C02-typecheck.log` |
| Lint | PASS | `C03-lint.log` |
| Vitest | PASS | `C04-test.log` |
| Production build | FAIL | `C05-build.log` |
| npm run ci | FAIL | `C06-ci.log` |
| Playwright exact --with-deps installer | FAIL / ENVIRONMENT | `C07-playwright-with-deps.log` |
| Chromium-only installation / browser launch | PASS | `C07b-chromium-only.log, D01-brand-runtime.log` |
| Playwright E2E | PASS | `C08-e2e.log` |
| Brand v1.1 / RTL available foundation | PASS | `brand-runtime.json, font-provenance.json, brand-desktop.png, brand-mobile.png` |
| Implementation-control SHA256 | PASS | `canonical-comparison.json` |
| Dependency audit | FAIL / FINDINGS | `audit-full.json, audit-production.json, security-summary.json` |
| Full hosted workflow | NOT RUN / LOCAL GATES FAIL | `C06-ci.log, .github/workflows/ci.yml` |

## Migration — إنشاء ومراجعة وتطبيق فعلي

المسار: `prisma/migrations/20261003222856_r0_v2_baseline/migration.sql`.
SQL SHA256: `63c247991bff9ab2dd4445bbcac58cc56047a821963ca323e5def7176e1fc9b2`.

أُنشئت بالأمر `npx prisma migrate dev --name r0_v2_baseline --create-only` عبر Prisma7.10.0. الاستعلام قبل deploy أظهر `_prisma_migrations` فارغة وعدم وجود business tables؛ لم يُطبّق SQL قبل المراجعة. لم تُكتب أو تُعدّل migration يدويًا. Prisma أنشأت أيضًا migration_lock.toml.

قراءة SQL وفحصها يثبتان 20 جدولًا و17 enum و32 index و33 FK، وكل names/enum values تطابق supplied current v2 schema. لا v1 table/state resurrection، ولا DROP/TRUNCATE/DELETE/UPDATE/INSERT في migration. ALTER TABLE تضيف foreign keys للجداول الجديدة فقط. سياسات Cascade/Restrict/SetNull مأخوذة من schema المعطاة، دون تغيير حذف أو retention من تخمين.

TrainingException موجود؛ typeCode وseverityCode TEXT مفتوحة دون taxonomy enum مغلق. ExceptionStatus = OPEN/IN_PROGRESS/WAITING_EXTERNAL/RESOLVED/CLOSED. journey FK RESTRICT؛ optional overlay/owner/resolution actor SET NULL لحفظ سجل Exception. نفس approved persistence decision محفوظ؛ شرط same-journey overlay ما زال موثقًا للـBusiness Slice اللاحق ولم يُنفّذ هنا.

روجع SQL وقُيّد في commit قبل تطبيق db:deploy. نجحت migration، وقورنت بصمتها مع `_prisma_migrations.checksum` من PostgreSQL بعد التطبيق؛ finished=true وrolled_back=false. تحققت أيضًا enum sets السبعة عشر في PostgreSQL مقابل schema، وليس فقط ملفات text.

## Seed — بيانات حقيقية في القاعدة المؤقتة

`npm run db:seed` نفّذ `tsx prisma/seed.ts` فعليًا وأظهر Synthetic R0 seed completed بعد الكتابة.
SELECT/assertions المستقلة أثبتت **Institution=1، Organization=1، AppUser=6، RoleAssignment=6**، وجميع business tables الأخرى صفر. المستخدمون @example.invalid وحالاتهم ACTIVE، organization synthetic/VERIFIED، institution synthetic/active. أدوار كل حساب وorganization/institution context تطابق seed المعطاة.

أُعيد seed ثم SELECT/assertions: نفس الأعداد، نفس user/institution/organization IDs ونفس الأدوار والسياقات دون تكرار منطقي. Input seed تعيد إنشاء assignment row IDs عمدًا بـdeleteMany/create؛ لذلك repeatability هنا منطقية وليست ادعاء بقاء كل row ID/timestamp حرفيًا. لا seed code أو business fixture جديد أُضيف.

## سبب REWORK وأصغر تصحيح

1. **TypeScript TS2375 في prisma/seed.ts:63**: create data تمرّر `organizationId` و`institutionId` بقيمة محتملة undefined، بينما generated nullable inputs تقبل string/null تحت exactOptionalPropertyTypes=true. هذا أفشل typecheck (exit2)، build (exit1 بعد compilation)، npm run ci (exit2 عند typecheck). نجح seed runtime لأن tsx transpilation لا يثبت strict type safety. الحد الأدنى في technical patch لاحق: حذف المفاتيح عندما تكون undefined أو تحويل الغياب إلى null للحقلين nullable، مع إبقاء strict/exactOptionalPropertyTypes وعدم تغيير roles/contexts/business rules، ثم إعادة typecheck/build/CI والبوابات المتأثرة. لم يُصلح المصدر هنا؛ المهمة الحالية Verification فقط.
2. **Dependency audit findings**: full9 high affected package entries، omit=dev4 high،0 critical. Counts تشمل propagated effects وليست9 exploits مستقلة مثبتة. يلزم علاج/triage موثق ضمن approved majors وتحليل reachability؛ لا waiver هنا. اقتراح npm خفض Prisma6/Next config14 يخالف baseline، فلم يُطبّق force fix أو downgrade. braces/deepmerge-ts/mysql2 وسلاسل config/tooling موثقة في JSON؛ التطبيق يستخدم PostgreSQL، ووجود MySQL advisory لا يثبت وصوله إلى user input هنا.
3. **الأمر الحرفي Playwright --with-deps** فشل بسبب non-root su authentication. Browser-only install نجح وChromium/E2E/CDP تعمل بالمكتبات الموجودة. لا نقص OS libraries ظاهر في هذا التشغيل؛ شرط تنفيذ installer حرفيًا لم ينجح. الحل البيئي: image مُجهّزة أو capability OS install إذا أُبقي هذا الشرط. لم تُعطّل TLS أو package checksums أو assertions.
4. **Full CI**: local npm run ci فشل بسبب TS2375. خطوات DB المحلية نجحت؛ Hosted GitHub Actions لم تُشغّل، ولا push/PR/deploy/release إلى remote. لا ادعاء CI PASS.

## الاختبارات وBrand/RTL وحدودها

Foundation14/14، Vitest7/7 في4 ملفات، Lint PASS، Playwright2/2 Desktop/Mobile. CI أعاد Foundation14/14 ثم توقف؛ lint/test/build اللاحقة داخل chain لم تعمل، رغم تشغيلها منفردة مسبقًا. Build compiled app ثم فشل type safety؛ ليست production build ناجحة.

Desktop1280×900 وPixel7 viewport412×839: lang=ar، dir=rtl، computed RTL، approved current SVG، palette الستة exact، لا horizontal overflow أو superseded tagline. لقطات هذا التشغيل فُحصت بصريًا: العربية واضحة دون clipping، المحتوى الإنجليزي ثانوي.
ستة font requests عربية/لاتينية HTTP200 في كل viewport. document.fonts.load يثبت400/500/700 loaded؛ CDP يثبت actual rendered Tajawal-Regular/Medium/Bold وليست CSS family declaration فقط. Font metadata/glyph outline/advance checks للحروف صقل وSAQL تطابق canonical TTF مقابل WOFF subsets؛ لا ادعاء byte identity بين formats/subsets مختلفة.

الشعارات السبعة وbrand-colors.json byte-identical للمصدر v1.1؛ implementation-control8/8 hashes ومحتوى المصادر المستقلة مطابقان. لا Noto أو ألوان baseline القديم في الصفحة الحالية. لا semantic status components في foundation، فلا semantic behavior قابل للاختبار؛ NOT EXERCISED مع عدم إعادة mapping brand colors كحالات. لا UI/status feature إضافية لغرض إكمال الاختبار. 08B التاريخي ليس دليل PASS الحالي.

هذه اختبارات foundation/static contracts والصفحة المتاحة، وليست إثبات تنفيذ225 requirement أو tenant authorization/business workflows. Business implementation evidence0/225. لا business slice بدأ.

## الملفات والأمن والفجوات

الملفات المتغيرة: package-lock.json جديد؛ migration.sql وmigration_lock.toml مولّدان عبر Prisma؛ R0_V2_STATUS.md وR0_V2_VERIFICATION_EVIDENCE.txt محدثان؛ R0_FINAL_PRISMA7_VERIFICATION_20261004.md وR0_PRISMA7_BASELINE_MIGRATION_REVIEW_20261004.md جديدان. القائمة الدقيقة والبصمات في changed-files.json وbinary diff وrelease.json. SQL/schema/seed/test/application/control source لم تُحرر لتجاوز النتائج.

Prisma generated client محفوظ كأدلة ويمكن إعادة توليده؛ يبقى ignored كما نص input patch. تغييرات Next الآلية في AGENTS.md وtsconfig.json وnext-env.d.ts حفظت ثم أُعيدت لبايتات input؛ tsconfig.tsbuildinfo محفوظ خارج الكود. strict flags لم تُضعف. المصادر المرجعية الـ23 unchanged.

Basic secret/architecture checks PASS؛ ليست مراجعة أمن شاملة أو production readiness. No real credentials/PII؛ synthetic rows فقط. No new business Requirement Gap؛ RG-R0-DATA-001 يبقى CLOSED، وOD-21 Final R0 PASS يبقى OPEN وBusiness Coding HOLD. لا حالة أو صلاحية أو scoring rule مُخترعة.

حُفظ install_script/start_skill كمسودة لمسار Prisma7Compat الحالي، بما فيها توليد client وPostgreSQL test startup/checks؛ الشبكة والsecrets وrepository bindings لم تُغيّر. لا publication/fresh-task restoration متحققة. ZIP يحفظ scaffold empty directories؛ Git bundle وحده لا يحفظها.

## الأوامر الفعلية والرموز والسجلات

| Command | Exit | Log |
|---|---:|---|
| `env -u DOCKER_HOST -u DOCKER_CONTEXT -u DOCKER_TLS -u DOCKER_TLS_VERIFY -u DOCKER_CERT_PATH docker --host=unix:///var/run/docker.sock info --format {{.ServerVersion}}` | 0 | `docker-info.log` |
| `env -u DOCKER_HOST -u DOCKER_CONTEXT -u DOCKER_TLS -u DOCKER_TLS_VERIFY -u DOCKER_CERT_PATH docker --host=unix:///var/run/docker.sock run -d --name saql-prisma7-r0-wbzp4fnf-postgres --label saql.purpose=prisma7-final-r0 --tmpfs /var/lib/postgresql/data:rw,size=512m -e POSTGRES_USER=saql -e POSTGRES_PASSWORD=saql -e POSTGRES_DB=saql_prisma7_r0 -p 127.0.0.1:55434:5432 postgres:16` | 0 | `postgres-start.log` |
| `node -v` | 0 | `A01-node.log` |
| `npm -v` | 0 | `A02-npm.log` |
| `npm run r0:env-check` | 0 | `A03-env.log` |
| `env -u DOCKER_HOST -u DOCKER_CONTEXT -u DOCKER_TLS -u DOCKER_TLS_VERIFY -u DOCKER_CERT_PATH docker --host=unix:///var/run/docker.sock exec saql-prisma7-r0-wbzp4fnf-postgres psql -U saql -d saql_prisma7_r0 -c SELECT version(); SELECT count(*) AS public_tables FROM information_schema.tables WHERE table_schema='public';` | 0 | `postgres-version-before.log` |
| `npm install --package-lock-only` | 0 | `A04-lock.log` |
| `npm ci` | 0 | `A06-clean-install.log` |
| `npm run db:validate` | 0 | `B01-validate.log` |
| `npm run db:generate` | 0 | `B02-generate.log` |
| `npx prisma migrate dev --name r0_v2_baseline --create-only` | 0 | `B03-create-migration.log` |
| `npm audit --omit=dev --json` | 1 | `security-audit-production.log` |
| `npm audit --json` | 1 | `security-audit-full.log` |
| `env -u DOCKER_HOST -u DOCKER_CONTEXT -u DOCKER_TLS -u DOCKER_TLS_VERIFY -u DOCKER_CERT_PATH docker --host=unix:///var/run/docker.sock exec saql-prisma7-r0-wbzp4fnf-postgres psql -U saql -d saql_prisma7_r0 -c SELECT tablename FROM pg_tables WHERE schemaname='public'; SELECT migration_name, finished_at FROM _prisma_migrations;` | 0 | `B04-db-before-deploy.log` |
| `npm run db:assert-migration` | 0 | `B06-assert-migration.log` |
| `npm run db:deploy` | 0 | `B07-deploy.log` |
| `npm run db:seed` | 0 | `B08-seed.log` |
| `python /workspace/saql-prisma7-final-r0-wbzp4fnf/verify_db.py seed-first.json` | 0 | `B09-verify-seed.log` |
| `npm run db:seed` | 0 | `B10-seed-repeat.log` |
| `python /workspace/saql-prisma7-final-r0-wbzp4fnf/verify_db.py seed-repeat.json` | 0 | `B11-verify-repeat.log` |
| `npm run foundation:verify` | 0 | `C01-foundation.log` |
| `npm run typecheck` | 2 | `C02-typecheck.log` |
| `npm run lint` | 0 | `C03-lint.log` |
| `npm run test` | 0 | `C04-test.log` |
| `npm run build` | 1 | `C05-build.log` |
| `npm run ci` | 2 | `C06-ci.log` |
| `npx playwright install --with-deps chromium` | 1 | `C07-playwright-with-deps.log` |
| `npx playwright install chromium` | 0 | `C07b-chromium-only.log` |
| `npm run test:e2e` | 0 | `C08-e2e.log` |
| `node /workspace/saql-prisma7-final-r0-wbzp4fnf/brand_probe.cjs` | 0 | `D01-brand-runtime.log` |
| `env -u DOCKER_HOST -u DOCKER_CONTEXT -u DOCKER_TLS -u DOCKER_TLS_VERIFY -u DOCKER_CERT_PATH docker --host=unix:///var/run/docker.sock rm -f saql-prisma7-r0-wbzp4fnf-postgres` | 0 | `cleanup-postgres.log` |
| `node scripts/check-secrets.mjs` | 0 | `delivery-secret-check.log` |
| `git diff --check` | 0 | `delivery-diff-check.log` |

كل raw log كامل يحتوي cwd/UTC/command/CI/exit؛ commands.jsonl يحفظ duration. DATABASE_URL في runner يخص القاعدة المؤقتة فقط؛ CI=1 في E2E يبدأ server مستقلًا. لا مخرجات أو screenshots أو results قديمة أعيد استخدامها.

**Slice 1 لم يبدأ. Final outcome: R0 REWORK.**
