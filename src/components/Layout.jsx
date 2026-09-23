import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getActiveTagMode, setActiveTagMode, TAG_MODES } from '../lib/tagSwitcher.js'

const spaLinks = [
  { to: '/', label: 'Home' },
  { to: '/page-two', label: 'Page Two' },
  { to: '/events', label: 'Fire Events' },
  { to: '/cart', label: 'Cart' },
]

function TagSwitcher() {
  const [mode, setMode] = useState(getActiveTagMode)

  function choose(value) {
    if (value === mode) return
    setMode(value)
    setActiveTagMode(value) // persists to localStorage + reloads the page
  }

  return (
    <div className="tag-switcher" role="group" aria-label="Active tags">
      {TAG_MODES.map((m) => (
        <button
          key={m.value}
          type="button"
          className={m.value === mode ? 'active' : ''}
          onClick={() => choose(m.value)}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}

export default function Layout({ children }) {
  const location = useLocation()

  return (
    <div className="shell">
      <header className="topbar">
        <span className="brand">Support Tag Test Site</span>
        <TagSwitcher />
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
          <code>209188840</code>
        </p>
      </footer>
    </div>
  )
}
