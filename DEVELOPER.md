# Developer Guide

Complete operational handoff for the Support Tag Test Site. This file describes the current
architecture, vendor wiring, every route and test surface, deployment, and the rules for extending
the project. `PLAN.md` is the roadmap. `HOTJAR-REFERENCE.md` is the detailed Hotjar research
reference. `CONTINUE.md` contains historical GTM and session handoff notes.

## Project identity

- Repository: `github.com/waseemaboliel/sup-tag-test-site`
- Live site: `https://waseemaboliel.github.io/sup-tag-test-site/`
- GitHub Pages base path: `/sup-tag-test-site/`
- Branch deployed by GitHub Actions: `main`
- Current architecture: Vite + React 18 + React Router 6 SPA, plus standalone MPA documents.
- GTM container: `GTM-W925CGJH`
- Do not edit: `GTM-W989V5M` (Mohammad Al-Badah's source container) or `GTM-TQGPGN3` (Hotjar's separate container).

## Local requirements and commands

Prerequisites:

- Node.js 18 or newer. CI uses Node 22; the project was developed with Node 22.23.0 and npm 10.9.8.
- npm, included with Node.
- A browser with DevTools for vendor/network verification.
- GTM/Hotjar/Contentsquare dashboard access for real data verification.

Setup and development:

```bash
git clone git@github.com:waseemaboliel/sup-tag-test-site.git
cd sup-tag-test-site
npm install
npm run dev
```

Typical local URLs:

- SPA root: `http://localhost:5173/sup-tag-test-site/` or the URL Vite prints.
- SPA route: `http://localhost:5173/sup-tag-test-site/cart` when using the configured base.
- Standalone MPA: `http://localhost:5173/sup-tag-test-site/errors.html`.
- Standalone MPA: `http://localhost:5173/sup-tag-test-site/api-errors.html`.

Commands:

| Command | Purpose |
|---|---|
| `npm run dev` | Vite development server with hot reload. |
| `npm run build` | Production build into `dist/`; required before considering a change valid. |
| `npm run preview` | Serves the built `dist/` output locally. |

Always run `npm run build` after route, JSX, CSS, or standalone-page changes. Also use VS Code
problem diagnostics on touched source files. Do not commit `dist/`; it is generated output.

## Local versus live vendor behavior

Use local development for UI, routing, DOM, and build checks. Use the deployed GitHub Pages URL
for final vendor verification because the vendor configurations were set up for the GitHub Pages
domain:

`https://waseemaboliel.github.io/sup-tag-test-site/`

Localhost can behave differently because:

- Contentsquare project `3977`, Heap App ID `209188840`, and Hotjar site `2866949` were verified against the deployed domain.
- Browser privacy extensions may block GTM, Heap, Contentsquare, or Hotjar differently on localhost.
- A clean localhost result is not proof that a vendor dashboard received the live data.
- Use a clean browser profile or temporarily account for tracking protection when debugging.

Never use real customer data. This is a public repository and public test site. Use synthetic IDs,
attributes, event names, and values only.

## Architecture and file map

```text
index.html                  SPA entry, redirect restoration, tag switcher bootstrap, GTM snippet.
vite.config.js              Vite base path: /sup-tag-test-site/.
package.json                npm scripts and React/Vite dependencies.
.github/workflows/deploy.yml Build and GitHub Pages deployment workflow.

src/main.jsx                 React root and global stylesheet import.
src/App.jsx                  BrowserRouter and complete SPA route table.
src/styles.css              Shared SPA layout, controls, fixtures, cards, logs, and responsive CSS.
src/lib/tagSwitcher.js      Shared SPA tag mode values, localStorage lookup, and reload behavior.
src/components/Layout.jsx   Shared SPA header, tag switcher, navigation, main wrapper, footer.
src/components/EventLog.jsx Reusable timestamped event log and useEventLog hook.

src/pages/Home.jsx            Overview and vendor/container summary.
src/pages/PageTwo.jsx         Second simple SPA route for Artificial Pageview checks.
src/pages/Events.jsx          Contentsquare, Heap, and raw dataLayer event controls.
src/pages/Cart.jsx            Cart quantities and Contentsquare cart dynamic variables.
src/pages/Checkout.jsx        Contentsquare ecommerce transaction variants.
src/pages/GuestCheckout.jsx   Deliberate no-transaction checkout path.
src/pages/Login.jsx           Cross-vendor identity/login/logout controls.
src/pages/HotjarLab.jsx       Hotjar Events, Identify, stateChange, storage, suppression lab.
src/pages/InfiniteScroll.jsx  Unbounded image-heavy PLP/infinite-scroll lab.
src/pages/RenderingLab.jsx    Canvas, HTML, open Shadow DOM, closed Shadow DOM lab.
src/pages/IframeLab.jsx       Same-origin, untagged, sandboxed, and cross-origin iframe lab.
src/pages/SurveyTargeting.jsx URL, Event, and User Attribute Survey fixtures.

public/404.html               GitHub Pages BrowserRouter fallback.
public/errors.html            Standalone Contentsquare Error Analysis page.
public/api-errors.html        Standalone Contentsquare API Error page.
public/iframe-lab-child.html  First-party child document used by Iframe Lab.
public/shared.css              Shared styling for the standalone MPA pages.
```

## Vendor architecture

### Contentsquare

- Container: `GTM-W925CGJH`.
- Tag: official `Contentsquare - Main tag` template.
- Project: `3977`.
- Tag ID: `2c5142b15f133`.
- Runtime queue: `window._uxa`.
- The queue can be initialized before the script loads; commands are pushed into it.
- Existing tag wiring includes `All Pages` and a `History Change` trigger for SPA Artificial Pageviews.
- The tag is blocked by `Exception - CS Disabled` when the active mode does not contain `cs`.
- Common commands used in this repo include `trackDynamicVariable`, `trackPageview`, `trackError`, `ec:transaction:create`, and `ec:transaction:send`.

Contentsquare verification:

- Inspect `window._uxa` for queued commands, but do not treat queue existence alone as proof the tag loaded.
- Use Network, GTM Preview/Tag Assistant, or the Contentsquare Tracking Setup Assistant for actual loading.
- On SPA navigation, verify a GTM History Change event and an Artificial Pageview where applicable.

### Heap

- Container: `GTM-W925CGJH`.
- Tag: Custom HTML.
- App ID: `209188840`.
- App ID ownership: Mohammad Al-Badah's App ID, permanently approved for this project; it is not Support-owned.
- Runtime object: `window.heap`.
- The tag is blocked by `Exception - Heap Disabled` when the active mode does not contain `heap`.
- The tag was unpaused in Phase 5 and is live in the container.
- Common calls used in this repo include `heap.track`, `heap.identify`, `heap.addUserProperties`, and `heap.resetIdentity`.

Heap verification:

- Confirm `window.heap` exists and the called method is available.
- Use Heap's live environment/dashboard for events and identity confirmation.
- If Heap is paused or unavailable, the test pages should log that it is unavailable rather than crash.

### Hotjar

- Container: `GTM-W925CGJH`.
- Tag: Custom HTML using the standard Hotjar Tracking Code.
- Site ID: `2866949`.
- Runtime object: `window.hj`.
- The tag fires on `All Pages` only. Do not attach it to SPA `History Change`; loading the tracking code repeatedly is unsupported.
- The tag is blocked by `Exception - Hotjar Disabled` when the active mode does not contain `hotjar`.
- Hotjar API calls used here include `hj('event', name)`, `hj('identify', userId, attributes)`, and `hj('stateChange', path)`.
- User Attributes must be enabled in the Hotjar site dashboard before Identify data is expected there.
- Hotjar User IDs are automatically assigned, browser/cookie-specific, and cannot be extracted with JavaScript. Never display or derive them in the app.

Hotjar verification:

- Use the deployed URL with `?hjDebug=1` for event debugging.
- Check for exactly one Hotjar script containing site `2866949` in Network.
- Verify Events, User Attributes, Recordings, Heatmaps, and configured Surveys in the Hotjar dashboard.
- Consent API and intentionally allowed keystroke controls are not implemented until their current signatures are documented.
- Full Hotjar rules and privacy constraints are in `HOTJAR-REFERENCE.md`.

## Tag switcher: exact behavior

The visible modes are:

| UI label | Stored value | `activeTags` dataLayer value |
|---|---|---|
| All | `all` | `['cs', 'heap', 'hotjar']` |
| Contentsquare | `cs` | `['cs']` |
| Heap | `heap` | `['heap']` |
| Hotjar | `hotjar` | `['hotjar']` |

Storage key: `supTagTestSite.activeTags`.

Resolution order on every document load:

1. Valid `?tags=all`, `?tags=cs`, `?tags=heap`, or `?tags=hotjar` URL parameter.
2. Valid stored value in `localStorage`.
3. Default `all`.

The resolved mode is stored and pushed before GTM loads:

```js
window.dataLayer.push({ activeTags: ['cs', 'heap', 'hotjar'] })
```

The SPA control is implemented by `src/lib/tagSwitcher.js` and `TagSwitcher` in
`src/components/Layout.jsx`. The standalone pages duplicate the same behavior with vanilla JS.
The control writes `?tags=<mode>` and performs a full reload because GTM tag firing is evaluated
at load time.

The inline pre-GTM bootstrap must remain byte-identical in `index.html`, `public/errors.html`, and
`public/api-errors.html`. If you change it, update all three and verify the order remains:
BrowserRouter restore script first, tag-mode bootstrap second, GTM third.

GTM-side configuration uses exceptions, not firing-trigger rewrites:

- `DLV - Active Tags` reads `activeTags`.
- `Exception - CS Disabled` blocks CS unless `activeTags` contains `cs`.
- `Exception - Heap Disabled` blocks Heap unless `activeTags` contains `heap`.
- `Exception - Hotjar Disabled` blocks Hotjar unless `activeTags` contains `hotjar`.
- Existing CS `All Pages`/`History Change` behavior remains intact.
- Hotjar remains `All Pages` only.

## SPA routing and Artificial Pageviews

`BrowserRouter` uses `import.meta.env.BASE_URL`, which comes from Vite's `/sup-tag-test-site/`
base. SPA links use React Router and `pushState`; they do not cause a full browser navigation.
This is the Artificial Pageview side of the project.

`public/404.html` and the restore script at the top of `index.html` implement the standard
GitHub Pages fallback for clean deep URLs. A direct `/cart` request may pass through `404.html`
before React Router receives the restored path.

Do not switch to `HashRouter` without revisiting tag query behavior. The project deliberately uses
clean paths such as `/cart?tags=heap`, not `/#/cart`.

## Page-by-page reference

### Home `/`

Purpose: overview and vendor/container reference.

Behavior:

- Explains SPA Artificial Pageviews versus standalone Natural Pageviews.
- Shows GTM container, CS project/tag ID, Heap App ID, and Hotjar site ID.
- Links to Fire Events.
- Does not fire a custom test call itself.

### Page Two `/page-two`

Purpose: simple second SPA route.

Behavior:

- Use Home -> Page Two or Page Two -> another SPA route to verify `pushState` navigation.
- Use GTM Preview/Tag Assistant to confirm History Change and CS Artificial Pageview behavior.
- Heap and Hotjar may observe the route/session according to their dashboard configuration; Hotjar's loader is not re-injected.

### Fire Events `/events`

Purpose: direct basic event/API checks.

Controls:

1. **Set Contentsquare dynamic variable**: pushes `trackDynamicVariable` with `testDvar=hello-world`.
2. **Track manual Contentsquare pageview**: pushes `trackPageview` with `events-manual`.
3. **Fire Heap custom event**: calls `heap.track('Test Event', { source: 'sup-tag-test-site' })` when Heap is available; otherwise logs unavailable.
4. **Push GTM dataLayer event**: pushes `{ event: 'test_custom_event' }`.

This page is deliberately a direct CS/Heap/GTM test surface; it does not call Hotjar.

### Cart `/cart`

Purpose: Contentsquare ecommerce/cart dynamic-variable checks.

Initial quantities and prices:

- Product A: quantity 1, `$19.99`.
- Product B: quantity 2, `$9.99`.
- Product C: quantity 1, `$29.99`.

Controls:

- Quantity inputs accept numeric values; invalid/empty values become `0`.
- Cart total is calculated in React.
- **Push cart dvars** sends `cartValue` as a number and `cartItemsNb` as a count through `window._uxa`.
- **Proceed to checkout** links to `/checkout` through React Router.

### Checkout `/checkout`

Purpose: Contentsquare transaction edge cases.

Every order button sends:

```js
window._uxa.push(['ec:transaction:create', payload])
window._uxa.push(['ec:transaction:send'])
```

Variants:

- Standard: `id=test-txn-1`, revenue `69.97`, currency `USD`.
- Anonymous: no transaction ID, revenue `69.97`, currency `USD`.
- Duplicate: sends `test-txn-1` again to test duplicate/inflated revenue behavior.
- Missing currency: `id=test-txn-2`, revenue `69.97`, no currency.

The page links to Guest Checkout for the deliberate no-command comparison.

### Guest Checkout `/guest-checkout`

Purpose: reproduce a guest/third-party redirect path where an order completes without ecommerce
commands.

The button only writes a log message. It intentionally does not push either Contentsquare
transaction command. This is a negative control, not a successful ecommerce implementation.

### Login & Identity `/login`

Purpose: compare identity/session calls across all three vendors.

Synthetic user: `test-user-123`.

Login:

- Contentsquare: queues `loggingStatus=logged` through `trackDynamicVariable`.
- Heap: calls `heap.identify('test-user-123')` and `heap.addUserProperties({ plan: 'test' })` when available.
- Hotjar: calls `hj('identify', 'test-user-123', { plan: 'test' })` when available.
- UI changes to Logged in and disables the login button.

Logout:

- Contentsquare: queues `loggingStatus=anonymous`.
- Heap: calls `heap.resetIdentity()` when available.
- Hotjar: intentionally has no reset call in this test; the log says so.
- UI changes to Anonymous and disables the logout button.

The page logs availability rather than crashing when a vendor is disabled by the switcher.

### Hotjar Lab `/hotjar-lab`

Purpose: documented Hotjar API, storage, and suppression checks.

Events:

- Editable event name with local validation: non-empty, maximum 250 characters, documented character set.
- Sends `hotjar_test_started`, `hotjar_checkout_started`, and `hotjar_variant_a_displayed` presets.
- Does not send event properties or real data.

Identify/User Attributes:

- Sends stable synthetic `test-user-123` with `plan`, `role`, `subscription_type`, `on_trial`, `language`, `widgets_opt_out`, `total_purchases`, and `signed_up`.
- Sends a changed `paid` plan/purchase bucket.
- Sends a `null` user ID with non-PII attributes.
- Requires User Attributes to be enabled in Hotjar dashboard.

SPA/debug/storage:

- Sends `hj('stateChange', '<current path>/manual-hotjar-state')` for manual tracking configuration.
- Reloads with `?hjDebug=1`.
- Checks cookie, localStorage, and sessionStorage availability without showing raw values.
- Does not attempt to read the automatic Hotjar User ID.

Privacy fixtures:

- Control text versus `data-hj-suppress` text.
- Text, number, date, email-shaped, and 9+ digit inputs.
- Class-suppressed image and video.
- Inline SVG versus SVG loaded as an image.
- Consent and allowed-keystroke controls are intentionally pending documentation.

### Infinite PLP `/infinite-scroll`

Purpose: create a long, dynamic product-listing session for all three vendors.

Behavior:

- Starts with 12 cards and appends 12 more whenever the sentinel enters the viewport.
- There is no maximum; the feed is intentionally unbounded.
- Manual **Load more products** is also available.
- Uses real remote Unsplash image URLs with lazy loading, not generated placeholder SVGs.
- Cards include category, product name, price, rating, review count, badges, quick view, and Add to bag.
- Product data is deterministic and cycles through a fixed image/name/category set.
- Product interactions send `plp_product_selected` to Hotjar, `PLP Product Selected` to Heap, and `plpProductPosition` to Contentsquare.
- Use this route for long scrolling, appended DOM, lazy media, repeated interaction, and session/replay testing.

The page requires network access to Unsplash. If images fail, the DOM/scroll test still works, but
image-loading results are not representative.

### Canvas & Shadow DOM `/rendering-lab`

Purpose: compare normal DOM observation with pixels and encapsulated DOM boundaries.

Canvas:

- Draws a blue circle and text on a `480x180` canvas.
- Clicking canvas emits one safe interaction attempt per available vendor.
- The handler isolates Hotjar, Heap, and Contentsquare errors so one blocked vendor cannot blank the page.

HTML control:

- Plain DOM button used as the comparison control.

Open and closed Shadow DOM:

- Both roots contain dynamic text and a button.
- Both attempt an adopted stylesheet when the browser supports `CSSStyleSheet`/`adoptedStyleSheets`.
- Closed root is not introspected by test code.
- A ref keeps the latest interaction callback so React event-log re-renders do not call `attachShadow()` twice.
- Compare click attribution, replay rendering, styling, and suppression behavior across vendors.

### Iframe Lab `/iframe-lab`

Purpose: compare document ownership and tag loading across frame boundaries.

Four frames:

1. **Same-origin child with GTM**: `public/iframe-lab-child.html`; child resolves the active tag mode, pushes its own dataLayer value, and loads `GTM-W925CGJH`.
2. **Same-origin child without GTM**: adds `?notags=1`; renders but does not load GTM or Hotjar.
3. **Sandboxed child**: same child with `sandbox="allow-scripts"`; scripts run but the origin becomes opaque.
4. **Cross-origin document**: `https://example.com/`; parent cannot inspect or inject tags into it.

The child displays its mode/origin and has a child interaction button. Inspect each frame's own
Network panel and console. The parent cannot make uncontrolled cross-origin content collect data.

### Survey Targeting `/survey-targeting`

Purpose: provide stable fixtures for dashboard-configured Hotjar Surveys.

URL fixtures:

- `/survey-targeting` for Simple path matching.
- `/survey-targeting?variant=a` for query-string targeting.
- `/survey-targeting?variant=b#experiment` as a query/fragment example.
- Variant buttons use `history.pushState` and send `hotjar_variant_a_displayed` or `hotjar_variant_b_displayed`.

Identify/Event fixtures:

- Calls Identify for `test-survey-user` with `plan=trial`, `role=support-test`, `language=en`, and `widgets_opt_out=false`.
- Sends the selected Event only after Identify.
- Checkout event: `hotjar_checkout_started`.
- Completion event: `hotjar_test_completed`.

The page does not create a Survey. Configure the Survey in Hotjar first, then use URL, Event, or
User Attribute targeting. Link Surveys run on a different domain and cannot connect responses to
Recordings from this site.

### Standalone Errors `public/errors.html`

Purpose: real MPA Natural Pageview and Contentsquare Error Analysis checks.

Controls:

- Throw uncaught JavaScript error.
- Send plain `trackError` custom error.
- Send a synthetic PII-shaped `trackError` message to inspect masking/anonymization.
- Emit `console.log`, `console.warn`, and `console.error` for configured console-message collection.

The page has its own GTM snippet, tag bootstrap, tag switcher, standalone nav, and `shared.css`.
It is not React and is intentionally reached with a real `<a>` navigation.

### Standalone API Errors `public/api-errors.html`

Purpose: real MPA Natural Pageview and Contentsquare API Error checks.

Controls:

- JSONPlaceholder 404.
- `reqres.in` 400 login request.
- JSONPlaceholder 200 control request.
- 404 request with synthetic email/card values in the query string.
- `networkRequest:maskUrls` partial URL masking command.
- `api-errors:maskUrl` exact URL masking command.

The page has its own GTM snippet, tag bootstrap, tag switcher, standalone nav, and `shared.css`.
It is not React. External endpoints can be blocked or flaky, so check the log and Network panel.

### First-party child `public/iframe-lab-child.html`

This is not a top-level navigation target. Iframe Lab loads it in four contexts. It:

- Resolves the active mode from `?tags=` or shared localStorage unless `?notags=1`.
- Pushes `activeTags` before GTM.
- Loads the same GTM container only when tagged.
- Displays mode and origin.
- Sends Hotjar, Heap, and Contentsquare child-interaction calls when those APIs are available.

## End-to-end testing matrix

For every route, test at least once with each mode:

- `?tags=all` — all three vendors.
- `?tags=cs` — Contentsquare only.
- `?tags=heap` — Heap only.
- `?tags=hotjar` — Hotjar only.

The mode persists in localStorage, so use an explicit URL parameter when a test must start in a
known state. The switcher reloads the page; this is intentional.

For each live run:

1. Open DevTools Network and preserve logs.
2. Confirm one GTM request and, when Hotjar is selected, one Hotjar script load.
3. Inspect `window.dataLayer` and confirm the expected `activeTags` array.
4. Exercise the page controls.
5. Inspect vendor queues/objects:

```js
window.dataLayer
window._uxa
window.heap
window.hj
```

6. Use GTM Preview/Tag Assistant for tag firing status.
7. Confirm the result in the vendor dashboard where applicable.

Important: `window._uxa` may exist as an early queue even when the CS tag is blocked. Heap and
Hotjar API availability is also affected by mode, blockers, and loading timing. Use Network/GTM
Preview/dashboard evidence for final conclusions.

## Deployment

GitHub Actions workflow: `.github/workflows/deploy.yml`.

On each push to `main`, the workflow:

1. Checks out the repository.
2. Installs Node 22 and runs `npm ci`.
3. Runs `npm run build`.
4. Uploads `dist` as a Pages artifact.
5. Deploys with `actions/deploy-pages`.

The repository Pages source must be set to **GitHub Actions**, not branch deployment. Manual
workflow dispatch is available in the Actions tab. After a push, wait for the workflow and hard
refresh the live URL before testing.

## Adding or changing pages

SPA page checklist:

1. Add `src/pages/YourPage.jsx`.
2. Import it in `src/App.jsx`.
3. Add a `<Route>`.
4. Add a `spaLinks` entry in `src/components/Layout.jsx` if it belongs in navigation.
5. Use `EventLog`/`useEventLog` for test output.
6. Keep vendor calls guarded when a vendor may be disabled.
7. Run diagnostics and `npm run build`.
8. Update README, PLAN, and this page-by-page guide.

Standalone page checklist:

1. Add a complete document under `public/`.
2. Copy the GTM noscript and scripts exactly.
3. Keep the pre-GTM tag-mode bootstrap synchronized with the other standalone pages.
4. Add the standalone nav link to every MPA page and the SPA Layout.
5. Link `shared.css`.
6. Validate with a browser because standalone HTML is not compiled by React.

For any new vendor test:

- Keep GTM as the loader.
- Gate calls and tags through the active vendor mode.
- Use synthetic values only.
- Do not add undocumented APIs.
- Document the dashboard-side setup and how to verify the result.

## Known deferred work and risks

- Hotjar Consent API controls are not implemented until current consent syntax and effects are documented.
- Hotjar intentionally allowed keystroke/input configuration is not implemented until exact current guidance is documented.
- Survey creation and dashboard rules are manual; page code only supplies URL/Event/Attribute fixtures.
- Unsplash imagery is remote and may be blocked; it is intentionally used to create a realistic heavy PLP.
- Heap App ID `209188840` and Hotjar site `2866949` are not Support-owned credentials; replacing them is a future governance task.
- Browser privacy tools can prevent tags, cookies, storage, recordings, or dashboard data.
- Do not expose raw cookies, Hotjar User IDs, User Attributes, tokens, or customer data in logs or commits.

## Troubleshooting

**Blank page after a control click:** open the browser console first. Rendering Lab vendor calls are
isolated, and Shadow DOM fixtures use a callback ref to avoid attaching a second root. If another
page blanks, capture the exception and check whether a vendor API call is unguarded.

**SPA deep link 404:** confirm `vite.config.js` base and `public/404.html` path segment settings.
GitHub Pages must be deployed through Actions.

**Hotjar script missing:** confirm active mode includes `hotjar`, GTM is published, the tag uses
All Pages/Page View, and no blocker is active. There should not be a second Hotjar loader.

**Heap unavailable:** confirm mode includes `heap`, the tag is unpaused in GTM, and the browser is
not blocking Heap.

**Contentsquare conclusions unclear:** inspect GTM/Network; `_uxa` queue existence alone is not
proof of a loaded CS tag.

**Standalone page issue:** inspect its inline scripts and browser console. `errors.html`,
`api-errors.html`, and `iframe-lab-child.html` are plain HTML and are not covered by JSX diagnostics.
