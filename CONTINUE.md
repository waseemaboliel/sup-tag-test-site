# Continuation Notes

Working state and context needed to pick this project back up in a future session. PLAN.md has the feature roadmap; this file has the operational details that aren't in the repo's code or commit history.

## Current state

- Phase 0 (site skeleton + GTM setup) and Phase 1 (Ecommerce & Transactions) and Phase 2 (Error Analysis) are done and live-verified.
- Phase 3 (User Identity & Session) is next up, not started.
- Live site: https://waseemaboliel.github.io/sup-tag-test-site/
- Repo: https://github.com/waseemaboliel/sup-tag-test-site (public)

## GTM container

- Container ID: `GTM-W925CGJH` — a fresh sandbox container created for this project, owned by Waseem.
- Published version is live (not just a draft).
- Tags currently in it:
  - **Contentsquare - Main tag (web)** — official template, project `3977`, tag ID `2c5142b15f133`. **Active/live.**
  - **Heap Tag** — Custom HTML, copied in as a starting point. **Paused.** Still carries a borrowed/placeholder Heap App ID (`209188840`) that belongs to Mohammad Al-Badah — do not unpause or publish anything that relies on this actually reaching Heap until Support has its own App ID.
- This container was originally seeded by copying two tags out of `GTM-W989V5M` (Mohammad Al-Badah's own container) using GTM's "copy to another container" action, which does not modify the source. Nothing in `GTM-W989V5M` was ever changed — don't touch it.
- To change anything in GTM-W925CGJH: go to tagmanager.google.com, open the container, edit, then **Submit/Publish a new version** (draft changes alone don't go live).

## Known blockers / open items

- **Heap App ID:** still using Mohammad's borrowed ID as a placeholder. Waseem messaged a colleague (Jake) asking if there's an existing Heap App ID for a Support test/sandbox environment. If/when a real ID arrives: update the Heap Tag in GTM-W925CGJH, unpause it, and publish a new version.
- **Hotjar:** explicitly out of scope for this entire project — don't add it back in.

## How this site is structured

- Every page loads the GTM-W925CGJH snippet (head script block + body noscript iframe) — copy that block exactly when adding new pages.
- Each page has a nav bar linking every existing page — update all pages' nav when adding a new page, not just the new one.
- Each page has a `<div id="log">` + a `log(msg)` JS helper that prepends timestamped messages — reuse this pattern for consistency.
- Style is a single inline `<style>` block per page (no shared CSS file) — copy the existing block from any page when starting a new one.
- Page copy should be plain usage instructions ("click a button to fire X, then check Y") — no roadmap/PLAN.md cross-references or implementation-history notes in the page content itself (Waseem asked for these to be removed once already).

## Verification workflow used so far

For each phase, after building: use the claude-in-chrome browser tools to actually click through the live GitHub Pages site (not just read the code) and confirm the real network requests hit Contentsquare's expected endpoints (e.g. `/errors`, `/custom-errors`, `/api-errors`, `/transaction`). This caught a real bug already (Phase 2's original `httpstat.us` dependency was flaky and silently failed — replaced with verified-stable endpoints). Keep doing this before calling a phase done.

Gotchas hit during verification:
- GitHub Pages can take 10–20+ seconds to rebuild after a push, and browsers can cache the old version even past that — use a fresh tab or a cache-busting query param (`?v=N`) to confirm.
- The browser automation's `read_network_requests`/`read_console_messages` tools only capture activity *after* they're first called on a tab — call them once to attach, then act, then call again to read.
- Element `ref_N` ids from `find` sometimes go stale after a network-tool call on the same tab; if a click doesn't seem to register (log doesn't update), re-run `find` for a fresh ref before clicking again.

## Where the full context lives

Waseem's Claude memory (not in this repo) has the full history under the "Support Tag Test Site" memory entry — Confluence/Jira research findings behind each phase, the discovery of Mohammad's containers/repo, and all decisions made along the way. This file is the repo-local subset needed to keep building without re-deriving the operational setup.
