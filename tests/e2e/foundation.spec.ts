import { expect, test } from "@playwright/test";

test("R0 foundation page is Arabic RTL and uses current SAQL identity", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByAltText("صقل SAQL")).toBeVisible();
  await expect(page.getByRole("heading", { name: "الأساس الهندسي" })).toBeVisible();
  await expect(page.getByText("نصقل التجربة. نبني الجاهزية.")).toHaveCount(0);
  const family = await page.locator("body").evaluate((el) => getComputedStyle(el).fontFamily);
  expect(family).toMatch(/Tajawal/i);
  const tajawalLoaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return Array.from(document.fonts).some(
      (face) => face.family.replace(/["']/g, "").toLowerCase() === "tajawal" && face.status === "loaded",
    );
  });
  expect(tajawalLoaded).toBe(true);
});
