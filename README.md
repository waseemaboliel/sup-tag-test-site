# Support Tag Test Site

A minimal static site used by Support to test how Heap / Contentsquare tags behave, loaded through a dedicated GTM sandbox container. Hotjar is explicitly out of scope for this site.

## Setup

- **GTM container:** `GTM-W925CGJH` (a fresh sandbox container, separate from any customer or shared container)
- **Contentsquare tag:** official "Contentsquare - Main tag" template, project `3977`, tag ID `2c5142b15f133`
- **Heap tag:** Custom HTML tag copied as a starting point; currently still using a borrowed Heap App ID (`209188840`) as a placeholder until Support has its own trial App ID — swap it out in GTM once we have one.

## Pages

- `index.html` — home page, overview
- `page-two.html` — second page, for testing pageview tracking across navigation
- `events.html` — buttons to fire a Contentsquare dynamic variable, a manual Contentsquare pageview, a Heap custom event, and a raw GTM dataLayer push
- `cart.html` — dummy cart with quantity inputs, pushes `cartValue`/`cartItemsNb` dvars
- `checkout.html` — fires `ec:transaction:create`/`ec:transaction:send` in normal, anonymous, duplicate-id, and missing-currency variants
- `guest-checkout.html` — simulates a checkout path that never fires the transaction commands (Phase 1 of [PLAN.md](PLAN.md))
- `errors.html` — JS Errors (automatic), Custom Errors (`trackError`, incl. a PII variant), Console Messages
- `api-errors.html` — API Errors (automatic on any failed request), PII-in-URL variant, and the `networkRequest:maskUrls`/`api-errors:maskUrl` masking commands (Phase 2 of [PLAN.md](PLAN.md))

## Roadmap

This is intentionally a small starting point. See [PLAN.md](PLAN.md) for the phased plan to grow it (ecommerce/transactions, error analysis, user identity/session, advanced tag & CSP edge cases) — tackled one phase at a time.

## Notes

GTM-W925CGJH was seeded by copying two tags ("Contentsquare - Main tag (web)" and "Heap Tag") out of an existing container (`GTM-W989V5M`, owned by Mohammad Al-Badah) using GTM's "copy to another container" action, which does not modify the source container. Nothing in `GTM-W989V5M` was changed.
