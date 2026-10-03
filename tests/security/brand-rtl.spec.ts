import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Brand Identity v1.1 and Arabic RTL baseline", () => {
  it("keeps Arabic and RTL at the document root", () => {
    const text = readFileSync("src/app/layout.tsx", "utf8");
    expect(text).toContain('lang="ar"');
    expect(text).toContain('dir="rtl"');
  });

  it("bundles approved Tajawal weights from Fontsource", () => {
    const layout = readFileSync("src/app/layout.tsx", "utf8");
    for (const weight of ["400", "500", "700"]) {
      expect(layout).toContain(`@fontsource/tajawal/${weight}.css`);
    }
  });

  it("uses current brand tokens and Tajawal without reactivating old tokens", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    const upper = css.toUpperCase();
    for (const token of ["#142F43","#2F5BEA","#F4F7FB","#FFFFFF","#566575","#D9E2EE"]) expect(upper).toContain(token);
    for (const old of ["#142B52","#C8954E","#F8F5ED","#6B7A90"]) expect(upper).not.toContain(old);
    expect(css).toMatch(/Tajawal/i);
    expect(css).not.toMatch(/Noto Naskh Arabic/i);
  });
});
