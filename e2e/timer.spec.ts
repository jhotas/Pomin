import { expect, test, type Page } from "@playwright/test";

const T0 = new Date("2026-10-29T09:00:00");

async function addSkill(page: Page, name: string) {
  await page.getByLabel("Skill name").fill(name);
  await page.getByRole("button", { name: "Add skill" }).click();
  await expect(page.getByRole("button", { name: "Start" })).toBeEnabled();
}

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: T0 });
  await page.goto("/");
});

test("every control works right after the page loads", async ({ page }) => {
  // Regression: server and first client render once disagreed, and React
  // kept the server's `disabled` on Skip after hydration.
  await addSkill(page, "Drawing");
  await page.reload();
  await expect(page.getByRole("button", { name: "Skip" })).toBeEnabled();
  await page.getByRole("button", { name: "Skip" }).click();
  await expect(page.getByText("Short break", { exact: true })).toBeVisible();
});

test("a full focus block is logged against its skill", async ({ page }) => {
  await addSkill(page, "Guitar");
  await page.getByRole("button", { name: "Start" }).click();

  await page.clock.fastForward("25:01");
  await expect(page.getByText("Short break", { exact: true })).toBeVisible();
  await expect(page.getByRole("timer")).toHaveText(/0[45]:\d\d/);

  const today = page.getByRole("region", { name: "Today" });
  await expect(today.getByRole("listitem")).toHaveCount(1);
  await expect(today.getByRole("listitem")).toContainText("25 m");
  await expect(
    page.getByText("Guitar · 1 session today, 25 m focused."),
  ).toBeVisible();
});

test("a reload in the middle of a block picks up where it was", async ({
  page,
}) => {
  await addSkill(page, "Chess");
  await page.getByRole("button", { name: "Start" }).click();
  await page.clock.fastForward("05:00");
  await page.reload();
  await expect(page.getByRole("timer")).toHaveText(/(20:00|19:5\d)/);
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
});

test("the countdown shows in the tab title while running", async ({ page }) => {
  await addSkill(page, "Spanish");
  await page.keyboard.press("Space");
  await page.clock.fastForward("01:00");
  await expect(page).toHaveTitle(/^2[34]:\d\d · Focus · pomoapp$/);
});
