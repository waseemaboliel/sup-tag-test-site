# Support Tag Test Site

A React SPA (plus two deliberately standalone pages) used by Support to test how Contentsquare /
Heap / Hotjar tags behave, loaded through a dedicated GTM sandbox container. Live at
https://waseemaboliel.github.io/sup-tag-test-site/.

**Want to run this locally or add a page? See [DEVELOPER.md](DEVELOPER.md).**

## Setup

- **GTM container:** `GTM-W925CGJH` (a fresh sandbox container, separate from any customer or shared container)
- **Contentsquare tag:** official "Contentsquare - Main tag" template, project `3977`, tag ID `2c5142b15f133`
- **Heap tag:** Custom HTML tag, App ID `209188840` — permanently approved for our use by Mohammad Al-Badah.
- **Hotjar tag:** Custom HTML tag, site `2866949`.
- All three are gated by a per-vendor "Exception" trigger tied to the tag switcher (All / Contentsquare / Heap / Hotjar) in the site header — see [DEVELOPER.md](DEVELOPER.md).

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

See [PLAN.md](PLAN.md) for the phased plan. Phases 0–5 (SPA rebuild, per-vendor tag switcher,
Hotjar + Heap rollout) are done — next up is the earlier ticket-pattern backlog starting at
Phase 6.

## Notes

GTM-W925CGJH was seeded by copying two tags ("Contentsquare - Main tag (web)" and "Heap Tag") out of an existing container (`GTM-W989V5M`, owned by Mohammad Al-Badah) using GTM's "copy to another container" action, which does not modify the source container. Nothing in `GTM-W989V5M` was changed.
