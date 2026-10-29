# Part 2: Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Design tokens, type, colour (light and dark), the app shell with navigation, and honest first-run states for the three top-level screens.

**Architecture:** Tokens live once in `src/app/globals.css` as Tailwind 4 `@theme` variables, so components only use token classes (`bg-surface`, `text-muted`). The shell is a server component that composes a client `SidebarNav` (desktop) and a client `MobileNav` (phone, a native `<dialog>` sheet). Active-route logic is a pure function so it is tested without mocking Next.js.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS 4, `next/font` Geist, `lucide-react` icons, Vitest + Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-29-pomoapp-design.md` (sections 6, 7 and 10, part 2)

## Global Constraints

- Art direction: `design-taste-frontend`, app style `achromatic-ledger` (seed 1218306369), saved in `.taste-skill/app/direction.json`.
- Chrome has no hue. The one data hue `#1d5fbf` (dark theme `#6b9be6`) goes only on the live/current data element. The primary action is near-black.
- Face: blue-grey ground `#f2f4f7` with white surfaces. Signature element: the mastery grid (10,000 h as 100 blocks of 100 h); the logo mark is that grid in miniature.
- Type: Geist only (already loaded by `next/font`); sizes 12 / 14 / 16 / 24 (title) / 30 (KPI). Weights 400, 500, 700 (700 only for the headline figure). Tabular figures on every number.
- Radii: card 8px, control 6px. One gap value 12px; page padding 24px; control height 36px; nav pitch 34px.
- Shell: open plane. 240px labelled sidebar on the ground, no top bar on desktop. Below 768px a 48px top bar with the screen name and a menu button opening a full-screen sheet.
- No gradients, shadows at rest, glass, emoji, eyebrows, icons in tinted squares. WCAG 2.2 AA contrast, visible focus, `prefers-reduced-motion` respected.

## Review Focus

1. **Nested routes:** `/skills/abc` must mark Skills active, while `/` is active only on `/` exactly. Pinned by `isActivePath` tests.
2. **Keyboard users on the phone sheet:** Escape closes it and focus returns to the menu button; choosing a link closes it. Pinned in `mobile-nav.test.tsx`.
3. **Dark mode contrast:** muted text and the data hue must reach 4.5:1 / 3:1 on dark surfaces. Checked by the inspector run in Task 3.
4. **Sidebar on a phone:** must not take width under 768px. Checked by the inspector at 390px and by the e2e phone test.
5. **Unknown routes:** the 404 page renders inside the shell with a heading. Covered by the e2e not-found test.

---

### Task 1: Tokens and type

**Files:** Modify `src/app/globals.css`, `src/app/layout.tsx`.

- [ ] Define in `@theme`: colours `ground surface raised active border rule control text muted primary primary-ink data positive negative` (light values from the sheet, ground `#f2f4f7`, data `#1d5fbf`), dark overrides under `@media (prefers-color-scheme: dark)` (ground `#000`, surface `#111`, raised `#1c1c1c`, active `#222`, border `#262626`, rule `#1a1a1a`, control `#444`, text `#fff`, muted `#b4b4b4`, primary `#fff`, primary-ink `#000`, data `#6b9be6`); radii `card 8px`, `control 6px`; font sizes `small 12 body 14 section 16 title 24 kpi 30` with line heights; `--font-sans` mapped to Geist.
- [ ] Body: `bg-ground text-text font-sans text-body`, tabular figures utility `.num`, focus-visible ring in `text`, `color-scheme: light dark`.
- [ ] Layout: `metadata.title` becomes `{ default: "pomoapp", template: "%s · pomoapp" }`; drop Geist Mono (no IDs on screen yet).
- [ ] Verify: `pnpm build` passes.

### Task 2: Shell and navigation (TDD)

**Files:** Create `src/ui/nav.ts`, `src/ui/nav.test.ts`, `src/ui/logo.tsx`, `src/ui/sidebar-nav.tsx`, `src/ui/sidebar-nav.test.tsx`, `src/ui/mobile-nav.tsx`, `src/ui/mobile-nav.test.tsx`, `src/ui/app-shell.tsx`. Modify `src/app/layout.tsx`.

**Interfaces (produced):**

- `NAV_ITEMS: readonly NavItem[]` with `NavItem = { href: "/" | "/skills" | "/settings"; label: "Timer" | "Skills" | "Settings"; icon: LucideIcon }`.
- `isActivePath(href: string, pathname: string): boolean`.
- `NavList({ pathname, onNavigate? }: { pathname: string; onNavigate?: () => void })` renders a `<nav aria-label="Main">` list; the active link has `aria-current="page"`.
- `SidebarNav()` (client) wraps `NavList` with `usePathname()`.
- `MobileNav()` (client): a top bar with the current screen's label and a button "Open menu" that opens a modal `<dialog aria-label="Menu">` holding the logo, `NavList` and a "Close menu" button.
- `AppShell({ children })`: sidebar on `md:` and up, `MobileNav` below, `<main id="main">` canvas.

Tests (written first, watched failing):

- `isActivePath`: `("/", "/")` true; `("/", "/skills")` false; `("/skills", "/skills")` true; `("/skills", "/skills/abc")` true; `("/skills", "/skillset")` false.
- `NavList`: three links Timer `/`, Skills `/skills`, Settings `/settings`; with `pathname="/skills/abc"` only Skills has `aria-current="page"`; clicking a link calls `onNavigate`.
- `MobileNav`: "Open menu" opens the dialog; Escape closes it and focus returns to "Open menu"; clicking a nav link closes it.

### Task 3: First-run screens, inspector, tests

**Files:** Modify `src/app/page.tsx`, `src/app/page.test.tsx`, `e2e/home.spec.ts`. Create `src/app/skills/page.tsx`, `src/app/settings/page.tsx`, `src/app/not-found.tsx`, `e2e/navigation.spec.ts`.

- [ ] Timer (`/`): h1 `Timer` (matches its nav label), line `Pick a skill to start a 25-minute focus block.`, primary link `Add your first skill` to `/skills`.
- [ ] Skills: h1 `Skills`, empty frame `No skills yet. Each skill keeps its own count toward 10,000 hours.` Title `Skills`.
- [ ] Settings: h1 `Settings` and one `Data` section stating `Your sessions are stored in this browser only.` (the full settings form is Part 7). Title `Settings`.
- [ ] Not found: h1 `Page not found`, link back to Timer.
- [ ] Unit: page test asserts h1 `Timer` and link `Add your first skill` with `href="/skills"`.
- [ ] e2e: home title `pomoapp` and h1 `Timer`; desktop sidebar navigates to Skills (title `Skills · pomoapp`); at 390px the menu opens, navigates to Settings and closes; `/nope` shows `Page not found`.
- [ ] Gate: `lint.mjs --app src` and `inspect.mjs --app` on `next build && next start` at 1440/768/390; fix FAILs; read every screenshot.
- [ ] Commit and push after `lint`, `typecheck`, `format:check`, `test`, `test:e2e` pass.
