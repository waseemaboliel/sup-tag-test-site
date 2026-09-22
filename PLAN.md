# Roadmap

This site started as a minimal 3-page playground (home, page-two, events) to confirm Contentsquare and Heap tags fire correctly through a dedicated GTM sandbox container (`GTM-W925CGJH`). This doc tracks what's planned next, broken into independent phases. Tackle them one at a time, in any order — each is self-contained.

Hotjar is explicitly out of scope for this site.

## Phase 0 — Done

- Static site skeleton (`index.html`, `page-two.html`, `events.html`) with the GTM snippet on every page.
- GTM container `GTM-W925CGJH`: Contentsquare "Main tag" template (project 3977, tag `2c5142b15f133`, live) + Heap Custom HTML tag (paused, still holds a borrowed App ID).
- Published to GitHub Pages: https://waseemaboliel.github.io/sup-tag-test-site/

## Phase 1 — Ecommerce & Transactions

**Goal:** exercise Contentsquare's ecommerce/transaction tracking so we can reproduce funnel, goal, and GA/integration export tickets without a real customer site.

**Add:**
- A `cart.html` page: a few dummy line items, quantity inputs, a "checkout" button.
- A `checkout.html` page with a "Place order" button that fires:
  - `window._uxa.push(['trackTransaction', { value: 1000, currency: 'EUR', id: 'test-order-1' }])` (with ID)
  - and a variant without an `id` (anonymous transaction)
- The documented ecommerce command pair for the copied `Ecomm Tag`:
  ```js
  window._uxa.push(['ec:transaction:create', { id: 'test-txn-1', revenue: 49.99, currency: 'USD' }]);
  window._uxa.push(['ec:transaction:send']);
  ```
- A **second, alternate checkout path** (e.g. "guest checkout" or "3rd-party redirect checkout") that lands on the confirmation page *without* firing the commands above — reproduces the recurring "some checkout paths don't fire the transaction" pattern (TAGS-11390 Telstra; Shopify Shop Pay/3rd-party-redirect gap, TAGS-11413).
- A "replay order" button that fires the same transaction ID twice (and one with a missing currency) — reproduces inflated/duplicate-revenue tickets (SUP-23605, SUP-23573).

**Why:** transaction/funnel mismatches, missed checkout paths, and duplicate/inflated revenue are a recurring Support ticket pattern.

**Status:** done — `cart.html`, `checkout.html`, `guest-checkout.html`.

## Phase 2 — Error Analysis Testing

**Goal:** exercise all 4 error types the Error Analysis module actually captures (JS Errors, API Errors, Custom Errors, Console Messages) plus the URL-masking commands, so we have a live repro for the recurring "error not collected" / "PII in error data" ticket pattern.

Confirmed from the internal "Tag error collection quick reference" doc — this isn't 2 separate features, it's 1 module with 4 sub-types:

| Type | How it's captured | Endpoint | Notes |
|---|---|---|---|
| JS Errors | automatic, any uncaught exception | `/errors` | max 20/pageview, message capped at 1024 chars |
| API Errors | automatic, any XHR/fetch failure | `/api-errors` | default rule: status ≥ 400, **all** URLs, no config needed |
| Custom Errors | `window._uxa.push(['trackError', message, attributes])` | `/custom-errors` | auto-anonymizes emails/phones/names in the message |
| Console Messages | plain `console.log/warn/error` calls | `/custom-errors` | only shows up if the project has `customErrors.consoleMessageLogLevels` configured — otherwise nothing is captured, which is itself worth demonstrating |

**Add:**
- An `errors.html` page:
  - A button that throws a real uncaught JS error (e.g. calling an undefined function).
  - A button that sends a custom error via `trackError` with a plain message, and one with an obviously PII-shaped message (fake email/card number) to confirm auto-anonymization.
  - Buttons for `console.log`, `console.warn`, `console.error` at different levels, with a note that these only get captured if the project has console-message levels configured — good for confirming whether a customer's "missing console errors" ticket is a config gap vs. a bug.
- An `api-errors.html` page:
  - Buttons firing `fetch`/`XHR` calls to a status-code echo service (e.g. `https://httpstat.us/500`, `/404`) to generate real API errors under the default ≥400 rule.
  - A button firing a request to a URL with PII in the query string (e.g. `httpstat.us/404?email=test@test.com`), plus buttons demonstrating the masking commands `window._uxa.push(['networkRequest:maskUrls', ...])` (partial match) and `['api-errors:maskUrl', ...])` (full match) so we can confirm masking actually strips the PII before it's collected — directly relevant to SUP-21751-style "masking rule not applying" tickets.

**Why:** mirrors real Error Analysis tickets — confirms which error types are actually enabled/configured on a given project, the default ≥400 API error rule, and PII masking behavior, instead of guessing from docs alone.

**Status:** done — `errors.html`, `api-errors.html`.

## Phase 3 — User Identity & Session

**Goal:** test cross-tool user identification and "logged in" state handling.

**Add:**
- A `login.html` page with fake "Log in" / "Log out" buttons that:
  - Toggle a Contentsquare dynamic variable, e.g. `loggingStatus` = `logged`/`anonymous` (same pattern as the WebView checkout test page).
  - Call `heap.identify('test-user-123')` and `heap.addUserProperties({ plan: 'test' })` on login (mirrors the "Heap Identify Button" already built in Mohammad's separate Next.js test app — reference only, don't reuse his code/account).
  - Call `heap.resetIdentity()` on logout.

**Why:** user-ID mapping and session-continuity issues are common between Heap and Contentsquare when identity commands are missed or mistimed.

**Status:** not started.

## Phase 4 — Advanced Tag / CSP Edge Cases

**Goal:** cover the trickier install/runtime scenarios that generate the hardest Support tickets.

**Add:**
- An `spa.html` page with **two variants** of fake single-page navigation: one using `history.pushState` (URL changes) and one that only swaps DOM content (no URL change) — each followed by the documented artificial-pageview snippet. Confirms the GTM "History Change" trigger only catches the first case (SUP-23318: unexpected artificial pageviews).
- An `iframe.html` page that embeds one of our own pages inside an `<iframe>`, including a `sandbox="allow-scripts"` variant, to test whether/how tracking behaves for iframe-embedded content and reproduce the sandboxed-iframe tag-injection failure mode (2026-02-17 incident: tracking-tag doesn't start in a sandboxed iframe). Also demonstrates the "tag must be present in both parent and child frame" requirement (SUP-22611, SUP-23401).
- A `video.html` page with both a YouTube `<iframe>` embed (to test the first-view dvar race, SUP-23601) and a Brightcove-style iframe embed (to demonstrate the *structural* limitation — dvars never fire because the player lives in a vendor iframe we don't control, SUP-23600) side by side, so Support can see the difference between "race condition, fixable" and "structural limitation, not fixable."
- A `direct-install.html` page that loads the Contentsquare tag directly via the manual `_uxa` bootstrap snippet (**not** through GTM) pointed at the same tag ID, so we can compare the official-template install path against the legacy Custom-HTML install path side by side — this is exactly the A1 vs A1b comparison documented internally for the CSP `unsafe-inline` investigation.
- A generic dvar sanity-check strip (buttons firing `trackDynamicVariable` with varied key/value shapes — string, int, high-cardinality) Support can compare against a broken customer case when an integration's dvar simply never arrives (recurring across SUP-23625 Adobe Target, SUP-20593 Coveo/Qubit, SUP-20076 Monetate).

**Why:** these are the scenarios that don't reproduce on a simple site and usually require guesswork on real tickets.

**Status:** not started.

## Phase 5 — Funnels & Goals

**Goal:** reproduce path/exact-path funnel and goal-matching mistakes that cause false alerts or miscounted conversions.

**Add:**
- A `thankyou.html` page reachable from two or more different fake flows (e.g. `/checkout` and `/subscribe`) using the *same* URL/query pattern, plus a query-param toggle to vary the path slightly — reproduces exact-path funnel over-capture, the exact root cause behind the Bombas false "mobile conversion collapse" alert (SUP-23202: a thank-you-page mapping wrongly captured ~8% of orders from an unrelated flow).
- Two pages whose URLs both match a deliberately sloppy pattern (e.g. `/product-1234/` and `/product-1234-review/`) to test page-group/goal regex overlap (double-counted or skipped funnel steps).

**Why:** funnel/goal misconfiguration is a recurring source of false "something broke" alerts that waste investigation time before the real (non-)issue is found.

**Status:** not started.

## Phase 6 — GA4 & Integration DVar Sanity

**Goal:** make GA4 matching-key and export-timing issues visible and comparable.

**Add:**
- A page that logs/exposes the Contentsquare matching key (`csMatchingKey`) alongside a mock GA client-id cookie, so Support can visually confirm presence/absence of the matching key — the root cause behind GA4 segments showing 0% (SUP-22768, SUP-837500).
- A button that fires several rapid `trackPageview` calls (SPA-style, via pushState) to test whether GA4 export dedupes/matches 1:1 against Contentsquare's own pageview count (SUP-23573: GA4 page-event discrepancy).

**Why:** GA4 matching-key and export-count mismatches are a recurring, hard-to-explain integration ticket pattern.

**Status:** not started.

## Phase 7 — PII & Masking

**Goal:** verify PII masking behaves correctly (and predictably) across error tracking and Session Replay.

**Add:**
- *(Already covered by Phase 2's `errors.html`/`api-errors.html`: PII-shaped custom errors, PII-in-URL API errors, and the `networkRequest:maskUrls`/`api-errors:maskUrl` commands. This phase is about Session Replay/DOM masking specifically, which is a separate mechanism.)*
- A form page with password, credit-card, and email fields — some tagged with the typical masking-rule selector/class, some deliberately not — to verify Session Replay masking triggers correctly on flagged fields and doesn't accidentally mask unflagged ones. Mirrors recurring "masking rule not applying to a specific element" tickets (SUP-21751).

**Why:** PII leakage (or over-masking) is one of the highest-severity classes of ticket we handle.

**Status:** not started.

## Phase 8 — Zoning & Snapshot Edge Cases

**Goal:** reproduce the recurring ways Zoning/Heatmap snapshots and click attribution go wrong.

**Add:**
- A full-screen transparent `<div>` (high z-index, `background: transparent`) sitting over real buttons/links, plus a variant that also blocks `overflow: scroll` — reproduces zoning tap mis-attribution and blocked scroll (the HSBC cases, SUP-23358/23359, and existing [[cs4apps-transparent-overlays]] toolkit).
- A custom element using `attachShadow` with clickable buttons inside its shadow root — reproduces clicks getting mis-attributed to the shadow host element instead of the actual clicked child.
- A page with a lazy-loaded background-image section, an `<img loading="lazy">`, and a fixed/sticky top nav — common triggers for zoning snapshots coming back with missing sections/images despite the live page rendering fine (recurring pattern across SUP-23166, SUP-22371, SUP-22927, SUP-22825, SUP-23012, SUP-23498).
- A stylesheet whose filename changes on every load (e.g. via a query param swap) to approximate hashed-chunk-rotation-before-scrape, the confirmed root cause of replays rendering without CSS (SUP-23308, precedent for [[sup-23308-srm-missing-css]]).

**Why:** these are exactly the "clean HAR/console but broken snapshot" tickets that are hardest to diagnose without a reproducible case.

**Status:** not started.

## Phase 9 — Consent & Opt-Out

**Goal:** make opt-in/opt-out behavior directly verifiable instead of just documented.

**Add:**
- Buttons calling `window._uxa.push(['optout'])` and `['optin']`, with an on-page instruction to reload and check the Network tab to confirm `c.contentsquare.net` calls actually stop after opt-out and resume after opt-in.

**Why:** "opt-out isn't stopping collection" is a recurring customer question, and having a page that proves the mechanism works removes doubt fast.

**Status:** not started.

## Phase 10 — Heap ↔ Contentsquare Identity & Session Mapping

**Goal:** make the cross-tool identity relationship visible instead of theoretical.

**Add:**
- A page exposing both `window._uxa` calls and `heap.identify()` / `heap.track()` side by side, with an on-page readout of both tools' current session/user IDs (read from their respective cookies), so Support can visually confirm which ID maps to which — directly addresses the recurring confusion in the Heap Tag Status / Crosswriting docs over which tool "drives" session/pageview.
- *(Advanced, may need a second real subdomain/custom domain — GitHub Pages project sites can't fake this convincingly with paths alone, so scope this down or skip if not worth the setup):* a cross-subdomain/cross-origin session-continuity check comparing the session cookie before/after navigating, to demonstrate when a session breaks vs. persists across domains.

**Why:** ID-mapping confusion between Heap and Contentsquare is a recurring root cause once dual-collection or crosswriting is involved.

**Status:** not started.

## Phase 11 — Input & IME Edge Cases

**Goal:** reproduce the recurring Japanese-IME input bug in search-style inputs.

**Add:**
- A search-style text input that only listens for the `compositionend` event (not plain `input`), with on-page instructions to type Japanese/IME text — reproduces the confirmed recurring bug where zoning/share-modal search fields miss IME-composed input (SUP-22748 Shiseido Japan; see [[ime-japanese-input-bug]]).

**Why:** confirmed recurring bug pattern across multiple customers/areas — having a live repro means we stop re-diagnosing it from scratch each time.

**Status:** not started.
