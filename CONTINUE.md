# Continuation Notes

Working state and context needed to pick this project back up in a future session. PLAN.md has the feature roadmap; this file has the operational details that aren't in the repo's code or commit history.

## Current state

- Phase 0 (site skeleton + GTM setup), Phase 1 (Ecommerce & Transactions), Phase 2 (Error
  Analysis), and Phase 3 (SPA/npm rebuild) are done. Phases 3's build has been verified locally
  (`npm run build` + `npm run preview`, clicked through via browser automation) but **not yet
  verified on the live deployed site** — see "Not yet done" below.
- Phase 4 (Tag Switcher) app-code side is done; its GTM console side (Data Layer Variable +
  firing conditions) is not — see "Phase 4" below. Phase 5 (Re-add Hotjar) is next up after that,
  not started. See `PLAN.md`.
- Live site: https://waseemaboliel.github.io/sup-tag-test-site/ — up to date through Phase 4's
  app-code changes as of this note.
- Repo: https://github.com/waseemaboliel/sup-tag-test-site (public)
- **The project is no longer plain static HTML.** It's now a Vite + React + React Router SPA,
  with two pages (`public/errors.html`, `public/api-errors.html`) deliberately kept as real
  standalone documents outside the SPA. **Read `DEVELOPER.md` before touching this repo again** —
  it has the full local setup, run, build, and deploy instructions, plus exactly where the
  Phase 4/5 hooks (tag switcher dataLayer push, switcher UI) go in the code.

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
- **Still open:** whether the CS Main tag's History Change trigger actually catches the SPA's
  `HashRouter` navigation hasn't been directly confirmed (would need checking GTM's debug/preview
  mode while clicking SPA routes on the live site) — flagged in `DEVELOPER.md`'s GTM reference
  section as the first thing to check if Artificial Pageviews don't show up as expected.

## Phase 4 — Tag Switcher (2026-09-23)

App-code side is fully done and live-verified locally (see `PLAN.md` Phase 4 for exact detail):
inline dataLayer-push script (URL `?tags=` → localStorage → default `all`) duplicated
byte-identically across `index.html`/`public/errors.html`/`public/api-errors.html`; visible
"All / Contentsquare / Heap / Hotjar" segmented control in the header (React in the SPA, vanilla
JS on the two standalone pages), backed by the shared `localStorage` key
`supTagTestSite.activeTags`. Confirmed via browser automation: switching modes updates
`window.dataLayer`, persists through reload, and carries over between the SPA and the standalone
pages correctly.

**Not yet pushed to the live site as of writing this note** — was about to push + rely on the
now-working auto-deploy (no more manual Pages-source flip needed, that's permanent now).

**GTM console work still needed (not done, not automatable from here):**
1. Add a Data Layer Variable `Active Tags` (reads the `activeTags` dataLayer key).
2. Add a firing condition to the CS Main tag: `Active Tags` contains `cs`.
3. Same for the Heap tag: `Active Tags` contains `heap`.
4. Hotjar's condition gets added once Phase 5 creates that tag.
5. Publish a new GTM-W925CGJH version.

Until this is done, the switcher UI is fully functional and the correct data reaches
`window.dataLayer`, but it has **zero actual effect** — GTM isn't checking `Active Tags` for
anything yet, so both tags keep firing on every page regardless of the selected mode. This was
deliberately left for Waseem to do (or explicitly hand to an agent via browser automation) rather
than done unilaterally, since it means editing and publishing the live shared GTM container.

## GTM container

- Container ID: `GTM-W925CGJH` — a fresh sandbox container created for this project, owned by Waseem.
- Published version is live (not just a draft).
- Tags currently in it:
  - **Contentsquare - Main tag (web)** — official template, project `3977`, tag ID `2c5142b15f133`. **Active/live.**
  - **Heap Tag** — Custom HTML. **Paused.** App ID `209188840`, belongs to Mohammad Al-Badah, who has **permanently** approved its use (no longer a temporary placeholder — see `PLAN.md` intro and Phase 15 for eventually replacing it with Support's own ID).
- This container was originally seeded by copying two tags out of `GTM-W989V5M` (Mohammad Al-Badah's own container) using GTM's "copy to another container" action, which does not modify the source. Nothing in `GTM-W989V5M` was ever changed — don't touch it.
- To change anything in GTM-W925CGJH: go to tagmanager.google.com, open the container, edit, then **Submit/Publish a new version** (draft changes alone don't go live).

## Known blockers / open items

- **GTM config for the tag switcher (Phase 4)** — see above, not done yet.
- **Hotjar tag** — not wired up yet. Real snippet/site ID already researched, see `PLAN.md` Phase 5. **Hotjar is back in scope** (the earlier "explicitly out of scope" decision was reversed 2026-09-23 — ignore any older note that says otherwise).

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
