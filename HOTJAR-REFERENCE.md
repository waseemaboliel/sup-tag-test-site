# Hotjar Reference

Canonical Hotjar research and implementation notes for the Support Tag Test Site.

Last reviewed: 2026-09-29
Hotjar site: `2866949`
GTM container: `GTM-W925CGJH`

## Purpose

This project is a safe playground for Support to test Hotjar behavior alongside Contentsquare and Heap. The site tag switcher supports:

- `all` — Contentsquare, Heap, and Hotjar
- `cs` — Contentsquare only
- `heap` — Heap only
- `hotjar` — Hotjar only

GTM remains the source of truth for loading Hotjar. Application pages may call the Hotjar API after the queue is initialized, but must not add a second Hotjar loader.

## Tracking Code

The project uses the standard Hotjar Tracking Code through a GTM Custom HTML tag for site `2866949`:

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

The Hotjar GTM tag fires on `All Pages` and is blocked by the existing `Exception - Hotjar Disabled` trigger when the tag switcher does not include `hotjar`. It is intentionally not attached to the SPA `History Change` trigger; the Hotjar loader should not be injected repeatedly during client-side navigation.

## Events API

Basic call:

```js
hj('event', 'event_name')
```

Events represent actions taken by a visitor. They can be used to:

- Filter Recordings.
- Filter Heatmaps.
- Trigger session capture.
- Trigger Surveys or feedback tools.
- Mark errors, checkout outcomes, modal states, and A/B-test variants.

### Verified limits and rules

- Event names are limited to 250 characters.
- Allowed characters are letters, numbers, underscores, dashes, spaces, periods, colons, pipes, and forward slashes.
- A site supports up to 10,000 unique events.
- Only the first 50 unique events in one session are searchable by recording filters.
- Events do not support an event-properties object.
- Do not send PII, email addresses, IP addresses, 9-or-more-digit numbers, timestamps, URLs, referral codes, product SKUs, or detailed error logs.
- Avoid unbounded/high-cardinality event names.
- Identify must execute before an Event when both are used for Survey targeting.
- The Tracking Code must be loaded before calling `hj`.
- If code can run before the Tracking Code, initialize the queue first:

```js
window.hj = window.hj || function () {
  (hj.q = hj.q || []).push(arguments)
}
```

### Safe test events

Use predictable, non-PII names such as:

```js
hj('event', 'hotjar_test_started')
hj('event', 'hotjar_checkout_started')
hj('event', 'hotjar_modal_opened')
hj('event', 'hotjar_test_completed')
hj('event', 'hotjar_error_occurred')
hj('event', 'hotjar_variant_a_displayed')
```

Useful tests include a duplicate event, invalid characters, an over-250-character name, and a controlled sequence of unique events. Do not create an unbounded timestamp-based event name in production test code.

### Legacy calls

Older sites may use:

```js
hj('trigger', 'example')
hj('tagRecording', ['example_tag'])
```

Hotjar continues to respect these legacy calls, but a `trigger` is not searchable as a Recording filter Event and a `tagRecording` cannot be used for targeting Hotjar tools. They should be tested only as legacy compatibility cases, not as replacements for the Events API.

### Testing Events

Use `?hjDebug=1` on the deployed URL, open the browser console, and fire an event manually. Then repeat the same action through the UI. If the manual event is detected but the UI action is not, the implementation condition or timing is likely wrong.

### Event design workflow

Design Events from a support or product goal:

1. Define the goal, such as increasing conversion, investigating errors, evaluating an A/B test,
  or understanding unsubscribes.
2. Choose the meaningful action or state that supports the goal, such as a successful/failed API
  outcome or a variant being displayed.
3. Implement the Event API at the point where that action or outcome is known.
4. Use the Event in Hotjar to filter Recordings or Heatmaps, create a Recording Segment, target a
  Survey, or start session capture.

For ordinary click analysis, prefer Hotjar's built-in Clicked Element filter. Use a custom Event
when the click represents a meaningful business outcome or needs to target a Survey/session
capture rule. Avoid emitting Events for every low-value interaction.

Events can be sent with direct code, Google Tag Manager, or Segment. Google Analytics can send
Events to Hotjar only when the Google Analytics script is directly installed on the page; this
does not apply when Google Analytics is installed through GTM. This project should use direct
Hotjar API calls for deterministic tests and keep GTM as the Hotjar loader.

## Identify API and User Attributes

Basic call:

```js
hj('identify', userId, {
  plan: 'test',
  role: 'support-test',
  testRun: 'phase-7'
})
```

User Attributes can be used to:

- Filter Recordings.
- Target Surveys.
- Perform User Lookup and deletion by User ID.
- Associate sessions with a stable user identity.

User Attributes must be enabled for the Hotjar site in Hotjar Settings before they can be used.

### GTM and dataLayer implementation

Hotjar supports sending User Attributes through a GTM Custom HTML tag backed by GTM dataLayer
variables:

1. Confirm the values exist in `dataLayer` on the live page.
2. Create one GTM Data Layer Variable for each attribute.
3. Create a Custom HTML tag that calls `hj('identify', userId, attributes)` and uses GTM
   variables as `{{variable name}}` values.
4. Place the Identify tag after the Hotjar Tracking Code and fire it on `All Pages`/Page View.
5. Publish to the Live environment.

The Identify tag must not become a second Hotjar loader. If it can run before the Tracking Code,
use the documented queue fallback:

```js
window.hj = window.hj || function () {
  (hj.q = hj.q || []).push(arguments)
}
```

Hotjar recommends sending the latest attributes on every page view. In this project, direct app
calls are used for deterministic test controls, while GTM remains responsible for Loading
Hotjar. Any future GTM Attribute tag must be gated by the existing tag switcher so Hotjar-only
behavior remains consistent and disabled vendors do not receive test calls.

### Verified limits and rules

- Up to 100 User Attributes per site.
- Attribute names have a maximum length of 50 characters.
- String values have a maximum length of 200 characters.
- Supported value types include booleans, numbers within JavaScript's safe integer range, strings, and ISO-8601 dates.
- User IDs should be stable, unique, non-PII strings.
- Once a User ID is set, changing it makes Hotjar treat the value as a different user.
- If no User ID is known, pass `null`; attributes for a `null` user must not contain PII.
- Email addresses should use the `email` attribute key. Do not use an email as the User ID except as a last resort.
- The latest values sent during a session are saved with the Recording.
- Identify should run on page load, after every SPA URL change, and whenever an attribute changes.
- Repeating an unchanged call may not create another network request.
- If Identify is used before the Tracking Code has loaded, initialize the Hotjar queue first.

### Safe test identity

Use a stable non-PII ID such as:

```js
hj('identify', 'test-user-123', {
  plan: 'test',
  role: 'support-test',
  testRun: 'phase-7'
})
```

Also test:

- An attribute update in the same session.
- A repeated unchanged Identify call.
- A second stable test user.
- `null` with non-PII attributes only.
- Attribute name and string-value length validation.
- Boolean, safe-number, and ISO-date values.

Never use real names, emails, card data, or customer identifiers in this public playground.

### Useful attribute patterns

User Attributes can enrich Recordings and Heatmaps, create Segments, target Surveys, and support
User Lookup/deletion by User ID. Safe synthetic examples for this project include:

```js
hj('identify', 'test-user-123', {
  role: 'support-test',
  plan: 'trial',
  subscription_type: 'monthly',
  on_trial: true,
  language: 'en',
  widgets_opt_out: false,
  total_purchases: 42,
  signed_up: '2026-09-29T00:00:00.000Z'
})
```

Useful test scenarios include filtering by role or plan, comparing trial and paid users,
targeting a language-specific Survey, honoring a `widgets_opt_out` preference, and comparing
users by a safe purchase-total bucket. Do not create one attribute per product SKU, referral code,
or other high-cardinality value; the site limit is 100 unique attribute names.

Never send PII as an attribute without a unique stable User ID. If PII is sent for a de-identified
`null` user, Hotjar cannot reliably look up and delete that individual's data; removal may require
deleting users individually or deleting the entire site. Use synthetic values in this public test
site and keep real customer attributes out of examples.

## Cookies and Storage

Hotjar Tracking Code cookies are first-party cookies. Hotjar also uses local storage and session storage.

### Important behavior

- Hotjar does not properly load its components when browser cookies are disabled.
- `_hjSessionUser_{site_id}` stores a site-specific Hotjar User ID and persists for 365 days.
- `_hjSession_{site_id}` holds current session data and lasts 30 minutes, extended by user activity.
- `_hjUserAttributes` local storage caches Identify data.
- `hjViewportId` uses session storage for viewport details.
- `hjActiveViewportIds` uses local storage for active viewport tracking.
- `_hjClosedSurveyInvites`, `_hjDonePolls`, and `_hjMinimizedPolls` store Survey state for 365 days.
- Cookies use the top-level domain to support continuity across subdomains; they cannot be restricted to only one subdomain.
- Storage capability checks include `_hjCookieTest`, `_hjLocalStorageTest`, `_hjSessionStorageTest`, and `_hjTLDTest`.

### Hotjar User ID

Hotjar automatically assigns a site-specific Hotjar User ID when data is collected. It is stored
in `_hjSessionUser_{site_id}` and is not the same as an internal application User ID.

- The Hotjar User ID is browser/cookie-specific and can change across browsers or after cookies
  are cleared.
- It is not transferred across devices.
- It cannot currently be extracted or customized through JavaScript.
- Do not attempt to display or derive it from the browser cookie in the test page.
- Survey responses may show a Hotjar User ID when the required consent and survey settings allow
  it; that ID can then be used in the Hotjar dashboard to find related Recordings.
- Internal application IDs are connected to Hotjar data through Identify/User Attributes, not by
  reading the Hotjar User ID.
- One internal user may be associated with multiple Hotjar User IDs across browsers/devices.

Missing Recordings do not necessarily mean the tag failed: privacy software, browser settings,
or daily Recording limits can prevent a session from being recorded even when a Survey response
exists.

The diagnostic UI should show storage capability and cookie names only, never raw cookie values or raw User Attribute storage.

### Storage test cases

- Normal cookies, local storage, and session storage.
- Cookies disabled.
- Local storage disabled where the browser allows it.
- Session storage disabled where the browser allows it.
- Route changes with storage intact.
- Safe clearing of this site's Hotjar-related storage, with a warning.
- New user/session behavior after storage is cleared.
- Survey state persistence after completion or minimization.

## Do Not Track, IP Blocking, and Opt-Out

Hotjar provides different controls for different purposes:

- **Do Not Track:** a visitor preference intended to stop Hotjar from processing that visitor's
  data across sites. Browser and platform support can vary.
- **IP blocking:** the preferred site-owner approach when internal testing traffic should not be
  mixed with visitor data. It blocks the relevant IP from collection rather than relying on a
  browser preference.
- **Browser extensions or network blocking:** blocking `*.hotjar.com` can prevent collection,
  but is an environment-level control and not an application consent implementation.
- **Site consent:** the site owner is responsible for obtaining and honoring consent where
  required. The exact current Consent API remains a documentation gap until verified.

Important exception: Surveys can still appear when Do Not Track is enabled. If a visitor submits
a Survey response, that explicit submission is collected; if they do not submit a response, their
other data is not collected through that Survey interaction.

Testing should distinguish a tag/configuration failure from a deliberate privacy or environment
block. Check the browser preference, IP allow/block configuration, cookies, storage, network
requests, and Survey submission separately. Do not implement a fake client-side IP blocker in the
test page.

## Data Safety, Privacy, and Security

Hotjar data for this project is collected from a public test site, so all test values must remain
synthetic. The documentation states that Hotjar assigns a UUID-like site User ID without relying
on end-user IP addresses, does not store end-user IP addresses at rest by default, and transmits
data from the browser over HTTPS.

Important implementation rules:

- Never send real customer data, names, emails, account identifiers, card data, phone numbers,
  or IP addresses from this repository.
- Do not add an IP attribute to test calls. IP addresses sent through Identify are stored and
  require appropriate consent and an accepted Hotjar Data Processing Agreement.
- Rely on Hotjar's client-side suppression for the suppression test cases, and verify that
  sensitive values are removed before transmission. Do not use the test site to experiment with
  real PII.
- Keep raw cookies, User Attributes, session identifiers, and browser storage values out of the
  UI logs and documentation.
- Verify HTTPS network transport on the deployed GitHub Pages site.
- Treat Recordings as non-backed-up data; do not use this site as a place to retain important
  evidence or customer information.
- Privacy policy, consent, and legal classification decisions belong to the site owner and legal
  team; this playground can demonstrate technical behavior but cannot provide legal advice.

## Suppression and Privacy

Hotjar suppresses data before sending the DOM/session to Hotjar. Once collected, data cannot be retroactively suppressed. Updated suppression settings do not change already collected data.

### Default behavior

- User input is suppressed by default.
- Numbers with 9 or more digits are always suppressed, including separators such as hyphens or colons.
- Numeric text, email-like text, and other content may also be suppressed by site-level settings.
- Allowed input fields can be configured in Hotjar, but keystroke suppression can still override them.

### Site-wide and page-specific settings

Site-wide and page-specific suppression is configured in Hotjar Site Settings and requires Admin access or higher. The page can provide test content, but cannot configure these dashboard settings itself.

Settings include suppression of:

- Location information.
- All on-page content, including images and videos.
- All on-page text.
- Numeric text.
- Email addresses.
- Keystrokes in otherwise allowed input fields.

### Element-level suppression

Use the attribute or class:

```html
<p data-hj-suppress>Suppressed text</p>
<p class="data-hj-suppress">Suppressed text</p>
<div data-hj-suppress>
  <img src="example.png" alt="Suppressed image">
  <p>Suppressed child text</p>
</div>
```

Applying suppression to a parent suppresses text and image/video content in its children.

Inline SVG cannot be suppressed through this mechanism. An SVG loaded as the source of an image element can be suppressed.

### Suppression test cases

Include masked and control versions of:

- Text.
- Number, date, email-like, credit-card-like, and long-phone-number inputs.
- Placeholder text.
- Images.
- Videos.
- Nested content under a suppressed parent.
- Inline SVG and SVG-as-image.
- Recording, Heatmap, and Survey screenshot behavior.

## SPA, Sessions, and Iframes

Hotjar offers three URL-change modes in Site settings:

1. **Automatically, excluding fragments** (default): tracks URL path changes but does not track
   fragment or query-string changes.
2. **Automatically, including fragments:** tracks path changes and fragment changes. Use this
   when fragments represent meaningful SPA state. Confirm the current dashboard behavior for
   query strings before relying on it for targeting.
3. **Manually:** the site sends a unique path for each logical page using:

```js
hj('stateChange', 'example/page1')
hj('stateChange', 'example/page2')
```

The second argument can be a relative or full URL. Manual state changes still allow URL changes
from full page reloads. Use the manual mode when the application changes visible state without a
URL change or when exact control over SPA page paths is required.

SPA rules:

- Hotjar must be loaded once on the SPA shell, using a Page View/All Pages GTM trigger.
- Do not load the Tracking Code again on History Change or other SPA events; duplicate Hotjar
  scripts can cause missing or incorrect tracking.
- Identify is repeated after SPA URL changes with the latest complete attribute set.
- Events used for targeting must be sent on every route where the targeting rule should apply.
- User Attributes are session-based for targeting and do not need to be sent on every route, but
  Identify should still be sent after attribute changes and according to the Identify guidance.
- With automatic URL tracking, prefer URL-based targeting unless manual state changes or route
  events are deliberately implemented.
- A first-party child iframe can be compared with a child that has no tag and a sandboxed child.
- Third-party vendor iframe content cannot be instrumented by this project.

The official npm package is `@hotjar/browser`, but this project intentionally uses the GTM tag as
the single loader and should not add the npm package unless the architecture changes.

### SPA troubleshooting

Check the live Network panel for exactly one GTM load and one Hotjar script containing the site ID.
If there is no Hotjar script, verify the GTM container, published version, Page View trigger, and
tag switcher mode. If there is more than one Hotjar script, check for a hardcoded second loader
or a trigger other than Page View.

## Surveys and Feedback

The page code can emit the event and attributes that a Survey or feedback rule uses, but the Survey/feedback tool must be configured in the Hotjar dashboard.

### URL targeting

URL targeting can apply to the Survey itself or to an on-site invitation for a Link Survey. The
supported match types are:

- **Simple match:** matches the domain and path, ignoring `www`, query strings, and fragments;
  this is case-insensitive.
- **Exact match:** matches the complete URL, including protocol, query string, and fragment.
- **Starts with** and **Ends with:** compare the entered URL boundary.
- **Contains:** case-sensitive substring matching.
- **Regular Expression:** pattern matching against the URL.
- **JavaScript Events:** targets actions sent through the Events API and overrides URL targeting,
  including URL exclusions.

URL targeting supports only `a-z`, `A-Z`, numbers, `-`, `.`, `_`, `/`, and `~`; other characters
must be percent-encoded. URL exclusions apply only to URL targeting, not JavaScript Event
targeting. This matters for the SPA: choose the Hotjar URL-tracking mode and URL match type that
correspond to the route/query/fragment behavior, or use manual `stateChange` plus Events when the
Survey should appear after an action rather than merely on a URL.

### Survey formats and behavior

- **Popover:** a widget that may start expanded or minimized depending on device; minimizing can
  persist across matching pages.
- **Button:** a minimized button; an impression is counted when it loads.
- **Bubble:** a minimized bubble; an impression is counted when it loads.
- **Embedded:** inserted at the first matching target element; live changes can take about 60
  seconds to update.
- **Full Screen:** modal overlay, configurable for page load, delay, exit intent, or scroll depth.
- **Link:** hosted on `surveys.hotjar.com`; responses cannot connect to Recordings because the
  separate survey domain cannot load this site's Tracking Code. An on-site invitation can still
  be configured.

Survey state such as completed, minimized, and closed invitations is stored in cookies, so tests
must clear the relevant test storage when repeating a Survey scenario. Survey logic can route
respondents to a specific question or end with a thank-you message; checkbox questions cannot
route to a specific question, while radio and NPS questions can.

Test values should be explicit and stable, for example:

- Event: `hotjar_checkout_started`
- Attribute: `plan: 'test'`
- Attribute: `role: 'support-test'`

When combining Identify and Events for Survey targeting, Identify must complete before the Event is sent or the Survey may not appear.

## Planned Hotjar Test Area

The dedicated Hotjar page should include:

- Vendor availability and active-mode display.
- Hotjar event buttons and event-name validation.
- Identify/User Attribute controls.
- SPA route and query-string tests.
- Consent controls after the current Consent API is verified.
- Storage and cookie diagnostics.
- Suppressed and unsuppressed text, inputs, images, videos, and SVG cases.
- Accordion, modal, hover, focus, scrolling, and dynamic-content interactions.
- First-party iframe comparisons.
- `?hjDebug=1` link.
- Local event, Identify, storage, and consent readout without exposing private values or trying
  to extract the Hotjar User ID.
- Dashboard verification checklist for Recordings, Heatmaps, Events, User Attributes, Surveys, and network requests.

## Cross-Vendor Rendering Edge Cases

The Hotjar lab should share a rendering-edge-case track with Contentsquare and Heap. Keep the
same interaction and control content visible under the existing tag switcher so `All` runs all
three vendors and a single-vendor mode isolates one implementation.

### Infinite-scroll PLP

Append product-like rows/cards with synthetic text, images, prices, controls, and lazy media as
the visitor scrolls. Test initial content, appended content, repeated loads, rapid scrolling,
and failed/slow media. Compare recordings, heatmaps, click attribution, and SPA/session behavior
for content that did not exist at initial page load.

### Canvas

Include canvas-drawn text-like content, shapes, pointer interactions, redraws, resizing, and a
nearby HTML representation of the same content. Canvas pixels are not normal DOM nodes, so the
HTML control is necessary to distinguish missing DOM attribution from a general interaction bug.

### Shadow DOM

Include open and closed shadow roots with buttons, inputs, dynamic content, and adopted
stylesheets. Compare host versus inner-element click attribution, replay rendering, suppression
boundaries, and whether closed-root content is observable. A closed root must not be opened or
introspected by test code; the comparison should observe only supported browser behavior.

### Iframes

Compare same-origin first-party child pages, a child without any tag, a sandboxed child, and a
cross-origin child where a separate test origin is available. A parent cannot instrument content
inside an origin it cannot control. Each vendor's tag must be installed in a child document if
that child is expected to collect its own data. Third-party video iframe behavior is a separate
limitation and should not be presented as equivalent to a first-party iframe test.

For all four cases, keep a plain HTML control beside the special rendering and record the active
tag mode, frame context, and emitted synthetic test events without logging private values.

## Current Documentation Gaps

These items still need authoritative current documentation before implementation:

1. Consent/opt-out API syntax, arguments, reload behavior, and effect on each Hotjar product.
2. SPA state-change/pageview API syntax and required timing.
3. Survey and feedback targeting setup and processing delays.
4. Current GTM Event and User Attribute setup guidance.
5. Current masking/allowed-input configuration details beyond `data-hj-suppress`.

## Source Documents

- [Events API Reference](https://help.hotjar.com/hc/en-us/articles/36819965075473-Events-API-Reference)
- [Identify API Reference](https://help.hotjar.com/hc/en-us/articles/36820006120721-Identify-API-Reference)
- [What is a Hotjar User ID?](https://help.hotjar.com/hc/en-us/articles/36820043878161-What-is-a-Hotjar-User-ID)
- [What Are User Attributes?](https://help.hotjar.com/hc/en-us/articles/36820004580497-What-Are-User-Attributes)
- [How to Stop Hotjar From Collecting your Data](https://help.hotjar.com/hc/en-us/articles/36819956524177-How-to-Stop-Hotjar-From-Collecting-your-Data)
- [Hotjar on Single Page Apps](https://help.hotjar.com/hc/en-us/articles/36820006944657-Hotjar-on-Single-Page-Apps)
- [Google Tag Manager Installation Troubleshooting](https://help.hotjar.com/hc/en-us/articles/36819965783825-Google-Tag-Manager-Installation-Troubleshooting)
- [Cookies Set by the Hotjar Tracking Code](https://help.hotjar.com/hc/en-us/articles/36819973371409-Cookies-Set-by-the-Hotjar-Tracking-Code)
- [How to Suppress Text, Images, Videos and User Input](https://help.hotjar.com/hc/en-us/articles/36819956605329-How-to-Suppress-Text-Images-Videos-and-User-Input-from-Collected-Data)
- [Hotjar developer documentation](https://developers.hotjar.com/)
- Hotjar dashboard: `https://insights.hotjar.com/sites/2866949/dashboard`

## Privacy Rules for This Repository

- Never send real customer data.
- Never send real email addresses, names, card numbers, phone numbers, or account IDs.
- Never put raw cookies, local-storage values, User Attributes, or session identifiers into logs or documentation.
- Use stable synthetic values such as `test-user-123`, `plan: 'test'`, and `role: 'support-test'`.
- Keep the Hotjar loader in GTM and keep vendor selection controlled by the existing tag switcher.
