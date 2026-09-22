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
- Buttons for the ecommerce dataLayer events the copied `Ecomm Tag` in GTM expects (`ec:transaction:send`, `ec:transaction:items:add` or the newer `ecommerce:send` / `ecommerce:addItem`) — check which schema the "Contentsquare - E-commerce data" tag template actually expects before wiring the button.

**Why:** transaction/funnel mismatches and GA4 export discrepancies are a recurring Support ticket pattern.

**Status:** not started.

## Phase 2 — Error Analysis Testing

**Goal:** reproduce JS errors, failed API calls, and custom errors on demand, to test Error Analysis collection rules and PII masking.

**Add:**
- An `errors.html` page with:
  - A button that throws a real uncaught JS error (e.g. calling an undefined function).
  - Buttons that fire `fetch`/`XHR` calls to a status-code echo service (e.g. `https://httpstat.us/500`, `/404`) to generate real API errors.
  - A button that sends a custom error via `window._uxa.push(['trackError', '<MESSAGE>', { key: value }])`, including one variant with an obviously fake PII-shaped value (e.g. a fake email/card number) to confirm masking behavior.

**Why:** mirrors real Error Analysis tickets — confirms our default collection rules (which we know don't cover all 4xx by default) and PII scrubbing.

**Status:** not started.

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
- An `spa.html` page that fakes single-page navigation with `history.pushState` (no full reload), to confirm the GTM "History Change" trigger fires a fresh Contentsquare pageview — this is the same mechanism behind "SPA / Artificial Pageview" tickets.
- An `iframe.html` page that embeds one of our own pages inside an `<iframe>`, to test whether/how tracking behaves for iframe-embedded content (relevant to the recurring "video/integration tracking inside a vendor iframe" limitation).
- A `video.html` page with a real YouTube `<iframe>` embed, to test the YouTube integration dvar timing (there's a known first-view race condition — see SUP-23601 for context).
- A `direct-install.html` page that loads the Contentsquare tag directly via the manual `_uxa` bootstrap snippet (**not** through GTM) pointed at the same tag ID, so we can compare the official-template install path against the legacy Custom-HTML install path side by side — this is exactly the A1 vs A1b comparison documented internally for the CSP `unsafe-inline` investigation.

**Why:** these are the scenarios that don't reproduce on a simple site and usually require guesswork on real tickets.

**Status:** not started.
