import { expect, test } from "@playwright/test";

test("home page shows the app name", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("pomoapp");
  await expect(
    page.getByRole("heading", { level: 1, name: "pomoapp" }),
  ).toBeVisible();
});
