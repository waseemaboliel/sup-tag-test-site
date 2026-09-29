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

## Phase 7 — Hotjar Coverage & Behavior Lab

See [HOTJAR-REFERENCE.md](HOTJAR-REFERENCE.md) for the canonical Hotjar research and test rules.

**Priority: high.** Hotjar is live in the GTM container, but the site currently exercises only
the basic tag load and one identify call. This phase makes the playground useful for the Hotjar
questions Support sees in practice and keeps every test selectable through the existing
`All / Contentsquare / Heap / Hotjar` switcher.

**Goal:** understand and reproduce what the Hotjar tag can collect, what is configured in the
Hotjar dashboard rather than fired by page code, and how Hotjar behaves on SPA routes, events,
identified users, consent changes, masked content, forms, and first-party embedded documents.

**Research baseline:** the project has verified the Hotjar site ID `2866949`, the standard
`static.hotjar.com/c/hotjar-{id}.js?sv={version}` loader, and the browser calls
`window.hj('event', 'eventName')` and `window.hj('identify', userId, attributes)`. The Identify API
reference confirms that User Attributes must be enabled for the Hotjar site, supports up to 100
attributes per site, limits attribute names to 50 characters, and stores the latest values sent
for each user. User IDs should be stable, unique, non-PII strings and cannot be changed without
Hotjar treating the value as a new user. A known user ID should be used for identifiable test
data; when the ID is unknown, `null` is allowed but attributes must not contain PII. Attribute
values can be booleans, numbers within JavaScript's safe integer range, strings up to 200
characters, or ISO-8601 dates. Email addresses may only be sent under the `email` attribute key,
and should not be used as the user ID except as a last resort. Identify should run on page load,
after every SPA URL change, and whenever an attribute changes; repeated unchanged calls may be
skipped by Hotjar. The Events API reference confirms that event names are limited to 250 characters and the characters
`a-z A-Z 0-9 _ - space . : | /`; there is no event-properties payload. Hotjar supports up to
10,000 unique events per site, but only the first 50 unique events in a session are searchable
by recording filters. Events must never contain PII, email/IP data, 9+ digit numbers, timestamps,
URLs/referral codes, product SKUs, or detailed error logs. If Events and Identify are combined,
Identify must execute first or survey targeting may not match. The tracking code must be loaded
before calling `hj`; the documented queue fallback is
`window.hj=window.hj||function(){(hj.q=hj.q||[]).push(arguments);};`. Legacy `trigger` and
  `tagRecording` calls remain supported but are not equivalent to searchable Events or survey
  targeting. Hotjar's Tracking Code uses first-party cookies plus local and session storage; it
  does not properly load its components when cookies are disabled. The main session cookie lasts
  30 minutes and extends with activity, while the site-level user cookie persists for 365 days.
  User Attributes are also cached in local storage, and Survey invite/completion/minimized state
  is stored in dedicated cookies for 365 days. Hotjar cookies use the top-level domain and cannot
  be restricted to one subdomain.

**Add a Hotjar test area/page with:**

- **Tag lifecycle:** show whether `window.hj` and the Hotjar script are available, record the
  active vendor mode, and verify that switching to Hotjar-only prevents CS/Heap test calls from
  being made. Confirm that SPA navigation does not inject the Hotjar script repeatedly. Add a
  storage diagnostics panel showing Hotjar cookies, local storage, and session storage without
  exposing full cookie values.
- **Page and SPA behavior:** navigate across several routes, exercise query-string changes, and
  re-run Identify after each URL change with the latest complete test-user attributes. Add the
  documented Hotjar `stateChange` call when manual tracking is selected. Test the default
  automatic mode (path changes, excluding fragments/query strings), automatic mode including
  fragments, and manual mode with unique paths. Compare the resulting pages, sessions, paths,
  and latest User Attribute values in the Hotjar dashboard.
- **Custom events:** buttons for predictable events such as `hotjar_test_started`,
  `hotjar_checkout_started`, `hotjar_modal_opened`, `hotjar_test_completed`,
  `hotjar_error_occurred`, and `hotjar_variant_a_displayed`, plus rapid duplicate events and
  validation-boundary cases. Include an event-name validator and a visible warning that Events
  carry only a name, not properties. Add a controlled first-50-unique-events test without
  generating unbounded names. Organize the controls around support goals: successful/failed
  checkout outcomes, error investigation, A/B-test variants, and Survey targeting. Include a
  note that ordinary click analysis should use Hotjar's Clicked Element filter instead of a
  custom Event. Use valid Events to filter Recordings and Heatmaps, create a Recording Segment,
  target a Survey, and start session capture in the dashboard.
- **User identification and attributes:** login/logout controls that call the documented Hotjar
  Identify API with a stable non-PII test user and safe attributes such as `plan`, `role`, and
  `testRun`. Include attribute changes during one session, a repeat-unchanged call, a new stable
  user, and an unknown-user `null` case with only non-PII attributes. Add validation for the
  50-character attribute-name and 200-character string-value limits, booleans, safe numbers,
  ISO-8601 dates, and the reserved `email` attribute behavior without using a real email address.
  Verify the recommended page-view cadence: send the latest complete attribute set on every page
  view and after SPA URL changes, not only when the login button is clicked. Keep the direct app
  controls for deterministic tests, and document the optional GTM implementation separately:
  Data Layer Variables feeding a Custom HTML Identify tag, fired after Hotjar on All Pages and
  published to Live. Any future GTM Attribute tag must use the existing tag-switcher exception.
  Add safe segmentation and Survey-targeting examples for `role`, `plan`, `subscription_type`,
  `language`, `on_trial`, `widgets_opt_out`, purchase-total buckets, and signup dates. Include a
  deliberate warning against one-attribute-per-SKU or other high-cardinality designs because the
  site-wide limit is 100 unique attribute names. Keep all PII tests synthetic and demonstrate
  that identifiable attributes require a stable User ID for later lookup/deletion.
  The page should show that User Attributes must first be enabled in Hotjar Settings and should
  never send names, card data, or other real personal data.
- **Consent and opt-out:** explicit opt-in, opt-out, and re-consent controls using the current
  documented Hotjar mechanism. Show the current local consent state, explain when a reload is
  required, and verify the Network panel plus recording behavior after each transition. Do not
  assume the legacy `hj('consent')` call is still the complete API until the current docs confirm
  its arguments and behavior. Add a separate verification path for browser Do Not Track and
  dashboard/IP blocking: confirm that collection is blocked as expected, while documenting the
  exception that an explicitly submitted Survey response may still be collected under Do Not
  Track. Do not fake IP blocking in page code.
- **Cookie and storage edge cases:** test normal storage, cookies disabled, local storage
  disabled, and session storage disabled where the browser allows it. Confirm that Hotjar does
  not record when cookies are disabled, that a session continues across route changes, and that
  a new session/user context appears after the relevant storage is cleared. Add a safe reset
  control that clears only this site's Hotjar-related storage after warning the tester. Verify
  that User Attribute caching and Survey completion/minimized state behave as documented.
- **Recording, heatmap, and form behavior:** a realistic interaction surface with clicks,
  scrolling, hover/focus states, an accordion, modal, dynamic content, a long page, and a form.
  Include deliberately suppressed and unsuppressed controls so Support can compare Recordings,
  Heatmaps, and Survey screenshots. The current suppression guidance says user input is
  suppressed by default, numbers with 9 or more digits are always suppressed, and data is
  suppressed before transmission with no retroactive cleanup after collection. Test text,
  number, date, placeholder, email-like, credit-card-like, and long-phone-number inputs, plus
  allowed-input behavior only when the dashboard setting permits it. Add text, image, and video
  elements marked with `data-hj-suppress` and with the `data-hj-suppress` class, including a
  parent element that suppresses its children. Include an inline SVG control and document that
  inline SVG cannot be suppressed by this mechanism, while an SVG used as an image source can be.
  Document the dashboard-side site-wide/page-specific suppression settings and the requirement
  for Admin access without pretending page code changes those settings.
- **Feedback and survey targeting:** document the dashboard-side setup needed to target a test
  survey or feedback widget by URL, event, or user attribute. Cover Simple, Exact, Starts with,
  Ends with, Contains, and Regex URL matching, including query strings and fragments. Verify that
  JavaScript Event targeting overrides URL targeting and URL exclusions. Test Popover, Button,
  Bubble, Embedded, Full Screen, and Link Survey behavior where dashboard access allows; document
  that Link Survey responses cannot connect to Recordings because they run on a separate domain.
  Include Survey cookie reset between repeat runs and a small Survey Logic case. The page should
  provide the exact event/attribute values that the dashboard rule expects, but should not pretend
  that page code alone creates a survey.
- **First-party iframe behavior:** add a parent page and a child page hosted by this project,
  each with a clearly reported Hotjar mode. Compare a normal first-party iframe, a sandboxed
  iframe, and a child without the tag. Keep third-party video iframes out of the Hotjar claim:
  the site cannot inject Hotjar into vendor-owned iframe content.
- **Cross-vendor rendering and DOM edge cases:** add a shared test track for Hotjar, Contentsquare,
  and Heap so Support can compare what each tag sees from the same page. It should include:
  - An infinite-scroll PLP-style surface that appends rows, product-like cards, images, text, and
    controls while the visitor scrolls. Record initial content, appended content, repeated loads,
    rapid scrolling, and lazy media behavior.
  - Canvas elements with text-like drawing, shapes, pointer interactions, redraws, resizing, and
    a control HTML fallback. Compare what each vendor can record or attribute when the content is
    pixels rather than DOM nodes.
  - Open and closed Shadow DOM components with buttons, inputs, dynamic updates, and adopted
    stylesheets. Compare host-versus-inner-element attribution, masking/suppression boundaries,
    replay rendering, and whether closed roots are observable at all.
  - Same-origin and cross-origin iframe cases, including a child with each vendor tag, a child
    without tags, and a sandboxed child. Keep the cross-origin child on a separately served test
    origin where possible; do not claim that a parent can instrument content it cannot control.
  - For each case, show a small plain-HTML control beside the special rendering so differences
    are attributable to the DOM/canvas/shadow/iframe boundary rather than the interaction itself.
  - Keep all vendor controls behind the existing tag switcher: `All` exercises all three, while
    `Contentsquare`, `Heap`, or `Hotjar` isolates one vendor.
- **Debug readout:** display the queued Hotjar calls, current test user, emitted events, consent
  state, storage capability results, cookie names, and frame context locally. Do not attempt to
  extract or display the automatically assigned Hotjar User ID; it is browser/cookie-specific
  and unavailable to JavaScript. Add a `?hjDebug=1`
  link/control for the documented Hotjar console debugging flow and a short verification
  checklist for Hotjar recordings, heatmaps, events, user attributes, surveys, storage, and
  network requests. Never display raw cookie or local-storage values because User Attributes can
  be present there.

**GTM/design constraints:** keep GTM as the source of Hotjar tag loading; do not add a second
Hotjar loader to the React app. The Hotjar tag remains an `All Pages` tag and is gated by the
existing `Exception - Hotjar Disabled` trigger. Page code may call `window.hj` after the tag's
queue is initialized, but must safely handle the Hotjar-only tag being disabled or blocked. Do
not attach Hotjar to History Change or other SPA triggers, since multiple Tracking Code loads are
unsupported and can cause missing or incorrect tracking. Verify exactly one Hotjar script in the
Network panel. The official `@hotjar/browser` package exists, but is out of scope while GTM is the
chosen loader.

**Dashboard verification required:** test on the deployed GitHub Pages domain with Hotjar site
`2866949`, using recordings, heatmaps, Events, User Attributes, and an intentionally configured
test survey/feedback widget. Localhost is suitable for UI checks but is not proof that Hotjar
data is accepted by the live site configuration. Use synthetic values only, never send IP
attributes or customer PII, verify HTTPS collection and client-side suppression, and remember
that Hotjar Recordings are not backed up.

**Status:** in progress (2026-09-29). The `/hotjar-lab` route now implements the documented
Events, Identify/User Attributes, manual `stateChange`, storage capability checks, debug-mode
reload, and suppression fixtures. Consent/opt-out and allowed-keystroke controls remain excluded
until their exact current APIs are documented. The `/infinite-scroll` route implements the PLP
surface with appended batches, lazy images, manual loading, and cross-vendor interaction signals.
The remaining rendering edge-case surfaces are next.

The `/rendering-lab` route now implements canvas-versus-HTML and open/closed Shadow DOM
comparisons, including adopted stylesheet detection and cross-vendor interaction signals.
The `/iframe-lab` route now implements tagged and untagged same-origin children, a sandboxed
child, and a cross-origin comparison with explicit first-party context reporting.
The `/survey-targeting` route now provides stable URL/query/fragment fixtures and
Identify-before-Event controls for dashboard-configured Survey tests. Consent and intentionally
allowed keystrokes remain deferred until their current documentation is available.

### Proposed implementation order

1. **Hotjar Lab foundation:** Events, Identify/User Attributes, manual SPA state changes, debug
  mode, and safe storage diagnostics.
2. **Privacy lab:** suppression examples, form inputs, masked media, and dashboard verification.
3. **Infinite-scroll PLP:** shared realistic page for all three vendors.
4. **Shadow DOM:** open root first, then closed root and adopted stylesheet comparison.
5. **Canvas:** drawable content, pointer interactions, redraw/resize, and HTML fallback.
6. **Iframes:** same-origin child, sandboxed child, no-tag child, then cross-origin child.
7. **Survey and consent verification:** configure dashboard rules and add only the APIs confirmed
  by the remaining documentation.

This order gives us a useful Hotjar page early and makes each later rendering boundary a focused
comparison instead of one large diagnostic page.

