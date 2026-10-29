import { expect, test } from "@playwright/test";

test("home page is the Timer screen", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("pomoapp");
  await expect(
    page.getByRole("heading", { level: 1, name: "Timer" }),
  ).toBeVisible();
});

test("unknown pages say so inside the app", async ({ page }) => {
  await page.goto("/nope");
  await expect(
    page.getByRole("heading", { level: 1, name: "Page not found" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to the timer" }).click();
  await expect(page).toHaveURL("/");
});
