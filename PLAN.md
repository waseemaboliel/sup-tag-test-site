# Roadmap

This site started as a minimal 3-page static playground (home, page-two, events) to confirm Contentsquare and Heap tags fire correctly through a dedicated GTM sandbox container (`GTM-W925CGJH`). It's now growing into a real npm-based project: a switchable multi-vendor tag playground (Contentsquare / Heap / Hotjar / All) rebuilt as an SPA, with a couple of pages deliberately kept as plain multi-page-app (MPA) pages so Support can compare Artificial Pageviews (APV, SPA route change) against Natural Pageviews (real page load) side by side.

Tackle phases one at a time, in priority order below — each is mostly self-contained, but **Phases 3–5 are new and take priority over everything from Phase 6 onward**, since they change the project's foundation (build tooling, tag-loading pattern) that later phases will build on top of.

Hotjar is **back in scope** (previously excluded — reversed 2026-09-23). Heap's App ID is no longer a temporary placeholder — Mohammad Al-Badah has approved permanent use of his App ID `209188840` for this project, so it's now treated the same as the borrowed-but-sanctioned CS project (3977).

## Phase 0 — Done

- Static site skeleton (`index.html`, `page-two.html`, `events.html`) with the GTM snippet on every page.
- GTM container `GTM-W925CGJH`: Contentsquare "Main tag" template (project 3977, tag `2c5142b15f133`, live) + Heap Custom HTML tag (paused, App ID `209188840`, borrowed from Mohammad Al-Badah).
- Published to GitHub Pages: https://waseemaboliel.github.io/sup-tag-test-site/

## Phase 1 — Ecommerce & Transactions — Done

**Status:** done — `cart.html`, `checkout.html`, `guest-checkout.html`. See git history for full detail (kept out of this doc per Waseem's request to drop implementation-history notes from planning text once a phase ships).

## Phase 2 — Error Analysis Testing — Done

**Status:** done — `errors.html`, `api-errors.html`.

## Phase 3 — SPA Conversion & npm Project Rebuild — Done

**Priority: high (new, 2026-09-23). Foundation for Phases 4 and 5 — build this first so the tag switcher and Hotjar tag get built natively into the new architecture instead of twice (once in static HTML, once in the SPA).**

**Goal:** turn the project into a real npm-based single-page app, so we can also exercise the GTM "History Change" trigger Waseem already added to the CS Main tag config (APV support) — and give Support a live side-by-side of Artificial Pageview (SPA route change) vs. Natural Pageview (full page load).

**Approach:**
- Rebuild with **Vite + React + React Router**. (Native JS/vanilla or Angular would also work per Waseem's "anything that builds to static files is fine," but React + Vite is the lowest-friction default here — it's also the direction Hotjar's own `hotjar/sandbox` repo is already migrating toward in its `public/spa` folder, so there's internal precedent to match.) **Router choice revised 2026-09-23:** originally shipped with `HashRouter` (routes like `/#/cart`) to sidestep GitHub Pages having no server-side rewrites. Switched to `BrowserRouter` (clean URLs like `/cart`) after Waseem tested the tag switcher and expected `/cart?tags=all`, not `/?tags=all#/cart` — query strings only parse correctly before a `#fragment`, so hash routing and a visible `?tags=` really don't mix well. Fixed properly with the standard [rafgraph/spa-github-pages](https://github.com/rafgraph/spa-github-pages) `404.html` redirect trick instead — see `DEVELOPER.md`'s "Clean URLs on GitHub Pages" section for exactly how it works.
- Port every existing page (`index`, `page-two`, `events`, `cart`, `checkout`, `guest-checkout`, `errors`, `api-errors`) into SPA routes/components, preserving their existing test-button behavior exactly.
- **Deliberately keep 1–2 pages as real separate `.html` documents, outside the SPA/router entirely** — plain `<a href="...">` links (full browser navigation, own `<head>`, own GTM snippet boilerplate) so there's a genuine Natural Pageview to compare against. Good candidates: keep `errors.html` and `api-errors.html` as standalone MPA pages (they're self-contained button pages, low risk to leave out of the router) while everything else moves into the SPA shell.
- Every SPA route change must fire the documented artificial-pageview push via `history.pushState`-driven navigation (React Router already does this) — confirms the History Change trigger Waseem wired up actually catches it, mirrors the old Phase 4 SPA testing goal (`spa.html`, now superseded by the whole site being the test case).
- New tooling: `package.json` (Vite, React, React Router, `gh-pages` or a GitHub Actions Pages-deploy workflow), replacing the current "push raw HTML" flow with a real build step.
- Give the whole site a real design pass — Waseem asked for "really good styles" as part of this rebuild, not just a mechanical port. Shared layout/nav component, consistent look across all SPA routes.
- **Deliverable includes a `SETUP.md`** (or folded into `README.md`) documenting: required Node version, `npm install`, `npm run dev`, `npm run build`, `npm run deploy` (or the CI workflow), the full dependency list, and *why* each dependency is needed — so anyone picking this project up doesn't have to reverse-engineer the build.

**Why:** the current plain-HTML setup can't demonstrate APV vs. PV at all (every page load is already a Natural Pageview), and Waseem explicitly wants this treated as an opportunity to move off "simple html" into a proper project.

**Status:** done (2026-09-23, router revised same day — see above). Rebuilt with Vite + React + React Router; all 6 pages (Home, Page Two, Events, Cart, Checkout, Guest Checkout) ported to SPA routes; `errors.html`/`api-errors.html` kept as real standalone documents in `public/`, restyled to match but otherwise untouched (no React/JS bundle). New design system in `src/styles.css`. GitHub Actions workflow (`.github/workflows/deploy.yml`) added to build + deploy to Pages on push; GitHub Pages source flipped to "GitHub Actions". Full setup/run/deploy/dependency documentation in `DEVELOPER.md`. Verified locally and live: clicked through routes and both standalone pages via browser automation, confirmed routing, log buttons, and GTM snippets all work.

## Phase 4 — Tag Switcher / Unified Tag Control — Done

**Priority: high (new, 2026-09-23). Depends on Phase 3's SPA shell existing (build the switcher once, natively, inside the new layout/nav component) — do this right after Phase 3, or as part of the same PR if that's cleaner.**

**Goal:** let each visitor pick which vendor tag(s) actually fire — some Support folks only care about Contentsquare, some only Heap, some only Hotjar, and some want everything at once. **Default = all three firing together.**

**Design (GTM stays the single source of truth — no duplicate tag-loading logic in app code):**
- A small persistent control in the shared nav/header (segmented control or dropdown: `All / Contentsquare / Heap / Hotjar`), present on every SPA route and on the standalone MPA pages too.
- Selecting a value writes it to `localStorage` (e.g. `supTagTestSite.activeTags`) and reloads the current route so tags re-evaluate cleanly (GTM tags fire at page/route load, not reactively).
- Before the GTM snippet loads on every page, an inline script reads that stored value (defaulting to `all` if nothing is stored yet) and pushes it into the dataLayer, e.g. `dataLayer.push({activeTags: ['cs','heap','hotjar']})`.
- In GTM (console-side change, documented here since it's not in code): add a Data Layer Variable `Active Tags`, then add a blocking/firing condition to each of the 3 vendor tags — e.g. the CS Main tag only fires when `Active Tags contains 'cs'` (same pattern for Heap and the new Hotjar tag from Phase 5). Requires editing `GTM-W925CGJH` and publishing a new version.
- Also support a `?tags=cs|heap|hotjar|all` URL query param as an override, so a specific pre-set view can be shared via link without touching the UI control.

**Why:** different Support colleagues want different signal-to-noise — someone debugging a Heap-only ticket doesn't want CS/Hotjar console noise or cross-vendor session overlap, but the default experience should still be "everything fires," matching how the site behaves today.

**Status:** app/code side done (2026-09-23) — GTM console side still pending. Shipped:
- The inline dataLayer-push script (URL `?tags=` override → localStorage → default `'all'`) in
  `index.html`, `public/errors.html`, and `public/api-errors.html` — byte-identical across all
  three so the choice is honored no matter which document loads first.
- The visible "All / Contentsquare / Heap / Hotjar" segmented control in the shared header,
  present on every page (React component in the SPA, a small vanilla-JS-rendered equivalent on
  the two standalone pages) — selecting a mode persists to `localStorage` and reloads.
- Verified locally: switching modes updates `window.dataLayer`'s `activeTags` entry correctly,
  the choice persists through a reload, and it carries across from an SPA route to a standalone
  MPA page (shared `localStorage`, confirmed via browser automation).

**GTM console side — done and published (2026-09-23).** Implemented as blocking-trigger
"Exceptions" rather than firing conditions, so the existing `All Pages` + `History Change`
firing triggers on each tag didn't need to be touched at all:
1. Data Layer Variable `DLV - Active Tags`, reading the `activeTags` key.
2. Trigger `Exception - CS Disabled` — Custom Event, event name regex `.*` (matches any event,
   so it evaluates correctly regardless of whether the tag is firing from `All Pages` or
   `History Change`), condition `DLV - Active Tags` does not contain `cs`.
3. Trigger `Exception - Heap Disabled` — same pattern, does not contain `heap`.
4. Both added as **Exceptions** (not firing triggers) on their respective tags — CS Main tag
   and Heap Tag keep their original firing triggers unchanged, just get blocked when the
   exception trigger also matches.
5. (Hotjar's `Exception - Hotjar Disabled` gets added as part of Phase 5, once its tag exists.)
6. Published to `GTM-W925CGJH`.

**Verified live by Waseem** after publishing: dataLayer/mode checks and GTM Preview/Tag
Assistant checks (both the `Container loaded` event and, critically, the `History Change` event
from an in-SPA nav click) all behaved as expected — CS Main tag fires under `all`/`cs` and is
correctly blocked under `heap`/`hotjar`, including during SPA route changes. Heap Tag itself
still can't be meaningfully tested since it remains paused (untouched by this phase) — it shows
"Paused" as its non-firing reason regardless of the exception, until a manual unpause changes
that.

## Phase 5 — Re-add Hotjar + Finish Heap Rollout — Done

**Priority: high (new, 2026-09-23; scope expanded 2026-09-23 to also close out Heap). Depends on Phase 4's switcher existing (Hotjar becomes the 3rd switchable source) — do this right after Phase 4. Expected to be the last GTM console work this project needs for a while — once both parts land, all 3 vendor tags are fully wired to the switcher with no pending config debt.**

**Goal:** bring Hotjar back in using the real legacy Tracking Code (TC), reusing the Hotjar site Waseem is getting admin access to — and finish the one loose end left over from Phase 4: the Heap tag is fully wired to the switcher (`Exception - Heap Disabled` is attached and confirmed correct) but still sits paused in GTM, so it's never actually been observed firing for real.

**Researched from `github.com/hotjar/sandbox`** (Hotjar Support's own public sandbox repo, served at `sandbox.hotjar.com` — checked 2026-09-23):
- Confirmed the site ID in their tracking snippet is **`2866949`** — the exact same ID as `https://insights.hotjar.com/sites/2866949/dashboard`, the dashboard Waseem is getting admin access to. **This is literally Hotjar Support's own internal sandbox site** — no new Hotjar account/site is needed to get the tag itself working; only *viewing* results (recordings, heatmaps) in the dashboard is gated on the pending admin access. The tag can be wired up and go live before that access lands.
- Real snippet, copied from their `public/index.html`:
  ```html
  <script>
      (function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:2866949,hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
  </script>
  ```
- Their repo shows two install patterns worth knowing about: the tag hardcoded directly in `<head>` on their main `index.html`, vs. loaded through their *own* separate GTM container (`GTM-TQGPGN3`, not ours, not to be touched) on their `gtm-home.html` page. There's also a leftover commented-out `<div data-hotjar-id="2866949">` from an old ticket repro (ticket 262030) — a div-based install variant worth knowing exists but not urgent to replicate.
- Their events/attributes API calls (from `public/resources/scripts/functions.js`), useful reference for a later events-testing page: `window.hj('event', 'eventName')` and `window.hj('identify', userId, { attr: value, ... })`.

**Add — Hotjar:**
- Wire the snippet above into `GTM-W925CGJH` as a new Custom HTML tag (keeps all 3 vendors under one container, consistent with how CS/Heap are managed).
- Add a `Exception - Hotjar Disabled` trigger, following the exact Phase 4 pattern (Custom Event, event name regex `.*`, condition `DLV - Active Tags` does not contain `hotjar`), and attach it as an Exception on the new Hotjar tag.
- Publish. Tag goes live but is effectively inert until a visitor's switcher selection actually includes `hotjar`.
- Re-add Hotjar mentions to the site's nav/info box/README (previously explicitly stripped out when Hotjar was ruled out of scope) — remove the "Hotjar is out of scope" language everywhere it still appears.
- Once Waseem's admin access to the dashboard lands, do a live-verification pass (same browser-driven network/console check used for Phases 1–2) confirming recordings/heatmaps actually populate at `insights.hotjar.com/sites/2866949`.

**Add — Heap:**
- Unpause the existing Heap Tag in `GTM-W925CGJH` (App ID `209188840`, permanently approved by Mohammad Al-Badah — no longer just a placeholder, see the roadmap intro). Its `Exception - Heap Disabled` trigger is already attached and confirmed correctly wired from Phase 4 — unpausing is the only remaining step.
- Publish alongside the Hotjar changes above (one version covers both).
- Live-verify Heap actually fires when the switcher is set to `heap` or `all` (same GTM Preview/Tag Assistant method used to verify Phase 4, but this time checking Heap's tag status specifically, not just that the exception is attached) — this hasn't been possible to confirm until now since the tag was paused throughout Phase 4.

**Why:** completes the 3-vendor lineup the switcher (Phase 4) is designed around using a real, already-live Hotjar site ID instead of a placeholder, and closes out the one piece of Phase 4 that couldn't be finished at the time (Heap was paused for unrelated historical reasons — see `CONTINUE.md` — throughout that phase's GTM work).

**Status:** done (2026-09-23). Hotjar Tag added to `GTM-W925CGJH` with the real snippet above, `Exception - Hotjar Disabled` attached (same regex-`.*` Custom Event pattern as Phase 4); Heap Tag unpaused; both published in one version. Waseem confirmed live that everything works — all 3 vendor tags are now correctly gated by the switcher with no pending GTM config debt. Site copy updated (`Home.jsx`: "(soon) Hotjar" → "Hotjar", info box now lists the Hotjar site ID instead of the Heap/Mohammad attribution line). Still pending, but non-blocking: live-verifying actual Hotjar recordings/heatmaps at `insights.hotjar.com/sites/2866949` once Waseem's dashboard admin access lands — the tag firing itself is already confirmed, this is just confirming the *data* shows up on the Hotjar side.

## Phase 6 — User Identity & Session

*(Previously Phase 3.)*

**Goal:** test cross-tool user identification and "logged in" state handling.

**Add:**
- A `login.html` page (or SPA route, once Phase 3 lands) with fake "Log in" / "Log out" buttons that:
  - Toggle a Contentsquare dynamic variable, e.g. `loggingStatus` = `logged`/`anonymous` (same pattern as the WebView checkout test page).
  - Call `heap.identify('test-user-123')` and `heap.addUserProperties({ plan: 'test' })` on login (mirrors the "Heap Identify Button" already built in Mohammad's separate Next.js test app — reference only, don't reuse his code/account).
  - Call `heap.resetIdentity()` on logout.
  - Also call `window.hj('identify', 'test-user-123', { plan: 'test' })` for Hotjar parity.

**Why:** user-ID mapping and session-continuity issues are common between Heap and Contentsquare when identity commands are missed or mistimed.

**Status:** app/code done (2026-09-29). Added the `/login` SPA route with fake Log in/Log out
buttons and an on-page state/log readout. Login queues the Contentsquare
`loggingStatus=logged` dynamic variable, calls `heap.identify('test-user-123')` plus
`heap.addUserProperties({plan: 'test'})`, and calls `window.hj('identify', 'test-user-123',
{plan: 'test'})`. Logout queues `loggingStatus=anonymous` and calls `heap.resetIdentity()`.
Each action reports whether the vendor API was available, so the page remains useful when a tag
is disabled in the Phase 4 switcher or blocked by the browser. Remaining verification is to
deploy and confirm the identity/session behavior in the Contentsquare, Heap, and Hotjar tools.

