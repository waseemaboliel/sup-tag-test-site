import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <>
      <h1>Support Tag Test Site</h1>
      <p>
        A playground for Support to test Contentsquare, Heap, and (soon) Hotjar tags, loaded
        through a dedicated GTM sandbox container. Every page reachable from the nav above{' '}
        <strong>except Errors and API Errors</strong> is part of this React single-page app —
        moving between them fires an <strong>Artificial Pageview</strong> through GTM's History
        Change trigger, not a real browser navigation. Errors and API Errors are real, separate
        HTML documents outside the app — clicking into them is a genuine{' '}
        <strong>Natural Pageview</strong>.
      </p>

      <div className="box">
        <strong>GTM container:</strong> <code>GTM-W925CGJH</code>
        <br />
        <strong>Contentsquare tag:</strong> project 3977, tag <code>2c5142b15f133</code>
        <br />
        <strong>Heap tag:</strong> App ID <code>209188840</code>, permanently approved for our use
        by Mohammad Al-Badah.
      </div>

      <p>
        Navigate between pages to test SPA-driven pageview tracking, or go to{' '}
        <Link to="/events">Fire Events</Link> to trigger custom Heap/Contentsquare events manually.
      </p>
    </>
  )
}
