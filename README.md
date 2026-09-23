# Support Tag Test Site

A React SPA (plus two deliberately standalone pages) used by Support to test how Contentsquare /
Heap / Hotjar tags behave, loaded through a dedicated GTM sandbox container. Live at
https://waseemaboliel.github.io/sup-tag-test-site/.

**Want to run this locally or add a page? See [DEVELOPER.md](DEVELOPER.md).**

## Setup

- **GTM container:** `GTM-W925CGJH` (a fresh sandbox container, separate from any customer or shared container)
- **Contentsquare tag:** official "Contentsquare - Main tag" template, project `3977`, tag ID `2c5142b15f133`
- **Heap tag:** Custom HTML tag, App ID `209188840` — permanently approved for our use by Mohammad Al-Badah.
- **Hotjar:** not wired up yet — see [PLAN.md](PLAN.md) Phase 5.

## Pages

SPA routes (`src/pages/`, clean paths — e.g. `/cart`):
- **Home** — overview
- **Page Two** — second route, for testing pageview tracking across a client-side route change
- **Fire Events** — buttons to fire a Contentsquare dynamic variable, a manual Contentsquare pageview, a Heap custom event, and a raw GTM dataLayer push
- **Cart** — dummy cart with quantity inputs, pushes `cartValue`/`cartItemsNb` dvars
- **Checkout** — fires `ec:transaction:create`/`ec:transaction:send` in normal, anonymous, duplicate-id, and missing-currency variants
- **Guest Checkout** — simulates a checkout path that never fires the transaction commands

Standalone pages (`public/`, real full-page documents outside the SPA — see [DEVELOPER.md](DEVELOPER.md) for why):
- `errors.html` — JS Errors (automatic), Custom Errors (`trackError`, incl. a PII variant), Console Messages
- `api-errors.html` — API Errors (automatic on any failed request), PII-in-URL variant, and the `networkRequest:maskUrls`/`api-errors:maskUrl` masking commands

## Roadmap

See [PLAN.md](PLAN.md) for the phased plan — currently rebuilding as an SPA with a per-vendor tag
switcher and re-adding Hotjar (Phases 3–5), then continuing the earlier ticket-pattern backlog.

## Notes

GTM-W925CGJH was seeded by copying two tags ("Contentsquare - Main tag (web)" and "Heap Tag") out of an existing container (`GTM-W989V5M`, owned by Mohammad Al-Badah) using GTM's "copy to another container" action, which does not modify the source container. Nothing in `GTM-W989V5M` was changed.
