# Part 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A scaffolded Next.js app with strict TypeScript, Tailwind, linting, formatting, unit tests, end-to-end tests and CI, all green, with no product features yet.

**Architecture:** `create-next-app` generates the base (App Router, `src/` dir, Tailwind, ESLint flat config). On top of it: stricter TypeScript, Prettier, Vitest with React Testing Library for unit tests, Playwright for end-to-end tests, and a GitHub Actions workflow that runs every check. The home page is reduced to a minimal placeholder that the smoke tests target.

**Tech Stack:** Node 26, pnpm, Next.js 16.4.3, React, TypeScript, Tailwind CSS 4, ESLint, Prettier, Vitest, React Testing Library, Playwright, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-29-pomoapp-design.md` (section 8 and section 10, part 1)

## Global Constraints

- TypeScript `strict: true` and `noUncheckedIndexedAccess: true`.
- Package manager: pnpm. Commit `pnpm-lock.yaml`. CI installs with `--frozen-lockfile`.
- Folder layout root: `src/`, with `src/app/` for routes. Import alias `@/*` maps to `src/*`.
- UI copy is English.
- Line endings are LF in the repo (the developer works on Windows).
- Commits: one per task, shown to the user and committed only after their approval. Every message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Push to `origin main` at the end of the part, after approval.

## Review Focus

1. **CRLF churn on Windows:** files checked out on Windows must stay LF in the repo, or Prettier and diffs fight. Covered by `.gitattributes` in Task 1 and `pnpm format:check` in CI (Task 4).
2. **Node version drift:** CI and local must run the same major. Covered by `.nvmrc` (`26`) and `engines.node` (`>=26`) in Task 1, read by CI in Task 4.
3. **Strict TypeScript rejecting scaffold code:** `noUncheckedIndexedAccess` can break generated files. Covered by `pnpm typecheck` in Task 1 Step 6.
4. **Port 3000 already in use locally:** Playwright must not attach to an unrelated server. Covered by running end-to-end tests on port `3100` with `reuseExistingServer: !process.env.CI` in Task 3.
5. **Unit and end-to-end runners picking up each other's files:** Vitest must ignore `e2e/`, Playwright must only read `e2e/`. Covered by the `include`/`testDir` settings in Tasks 2 and 3, verified by running both suites.

---

### Task 1: Scaffold the app with strict TypeScript and Prettier

**Files:**

- Create (generated): `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `.gitignore`, `public/`
- Create: `.gitattributes`, `.nvmrc`, `.prettierrc.json`, `.prettierignore`
- Modify: `tsconfig.json`, `package.json`, `src/app/page.tsx`, `src/app/layout.tsx`

**Interfaces:**

- Produces: scripts `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `format:check` in `package.json`. Home page renders an `<h1>` with the text `pomoapp`. Layout `metadata.title` is `pomoapp`.

- [ ] **Step 1: Install pnpm**

Run: `npm install -g pnpm` then `pnpm --version`
Expected: a version number is printed.

- [ ] **Step 2: Scaffold into the existing repo**

Run from the repo root (it contains `.git` and `docs/`, both allowed by `create-next-app`):

```
pnpm create next-app@16.4.3 . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --turbopack --no-react-compiler --yes
```

Expected: dependencies install and the command finishes without errors. `docs/` is untouched.

- [ ] **Step 3: Add repo hygiene files**

- `.gitattributes`: `* text=auto eol=lf`
- `.nvmrc`: `26`
- `package.json`: add `"engines": { "node": ">=26" }` and `"packageManager"` set to the installed `pnpm@<version>`.

Then run `git add --renormalize .` so already tracked files are stored as LF.

- [ ] **Step 4: Tighten TypeScript**

In `tsconfig.json` keep the generated options and make sure these are set: `"strict": true`, `"noUncheckedIndexedAccess": true`, `"noFallthroughCasesInSwitch": true`, `"forceConsistentCasingInFileNames": true`. Add script `"typecheck": "tsc --noEmit"`.

- [ ] **Step 5: Add Prettier**

Run: `pnpm add -D prettier prettier-plugin-tailwindcss eslint-config-prettier`

- `.prettierrc.json`: `{ "plugins": ["prettier-plugin-tailwindcss"] }` (Prettier defaults otherwise).
- `.prettierignore`: `pnpm-lock.yaml`, `.next`, `next-env.d.ts`, `playwright-report`, `test-results`.
- `eslint.config.mjs`: append `eslint-config-prettier` (flat export `eslint-config-prettier/flat`) as the last config entry.
- Scripts: `"format": "prettier --write ."`, `"format:check": "prettier --check ."`.

- [ ] **Step 6: Replace the boilerplate**

- `src/app/page.tsx`: a `<main>` holding one `<h1>pomoapp</h1>`. No other content, images or links.
- `src/app/layout.tsx`: `metadata` with `title: "pomoapp"` and `description: "A pomodoro timer that tracks your path to 10,000 hours per skill."`. Keep the generated font setup.
- `src/app/globals.css`: keep only `@import "tailwindcss";` (design tokens come in Part 2).
- Delete the unused SVGs the scaffold put in `public/`.

- [ ] **Step 7: Verify everything passes**

Run: `pnpm format` then `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build`
Expected: all four exit with code 0.

Run: `pnpm dev`, open `http://localhost:3000`
Expected: the page shows `pomoapp` and the tab title is `pomoapp`. Stop the server.

- [ ] **Step 8: Commit (after the user approves)**

```
git add -A
git commit -m "chore: scaffold Next.js app with strict TypeScript and Prettier"
```

---

### Task 2: Unit testing with Vitest and React Testing Library

**Files:**

- Create: `vitest.config.mts`, `vitest.setup.ts`, `src/app/page.test.tsx`
- Modify: `package.json`

**Interfaces:**

- Consumes: the home page from Task 1 (`<h1>pomoapp</h1>`).
- Produces: scripts `test` (single run) and `test:watch`. Test files live next to the code as `*.test.ts(x)` under `src/`. Matchers from `@testing-library/jest-dom` are available globally.

- [ ] **Step 1: Install**

Run: `pnpm add -D vitest @vitejs/plugin-react vite-tsconfig-paths jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event`

- [ ] **Step 2: Configure**

- `vitest.config.mts`: plugins `tsconfigPaths()` and `react()`; `test.environment: "jsdom"`, `test.setupFiles: ["./vitest.setup.ts"]`, `test.include: ["src/**/*.test.{ts,tsx}"]`.
- `vitest.setup.ts`: `import "@testing-library/jest-dom/vitest";`
- No `globals`: tests import `test`, `expect` and friends from `vitest`. Do not set `compilerOptions.types` (it would stop automatic `@types/*` inclusion). The matcher types come from the import in `vitest.setup.ts`, which the generated `tsconfig.json` `include` (`**/*.ts`) already covers.
- Scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 3: Write the smoke test**

```tsx
// src/app/page.test.tsx
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Home from "./page";

test("renders the app name as the main heading", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", { level: 1, name: "pomoapp" }),
  ).toBeInTheDocument();
});
```

- [ ] **Step 4: Run it**

Run: `pnpm test`
Expected: 1 test passed.

- [ ] **Step 5: Prove it can fail**

Temporarily change the expected name to `"pomoapp!"`, run `pnpm test`, expect 1 failure, then revert.

- [ ] **Step 6: Verify the rest still passes**

Run: `pnpm lint`, `pnpm typecheck`, `pnpm format:check`
Expected: all exit with code 0.

- [ ] **Step 7: Commit (after the user approves)**

```
git add -A
git commit -m "test: add Vitest and React Testing Library"
```

---

### Task 3: End-to-end testing with Playwright

**Files:**

- Create: `playwright.config.ts`, `e2e/home.spec.ts`
- Modify: `package.json`, `.gitignore`

**Interfaces:**

- Consumes: the home page and `metadata.title` from Task 1; `build` and `start` scripts.
- Produces: script `test:e2e`. End-to-end specs live in `e2e/*.spec.ts`. Later parts add the flow from spec section 8 here.

- [ ] **Step 1: Install**

Run: `pnpm add -D @playwright/test` then `pnpm exec playwright install chromium`

- [ ] **Step 2: Configure**

`playwright.config.ts`:

- `testDir: "./e2e"`, `fullyParallel: true`, `forbidOnly: !!process.env.CI`, `retries: process.env.CI ? 2 : 0`, `reporter: process.env.CI ? "github" : "list"`.
- `use.baseURL: "http://localhost:3100"`, `use.trace: "on-first-retry"`.
- One project: `chromium` with `devices["Desktop Chrome"]`.
- `webServer`: `command: "pnpm build && pnpm start --port 3100"`, `url: "http://localhost:3100"`, `reuseExistingServer: !process.env.CI`, `timeout: 120_000`.

`.gitignore`: add `/test-results/`, `/playwright-report/`, `/playwright/.cache/`.
Script: `"test:e2e": "playwright test"`.

- [ ] **Step 3: Write the smoke spec**

```ts
// e2e/home.spec.ts
import { expect, test } from "@playwright/test";

test("home page shows the app name", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("pomoapp");
  await expect(
    page.getByRole("heading", { level: 1, name: "pomoapp" }),
  ).toBeVisible();
});
```

- [ ] **Step 4: Run it**

Run: `pnpm test:e2e`
Expected: 1 passed (chromium).

- [ ] **Step 5: Check the suites stay separate**

Run: `pnpm test`
Expected: still exactly 1 test (Vitest does not pick up `e2e/`).

- [ ] **Step 6: Commit (after the user approves)**

```
git add -A
git commit -m "test: add Playwright end-to-end smoke test"
```

---

### Task 4: CI workflow and README

**Files:**

- Create: `.github/workflows/ci.yml`
- Modify: `README.md` (replace the scaffold's)

**Interfaces:**

- Consumes: scripts `lint`, `typecheck`, `format:check`, `test`, `build`, `test:e2e`; `.nvmrc`.
- Produces: a `CI` workflow that later parts rely on to keep `main` green.

- [ ] **Step 1: Write the workflow**

`.github/workflows/ci.yml`, name `CI`, triggered on `push` to `main` and on `pull_request`. One job `check` on `ubuntu-latest`:

1. `actions/checkout@v4`
2. `pnpm/action-setup@v4` (reads `packageManager` from `package.json`)
3. `actions/setup-node@v4` with `node-version-file: .nvmrc` and `cache: pnpm`
4. `pnpm install --frozen-lockfile`
5. `pnpm lint`
6. `pnpm typecheck`
7. `pnpm format:check`
8. `pnpm test`
9. `pnpm exec playwright install --with-deps chromium`
10. `pnpm test:e2e` (its `webServer` runs the production build)
11. On failure, upload `playwright-report/` with `actions/upload-artifact@v4`.

- [ ] **Step 2: Write the README**

Sections: what pomoapp is (one paragraph from spec section 1), requirements (Node 26, pnpm), setup (`pnpm install`), scripts table (`dev`, `build`, `start`, `lint`, `typecheck`, `format`, `format:check`, `test`, `test:watch`, `test:e2e`), link to the spec. No badges or emoji.

- [ ] **Step 3: Verify locally**

Run, in order: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm test`, `pnpm test:e2e`
Expected: all exit with code 0.

- [ ] **Step 4: Commit (after the user approves)**

```
git add -A
git commit -m "ci: add GitHub Actions workflow and README"
```

- [ ] **Step 5: Push and confirm CI (after the user approves)**

Run: `git push origin main`, then `gh run watch` on the triggered run.
Expected: the `CI` workflow finishes with success.
