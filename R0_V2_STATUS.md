# R0 v2 current status — SEC-R0-DEP-001 compatibility

**R0 PASS — Engineering verification. Business Coding HOLD; Slice1 not started.**

Approved baseline `8486322fe89f899b22b3fae33e2f34155dab5316`; compatibility branch `final-r0/security-deepmerge-compat-20261004`. DeepmergeTS override7.1.5→8.0.2 verified with Prisma7.10.0 unchanged and MySQL2 override3.23.1 retained. Production audit3→0 High,0 Critical; SEC-R0-DEP-001 CLOSED. Full audit retains5 High dev-only entries with no compatible published patch; SEC-R0-DEV-002 OPEN separately under task§3, no production risk waiver.

Fresh local clean install, Prisma validate/generate/assert/deploy/synthetic seed and persisted-row/reseed checks PASS. Foundation14/14, strict typecheck, lint, Vitest7/7, build, npm run ci, Desktop/Mobile E2E2/2, actual Tajawal400/500/700 and Brand/RTL available foundation PASS. Controls/Sources/state/permission/scoring unchanged; RG-R0-DATA-001 remains CLOSED.

Hosted CI [success](https://github.com/tduhaim-beep/SAQL/actions/runs/37162967163) is GREEN on technical candidate `d270ccaf5daa6e5169946b0354a88c1a1d39eb04`, including required Production dependency audit immediately after npm ci and full Playwright --with-deps. This documentation-only closure commit will receive its own Hosted run; the final external delivery report records the exact final SHA/run. Local non-root --with-deps exit1 is documented per the explicit user exception; actual Chromium/E2E and Hosted full installer pass.

Current report: R0_SEC_R0_DEP_001_COMPATIBILITY_VERIFICATION_20261004.md; security register: docs/security/R0_DEPENDENCY_SECURITY_GAPS_20261004.md. Older reports are historical. Project Sources and canonical OD-21 are untouched; engineering verification does not grant Business Coding or production-release approval.
