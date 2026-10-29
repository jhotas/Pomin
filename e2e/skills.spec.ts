import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-29T09:00:00") });
});

test("a skill can be added, renamed, archived, restored and deleted", async ({
  page,
}) => {
  await page.goto("/skills");
  await page.getByLabel("Skill name").fill("Guitar");
  await page.getByRole("button", { name: "Add skill" }).click();

  await page
    .getByRole("list", { name: "Skills" })
    .getByRole("link", { name: /Guitar/ })
    .click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Guitar" }),
  ).toBeVisible();
  await expect(page).toHaveTitle("Guitar · pomoapp");

  await page.getByLabel("Name", { exact: true }).fill("Classical guitar");
  await page.getByRole("button", { name: "Save name" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Classical guitar" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Archive" }).click();
  await expect(page.getByText(/^Archived\./)).toBeVisible();
  await page.getByRole("link", { name: "Skills", exact: true }).click();
  await expect(
    page.getByRole("list", { name: "Archived" }).getByText("Classical guitar"),
  ).toBeVisible();

  await page
    .getByRole("list", { name: "Archived" })
    .getByRole("link", { name: /Classical guitar/ })
    .click();
  await page.getByRole("button", { name: "Restore" }).click();
  await page.getByRole("button", { name: "Delete skill" }).click();
  await page.getByRole("button", { name: "Delete Classical guitar" }).click();

  await expect(page).toHaveURL("/skills");
  await expect(
    page.getByText(
      "No skills yet. Each skill keeps its own count toward 10,000 hours.",
    ),
  ).toBeVisible();
});

test("a skill's page starts a block on that skill", async ({ page }) => {
  await page.goto("/skills");
  for (const name of ["Guitar", "Chess"]) {
    await page.getByLabel("Skill name").fill(name);
    await page.getByRole("button", { name: "Add skill" }).click();
    await expect(
      page.getByRole("list", { name: "Skills" }).getByText(name),
    ).toBeVisible();
  }
  await page.getByRole("link", { name: /Chess/ }).click();
  await page.getByRole("button", { name: "Start a block" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByLabel("Skill", { exact: true })).toHaveValue(/.+/);
  await expect(
    page.getByLabel("Skill", { exact: true }).locator("option:checked"),
  ).toHaveText("Chess");
});

test("an unknown skill address says so", async ({ page }) => {
  await page.goto("/skills/00000000-0000-4000-8000-0000000000ff");
  await expect(
    page.getByRole("heading", { level: 1, name: "Skill not found" }),
  ).toBeVisible();
});
