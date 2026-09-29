# Support Tag Test Site

A React SPA plus standalone HTML test documents used by Support to test how Contentsquare,
Heap, and Hotjar behave, loaded through a dedicated GTM sandbox container. Live at
https://waseemaboliel.github.io/sup-tag-test-site/.

**Want to run this locally or add a page? See [DEVELOPER.md](DEVELOPER.md).**

**Hotjar implementation reference:** see [HOTJAR-REFERENCE.md](HOTJAR-REFERENCE.md) for the
verified API behavior, privacy rules, storage details, and remaining research gaps.

## Setup

- **GTM container:** `GTM-W925CGJH` (a fresh sandbox container, separate from any customer or shared container)
- **Contentsquare tag:** official "Contentsquare - Main tag" template, project `3977`, tag ID `2c5142b15f133`
- **Heap tag:** Custom HTML tag, App ID `209188840` — permanently approved for our use by Mohammad Al-Badah.
- **Hotjar tag:** Custom HTML tag, site `2866949`.
- All three are gated by a per-vendor "Exception" trigger tied to the tag switcher (All / Contentsquare / Heap / Hotjar) in the site header — see [DEVELOPER.md](DEVELOPER.md).

The tag switcher defaults to `All`. Selecting a single vendor reloads the current page with a
`?tags=` override and persists the choice in `localStorage`. Use the deployed site for real
vendor/dashboard verification; localhost is for UI and build work.

## Pages

SPA routes (`src/pages/`, clean paths — e.g. `/cart`):
- **Home** — overview
- **Page Two** — second route, for testing pageview tracking across a client-side route change
- **Fire Events** — buttons to fire a Contentsquare dynamic variable, a manual Contentsquare pageview, a Heap custom event, and a raw GTM dataLayer push
- **Login & Identity** — simulates login/logout and sends identity calls to Contentsquare, Heap, and Hotjar
- **Hotjar Lab** — tests documented Hotjar Events, User Attributes, SPA state changes, storage, and suppression
- **Infinite PLP** — an unbounded, image-heavy product feed with lazy media, appended cards, ratings, badges, and interactions
- **Canvas & Shadow DOM** — compares canvas pixels, HTML, open/closed shadow roots, and adopted stylesheets
- **Iframe Lab** — compares tagged, untagged, sandboxed, same-origin, and cross-origin frames
- **Survey Targeting** — provides stable URL, Event, and User Attribute fixtures for dashboard-configured Hotjar Surveys
- **Cart** — dummy cart with quantity inputs, pushes `cartValue`/`cartItemsNb` dvars
- **Checkout** — fires `ec:transaction:create`/`ec:transaction:send` in normal, anonymous, duplicate-id, and missing-currency variants
- **Guest Checkout** — simulates a checkout path that never fires the transaction commands

Standalone pages (`public/`, real full-page documents outside the SPA):
- `errors.html` — JS Errors (automatic), Custom Errors (`trackError`, incl. a PII variant), Console Messages
- `api-errors.html` — API Errors (automatic on any failed request), PII-in-URL variant, and the `networkRequest:maskUrls`/`api-errors:maskUrl` masking commands
- `iframe-lab-child.html` — first-party child document used by the Iframe Lab; conditionally loads GTM or stays untagged

## Roadmap

See [PLAN.md](PLAN.md) for the phased plan. Phases 0–6 are complete. Phase 7 is in progress and
now includes the Hotjar Lab, privacy fixtures, infinite PLP, canvas/Shadow DOM, iframe, and
Survey-targeting test surfaces. See [HOTJAR-REFERENCE.md](HOTJAR-REFERENCE.md) for Hotjar API
and privacy research.

## Notes

GTM-W925CGJH was seeded by copying two tags ("Contentsquare - Main tag (web)" and "Heap Tag") out of an existing container (`GTM-W989V5M`, owned by Mohammad Al-Badah) using GTM's "copy to another container" action, which does not modify the source container. Nothing in `GTM-W989V5M` was changed. Do not commit tokens, private dashboard data, or real customer data; all test identities and attributes are synthetic.
