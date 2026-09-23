# Developer Guide

Operational reference for running, building, and extending this project locally. `PLAN.md` has
the feature roadmap; `CONTINUE.md` has cross-session handoff notes; this file has everything
needed to actually get the code running on your machine.

## Prerequisites

- **Node.js 18 or newer** (built and tested with Node 22.23.0 / npm 10.9.8 — run `node -v` to check yours).
- **npm** (ships with Node).
- A GitHub account with push access to this repo, if you intend to deploy.

### If you're on a Contentsquare laptop: check your npm registry

This project has **nothing to do with Contentsquare's internal package registry** — it only
depends on public packages (React, Vite, etc.). If your global `~/.npmrc` points at
Contentsquare's CodeArtifact registry (common on work laptops), `npm install` here can fail with
a `401 Unable to authenticate` error, because CodeArtifact tokens expire and public open-source
packages aren't the point of that registry anyway.

This repo ships its own `.npmrc` pointing at the public npm registry
(`https://registry.npmjs.org/`), which npm will use automatically for anything run inside this
folder — you don't need to touch your global config. If you still hit a registry/auth error,
confirm you're running the command from inside the repo directory.

## Getting started

```bash
git clone git@github.com:waseemaboliel/sup-tag-test-site.git
cd sup-tag-test-site
npm install
npm run dev
```

`npm run dev` starts a local dev server (Vite prints the URL — typically
`http://localhost:5173/`). Open it in a browser. The SPA uses real path-based routing (clean
URLs), so its routes look like `http://localhost:5173/cart`, `http://localhost:5173/checkout`,
etc. — note `npm run dev` doesn't reproduce GitHub Pages' 404 behavior for deep links, see the
"Clean URLs on GitHub Pages" section below. The two
standalone pages are served directly: `http://localhost:5173/errors.html` and
`http://localhost:5173/api-errors.html`.

Vite supports hot module reload — editing a file under `src/` updates the browser instantly
without a full reload.

## ⚠️ Local dev vs. the deployed site — tags may behave differently

This project only really "works" as a tag-testing tool on the deployed GitHub Pages site
(`https://waseemaboliel.github.io/sup-tag-test-site/`), for two reasons:

1. **The Contentsquare project, Heap App ID, and (once Phase 5 lands) Hotjar site were all set
   up and verified against that specific `github.io` domain.** Loading the same tags from
   `localhost` may still technically fire (GTM itself doesn't hard-block by domain by default),
   but don't treat a clean run on `localhost` as proof a tag works — and don't be surprised if
   session/replay data recorded from `localhost` looks inconsistent or doesn't show up the way
   you'd expect in each vendor's dashboard.
2. Browser ad blockers / tracking-protection extensions very commonly block
   `googletagmanager.com`, `static.hotjar.com`, etc. on `localhost` even when they'd allow the
   real deployed domain (or vice versa) — another reason local results aren't representative.

**Use `npm run dev` for UI/logic work** — building pages, wiring up buttons, checking the log
output, styling. **Do final tag-behavior verification (confirming a dashboard actually shows the
recording/error/event) against the deployed GitHub Pages URL**, not localhost.

## Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the Vite dev server with hot reload, for local development. |
| `npm run build` | Builds the production bundle into `dist/`. |
| `npm run preview` | Serves the built `dist/` folder locally (`http://localhost:4173/…`), so you can sanity-check a production build before pushing. Run `npm run build` first. |

## Deployment

Deployment is automatic via GitHub Actions: **`.github/workflows/deploy.yml`** builds the project
and publishes `dist/` to GitHub Pages on every push to `main`.

**One-time setup still needed:** this repo's Pages source is currently set to the legacy
"Deploy from a branch" mode (serving raw files straight from `main`), left over from before this
project had a build step. For the Actions workflow's deploy step to work, go to:

> GitHub repo → **Settings → Pages → Build and deployment → Source** → change to **"GitHub Actions"**

Do this once, then every push to `main` will build and deploy automatically — no more manually
committing static HTML. (If this hasn't been flipped yet, the workflow's build job will still
succeed on push, but the deploy job will fail until the setting is changed.)

To deploy manually without waiting for a push, use the workflow's "Run workflow" button under
the repo's **Actions** tab (it's set up with `workflow_dispatch`).

## Project structure

```
index.html              Vite's SPA entry point — GTM snippet + <div id="root"> + app bootstrap.
                         Has a TODO comment marking where Phase 4's tag-switcher dataLayer push goes.
vite.config.js           Vite config — base path MUST match the GH Pages repo path.
src/
  main.jsx                React root bootstrap.
  App.jsx                 BrowserRouter + route table. Add new SPA pages here.
  styles.css              Shared design system for the SPA (CSS variables, layout, components).
  components/
    Layout.jsx             Shared header/nav/footer wrapper around every SPA route.
                            Has a TODO comment marking where Phase 4's switcher UI goes.
    EventLog.jsx            Reusable "click a button, see what fired" log + useEventLog() hook,
                             used by Events/Cart/Checkout/GuestCheckout.
  pages/
    Home.jsx, PageTwo.jsx, Events.jsx, Cart.jsx, Checkout.jsx, GuestCheckout.jsx
                            One component per SPA route.
public/
  errors.html, api-errors.html
                            Deliberately standalone HTML documents, NOT part of the SPA/router —
                            their own <head>, own GTM snippet, no React. Vite copies public/ files
                            to the build output untouched. This is the intentional SPA-vs-MPA
                            comparison from PLAN.md Phase 3: reaching these via the nav is a real
                            full-page load (Natural Pageview), not a client-side route change
                            (Artificial Pageview).
  shared.css                Plain CSS for the two standalone pages above — kept visually in sync
                             with src/styles.css by hand (they can't share Vite's module graph
                             since these pages don't load any JS bundle).
  404.html                  GitHub Pages' 404 fallback — redirects deep-link requests (e.g.
                             /cart) back through index.html so BrowserRouter's clean URLs work
                             on a static host. See "Clean URLs on GitHub Pages" below.
.github/workflows/deploy.yml
                          Builds + deploys to GitHub Pages on every push to main.
PLAN.md                  Feature roadmap / phases.
CONTINUE.md               Cross-session operational handoff notes (GTM container state, blockers).
DEVELOPER.md              This file.
```

### Adding a new SPA page

1. Create `src/pages/YourPage.jsx` (copy an existing simple one like `PageTwo.jsx` as a starting point).
2. Add a `<Route path="/your-page" element={<YourPage />} />` in `src/App.jsx`.
3. If it should be reachable from the main nav, add a `{ to: '/your-page', label: 'Your Page' }` entry to the `spaLinks` array in `src/components/Layout.jsx`.
4. If it needs the click-a-button/log pattern, use `EventLog`/`useEventLog` from `src/components/EventLog.jsx` rather than reinventing it.

### Adding a new standalone (MPA) page

Only do this when the point is specifically to have a **real, separate page load** (like
`errors.html`/`api-errors.html`) — otherwise, add an SPA page instead.

1. Create `public/your-page.html` as a complete, self-contained HTML document (own `<head>`,
   `<title>`, GTM snippet — copy the GTM `<script>`/`<noscript>` block exactly from
   `public/errors.html`).
2. Link `<link rel="stylesheet" href="./shared.css">` for consistent styling.
3. Update the nav block (`<nav class="nav">…</nav>`) in **every** standalone page (including the
   new one) to include a link to it, and add a real `<a href="./your-page.html">` entry (with an
   `MPA` badge, matching the existing two) to `src/components/Layout.jsx`'s nav so the SPA can
   link out to it too.

## Tag switcher (Phase 4)

Every page has a segmented control in the header — **All / Contentsquare / Heap / Hotjar** —
letting a visitor choose which vendor tag(s) actually fire. Default is `all`.

How it works:
- An inline `<script>` block, placed **before** the GTM snippet, runs on every page load. It
  resolves the active mode (URL `?tags=` param → sticky `localStorage` value → default `'all'`),
  persists it back to `localStorage`, and pushes `{ activeTags: [...] }` to `window.dataLayer`
  before GTM's own script tag loads — so GTM's tags can check it via a Data Layer Variable at
  the moment they evaluate their firing triggers.
- This inline block is **byte-identical across `index.html`, `public/errors.html`, and
  `public/api-errors.html`** — it has to run inline and synchronously in each document
  separately (no shared JS module works here since two of these documents don't load a bundle
  at all). If you change the logic, update all three.
- The visible control itself has two implementations that must be kept in sync by hand:
  `src/lib/tagSwitcher.js` + the `TagSwitcher` component in `src/components/Layout.jsx` for the
  SPA, and a small vanilla-JS-rendered version duplicated in `public/errors.html` and
  `public/api-errors.html`. Both read/write the same `localStorage` key
  (`supTagTestSite.activeTags`), so a choice made on one made carries over to the other.
- Clicking a mode writes `?tags=<mode>` into the URL (path preserved, e.g. `/cart?tags=heap`)
  and navigates there, which reloads the page — GTM evaluates firing triggers once per load, so
  a live in-page toggle without a reload wouldn't actually change which tags fire. Putting the
  mode in the URL also makes the current selection visible at a glance instead of only living
  invisibly in `localStorage` — this was a deliberate fix after the first version only wrote to
  `localStorage` and reloaded in place, which left no visible confirmation the switch worked.
  Note this only updates the URL at the moment you click a switcher button — regular nav-link
  clicks elsewhere don't carry `?tags=` forward, though the underlying `localStorage` preference
  still applies correctly on the next page regardless.

**GTM side is configured and published** (in `GTM-W925CGJH`, not in this repo's code): a Data
Layer Variable `DLV - Active Tags`, plus a blocking-trigger "Exception" per vendor
(`Exception - CS Disabled`, `Exception - Heap Disabled`) attached to each tag — implemented as
exceptions rather than firing-condition edits so the tags' existing `All Pages`/`History Change`
triggers didn't need to change. See `PLAN.md` Phase 4 for the exact setup and how it was
verified (including that the exception correctly applies during SPA route changes, not just the
initial pageview). Adding a 4th vendor later (e.g. Hotjar in Phase 5) means repeating this same
pattern: a new exception trigger + attaching it to the new tag.

## GTM / tag reference

- **Container:** `GTM-W925CGJH` (Waseem's own sandbox container — do not confuse with
  `GTM-W989V5M`, Mohammad Al-Badah's container this one was seeded from, or `GTM-TQGPGN3`,
  Hotjar Support's own container — neither of those should ever be edited from this project).
- **Contentsquare tag:** official "Contentsquare - Main tag" template, project `3977`, tag
  `2c5142b15f133`. Live/active.
- **Heap tag:** Custom HTML tag, App ID `209188840` — permanently approved for our use by
  Mohammad Al-Badah (see `PLAN.md` Phase 15 for eventually replacing it with Support's own ID).
  Currently paused in GTM — see `CONTINUE.md` for current status.
- **Hotjar:** not wired up yet — see `PLAN.md` Phase 5 for the exact snippet/site ID to use once
  that phase starts.

### Verify the History Change trigger after deploying

Waseem already added a History Change trigger to the CS Main tag config to support Artificial
Pageviews from this SPA. The app uses `BrowserRouter` (real `pushState`-driven path changes, not
`#hash` changes), which is exactly what GTM's History Change trigger listens for by default
("Fire trigger on: Any History Change") — no special hash-change configuration should be needed.
Still worth a quick check on the live site once route changes can be tested for real.

## Clean URLs on GitHub Pages: the 404.html trick

This app uses `BrowserRouter`, so routes are real paths (`/cart`, `/checkout`, …), not
`#/cart`. GitHub Pages is a static file host with no server-side rewrites, so it would normally
404 on a hard refresh or direct link to one of those paths, since no `cart` file/folder exists —
only `index.html` does. Two pieces fix this (the standard
[rafgraph/spa-github-pages](https://github.com/rafgraph/spa-github-pages) technique):

1. **`public/404.html`** — GitHub Pages serves this for any path it can't find. It repacks the
   real path + query into a query string on the repo root (e.g.
   `/sup-tag-test-site/cart?tags=all` → `/sup-tag-test-site/?/cart&tags=all`), which GitHub Pages
   *can* serve, since that's just `index.html` with a query string.
2. **The redirect-restore `<script>` at the very top of `index.html`'s `<head>`** — runs before
   anything else (including the tag-switcher script), detects the repacked query string, and
   calls `history.replaceState` to put the real URL back (`/sup-tag-test-site/cart?tags=all`)
   before React Router or the tag switcher ever reads `location`.

Practical effect: any full-page navigation to a deep path (a hard refresh, a bookmark, a direct
link, or the tag switcher's own full-page reload) takes one extra round-trip through
`404.html` before landing on the right page — a bit slower than a same-page 304, but invisible
to the visitor and the only way to get real clean URLs out of a router-less static host.

If you ever rename the repo (changing the GitHub Pages path), update `pathSegmentsToKeep` in
`public/404.html` to match the new number of path segments before the app's own routes, and
update `vite.config.js`'s `base` to match — `BrowserRouter`'s `basename` reads `base` automatically
via `import.meta.env.BASE_URL`, so that part doesn't need a separate change.

## Dependencies, and why each is here

| Package | Why |
|---|---|
| `react`, `react-dom` | UI library. Chosen over vanilla JS because the site now has real shared state (cart quantities, event logs) and repeated layout across many pages — component reuse pays off here. Chosen over Angular for lower ceremony/boilerplate for a project this size. |
| `react-router-dom` | Client-side routing for the SPA, using `BrowserRouter` for clean URLs (`/cart`, not `/#/cart`). Paired with `public/404.html` + a redirect-restore script in `index.html` (see "Clean URLs on GitHub Pages" below) to work around GitHub Pages having no server-side rewrites. |
| `vite` | Dev server + build tool. Chosen over Create React App (which Hotjar's own `hotjar/sandbox` repo uses) because CRA is deprecated/unmaintained; Vite is the current standard, has near-instant hot reload, and a much simpler config surface. |
| `@vitejs/plugin-react` | Vite's official plugin for compiling JSX/Fast Refresh. |
| *(GitHub Actions, not npm)* `actions/checkout`, `actions/setup-node`, `actions/upload-pages-artifact`, `actions/deploy-pages` | Official GitHub Actions used by `.github/workflows/deploy.yml` to build and publish to Pages on every push — no `gh-pages` npm package or manual deploy branch needed. |

## Troubleshooting

- **Blank page after `npm run build` + `npm run preview`, works fine in `npm run dev`:** almost
  always a `base` path mismatch in `vite.config.js`. It must exactly match the repo's GitHub
  Pages path (`/sup-tag-test-site/`) — if the repo is ever renamed, update this.
- **Buttons on `errors.html`/`api-errors.html` don't do anything:** these are plain
  `<script>` tags in a static HTML file, not React — check the browser console for a JS syntax
  error introduced while editing, since there's no build step to catch it ahead of time for
  these two files.
- **Tags don't seem to fire at all, anywhere:** check for an ad blocker / tracking-protection
  extension first (see the local-dev caveat above) before assuming the code is broken.
