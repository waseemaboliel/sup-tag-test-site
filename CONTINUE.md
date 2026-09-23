# Continuation Notes

Working state and context needed to pick this project back up in a future session. PLAN.md has the feature roadmap; this file has the operational details that aren't in the repo's code or commit history.

## Current state

- Phase 0 (site skeleton + GTM setup), Phase 1 (Ecommerce & Transactions), Phase 2 (Error
  Analysis), Phase 3 (SPA/npm rebuild), and Phase 4 (Tag Switcher — app code AND the GTM console
  side) are all done, published, and live-verified end-to-end, including that the CS tag
  actually gets blocked/allowed correctly under each mode. Phase 5 (Re-add Hotjar) is next up,
  not started. See `PLAN.md`.
- Live site: https://waseemaboliel.github.io/sup-tag-test-site/ — up to date through the
  BrowserRouter/404.html router migration (see below), pushed and live-verified.
- Repo: https://github.com/waseemaboliel/sup-tag-test-site (public)
- **The project is no longer plain static HTML.** It's now a Vite + React + React Router
  (`BrowserRouter`, clean URLs) SPA, with two pages (`public/errors.html`,
  `public/api-errors.html`) deliberately kept as real standalone documents outside the SPA.
  **Read `DEVELOPER.md` before touching this repo again** — it has the full local setup, run,
  build, and deploy instructions, the clean-URLs-on-GitHub-Pages `404.html` mechanism, and
  exactly where the Phase 5 hooks go in the code.

## Phase 3 fully shipped (2026-09-23)

- GitHub Pages source flipped to "GitHub Actions" (was "Deploy from a branch"). Confirmed via
  `gh api repos/waseemaboliel/sup-tag-test-site/pages` → `build_type: "workflow"`.
- Pushed the SPA rebuild, then had to manually re-run the deploy workflow once
  (`gh workflow run deploy.yml`) — the very first push landed *while* Pages was still on the
  legacy branch-deploy source, so a stale legacy "pages build and deployment" run raced the new
  Actions deploy and briefly overwrote it with the raw unbuilt `index.html` (served
  `/src/main.jsx` directly, `errors.html` 404'd). The re-run after the source flip fixed it
  cleanly — future pushes shouldn't hit this since the source is now permanently on Actions.
- Live-verified on the actual deployed site (not just local preview) via browser: home page
  renders correctly, GTM snippet fires (`GTM-W925CGJH` present in both the SPA shell and
  `errors.html`), `errors.html`/`api-errors.html` both resolve as real standalone pages.

## Phase 4 — Tag Switcher (2026-09-23)

App-code side is fully done, pushed, and live-verified (see `PLAN.md` Phase 4 for exact detail):
inline dataLayer-push script (URL `?tags=` → localStorage → default `all`) duplicated
byte-identically across `index.html`/`public/errors.html`/`public/api-errors.html`; visible
"All / Contentsquare / Heap / Hotjar" segmented control in the header (React in the SPA, vanilla
JS on the two standalone pages), backed by the shared `localStorage` key
`supTagTestSite.activeTags`. Confirmed via browser automation, both locally and live: switching
modes updates `window.dataLayer`, persists through reload, and carries over between the SPA and
the standalone pages correctly.

**Router migration, same day:** shipped first with `HashRouter` (`/?tags=all#/cart`). Waseem
tested the deployed switcher and expected `/cart?tags=all` instead — correct instinct, since a
query string only parses as real params when it comes *before* a `#fragment`, so it was landing
uselessly inside the hash. Switched to `BrowserRouter` (clean URLs) + `public/404.html` (the
standard [rafgraph/spa-github-pages](https://github.com/rafgraph/spa-github-pages) redirect
trick, since GitHub Pages has no server-side rewrites and would otherwise 404 a direct/refreshed
`/cart`) + a matching restore script at the top of `index.html`. Also fixed the standalone pages'
nav (`public/errors.html`/`public/api-errors.html`) from hash links (`./#/cart`) to clean
relative links (`./cart`), and a leftover `<a href="#/events">` in `Home.jsx` to a proper
`<Link to="/events">`. Verified via `node` simulation of the full 404→restore round-trip for
several URLs before pushing (since `vite preview` doesn't reproduce GitHub Pages' 404 behavior),
then live-verified the real thing on the deployed site. Full explanation in `DEVELOPER.md`'s
"Clean URLs on GitHub Pages" section — **read that before changing routing or adding pages.**

**GTM console side — done and published (2026-09-23).** Built via an agent driving the GTM UI
directly (tagmanager.google.com, signed in under the "Waseem Sandbox" Google account — NOT the
Contentsquare work account, which has no access to this container). Implemented as
blocking-trigger **Exceptions** rather than editing the tags' firing triggers, so `All Pages`/
`History Change` on each tag were left untouched:
1. Data Layer Variable `DLV - Active Tags` (reads the `activeTags` dataLayer key).
2. Trigger `Exception - CS Disabled` — Custom Event, event name regex `.*` (matches any event
   name, so the exception evaluates correctly on both `All Pages`-triggered and
   `History Change`-triggered evaluations, not just page load), condition
   `DLV - Active Tags` does not contain `cs`.
3. Trigger `Exception - Heap Disabled` — same shape, does not contain `heap`.
4. Both attached as **Exceptions** (found via the Triggering box → click into it → "Add
   Exception", not obvious at first glance) on their respective tags.
5. Published.

Waseem verified live after publishing (dataLayer checks + GTM Preview/Tag Assistant, including
specifically checking the `History Change` event triggered by an in-SPA nav click, not just the
initial pageview) — confirmed working as expected. Hotjar's `Exception - Hotjar Disabled` will
follow the same pattern once Phase 5 creates that tag.

## GTM container

- Container ID: `GTM-W925CGJH` — a fresh sandbox container created for this project, owned by Waseem.
- Published version is live (not just a draft).
- Tags currently in it:
  - **Contentsquare - Main tag (web)** — official template, project `3977`, tag ID `2c5142b15f133`. **Active/live.**
  - **Heap Tag** — Custom HTML. **Paused.** App ID `209188840`, belongs to Mohammad Al-Badah, who has **permanently** approved its use (no longer a temporary placeholder — see `PLAN.md` intro and Phase 15 for eventually replacing it with Support's own ID).
- This container was originally seeded by copying two tags out of `GTM-W989V5M` (Mohammad Al-Badah's own container) using GTM's "copy to another container" action, which does not modify the source. Nothing in `GTM-W989V5M` was ever changed — don't touch it.
- To change anything in GTM-W925CGJH: go to tagmanager.google.com, open the container, edit, then **Submit/Publish a new version** (draft changes alone don't go live).

## Known blockers / open items

- **Hotjar tag** — not wired up yet. Real snippet/site ID already researched, see `PLAN.md` Phase 5. **Hotjar is back in scope** (the earlier "explicitly out of scope" decision was reversed 2026-09-23 — ignore any older note that says otherwise).
- **Heap Tag stays paused** in `GTM-W925CGJH` regardless of the switcher — the exception logic is wired up correctly on it, but pause state overrides everything, so it can't be meaningfully tested firing until/unless it's unpaused (a separate decision from Phase 4, not made here).

## How this site is structured

See `DEVELOPER.md` — it now covers this in more detail (project structure, adding a page, the
tag switcher, dependency rationale) and supersedes the old bullet-point version of this section.
Quick pointers: GTM snippet + the tag-switcher inline script must both be copied
byte-identical when adding a new standalone page; SPA pages reuse `EventLog`/`useEventLog` for
the log pattern instead of duplicating it; styling is `src/styles.css` (SPA) and
`public/shared.css` (standalone pages) — kept in sync by hand, not shared via import.

## Verification workflow used so far

For each phase, after building: use the claude-in-chrome browser tools to actually click through the live GitHub Pages site (not just read the code) and confirm the real network requests hit Contentsquare's expected endpoints (e.g. `/errors`, `/custom-errors`, `/api-errors`, `/transaction`). This caught a real bug already (Phase 2's original `httpstat.us` dependency was flaky and silently failed — replaced with verified-stable endpoints). Keep doing this before calling a phase done.

Gotchas hit during verification:
- GitHub Pages can take 10–20+ seconds to rebuild after a push, and browsers can cache the old version even past that — use a fresh tab or a cache-busting query param (`?v=N`) to confirm.
- The browser automation's `read_network_requests`/`read_console_messages` tools only capture activity *after* they're first called on a tab — call them once to attach, then act, then call again to read.
- Element `ref_N` ids from `find` sometimes go stale after a network-tool call on the same tab; if a click doesn't seem to register (log doesn't update), re-run `find` for a fresh ref before clicking again.

## Where the full context lives

Waseem's Claude memory (not in this repo) has the full history under the "Support Tag Test Site" memory entry — Confluence/Jira research findings behind each phase, the discovery of Mohammad's containers/repo, and all decisions made along the way. This file is the repo-local subset needed to keep building without re-deriving the operational setup.
