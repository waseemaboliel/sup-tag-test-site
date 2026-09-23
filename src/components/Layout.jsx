import { Link, useLocation } from 'react-router-dom'

const spaLinks = [
  { to: '/', label: 'Home' },
  { to: '/page-two', label: 'Page Two' },
  { to: '/events', label: 'Fire Events' },
  { to: '/cart', label: 'Cart' },
]

export default function Layout({ children }) {
  const location = useLocation()

  return (
    <div className="shell">
      <header className="topbar">
        <span className="brand">Support Tag Test Site</span>
        {/*
          Phase 4 TODO (tag switcher): the "All / CS / Heap / Hotjar" control lives here,
          in the shared header, so it's present on every SPA route in one place. See
          index.html's top-of-file comment for the dataLayer side of this, and PLAN.md
          Phase 4 for the full design (localStorage + ?tags= override + GTM firing rules).
        */}
      </header>

      <nav className="nav">
        {spaLinks.map((l) => (
          <Link key={l.to} to={l.to} className={location.pathname === l.to ? 'active' : ''}>
            {l.label}
          </Link>
        ))}
        {/*
          These two intentionally use a real <a> tag, not <Link>, so clicking them is a genuine
          full browser navigation (Natural Pageview) to a standalone HTML document outside the
          SPA/router entirely — the deliberate SPA-vs-MPA comparison from PLAN.md Phase 3.
        */}
        <a href="./errors.html">
          Errors <span className="mpa-tag">MPA</span>
        </a>
        <a href="./api-errors.html">
          API Errors <span className="mpa-tag">MPA</span>
        </a>
      </nav>

      <main className="content">{children}</main>

      <footer className="footer">
        <p>
          GTM <code>GTM-W925CGJH</code> · CS project <code>3977</code> · Heap App ID{' '}
          <code>209188840</code> · see <a href="https://github.com/waseemaboliel/sup-tag-test-site/blob/main/DEVELOPER.md">DEVELOPER.md</a>
        </p>
      </footer>
    </div>
  )
}
