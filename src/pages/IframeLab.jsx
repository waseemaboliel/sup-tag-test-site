import { useState } from 'react'
import EventLog, { useEventLog } from '../components/EventLog.jsx'

const childPath = './iframe-lab-child.html'

export default function IframeLab() {
    const [entries, log] = useEventLog('Compare the frame contexts and check each document in DevTools.')
    const [reloadKey, setReloadKey] = useState(0)

    function report(label) {
        log(`${label}: inspect the frame document and Network panel for its own GTM/Hotjar load`)
    }

    return (
        <>
            <h1>Iframe Lab</h1>
            <p>
                Compare a first-party child with its own tag, a first-party child without tags, a sandboxed
                child, and a cross-origin document. A parent cannot instrument content it does not control.
            </p>
            <button type="button" onClick={() => setReloadKey((key) => key + 1)}>Reload all child frames</button>

            <div className="iframe-grid" key={reloadKey}>
                <section className="fixture-panel">
                    <h2>Same-origin child with GTM</h2>
                    <iframe title="Same-origin child with GTM" src={childPath} className="test-iframe" onLoad={() => report('Tagged child loaded')} />
                    <p>Expected: this document loads its own GTM container and vendor tags according to the selected mode.</p>
                </section>
                <section className="fixture-panel">
                    <h2>Same-origin child without GTM</h2>
                    <iframe title="Same-origin child without GTM" src={`${childPath}?notags=1`} className="test-iframe" onLoad={() => report('Untagged child loaded')} />
                    <p>Expected: the child renders content but does not load GTM or Hotjar.</p>
                </section>
                <section className="fixture-panel">
                    <h2>Sandboxed child</h2>
                    <iframe title="Sandboxed child" src={childPath} sandbox="allow-scripts" className="test-iframe" onLoad={() => report('Sandboxed child loaded')} />
                    <p>Expected: scripts can run, but the sandboxed document has an opaque origin.</p>
                </section>
                <section className="fixture-panel">
                    <h2>Cross-origin document</h2>
                    <iframe title="Cross-origin document" src="https://example.com/" className="test-iframe" onLoad={() => report('Cross-origin frame loaded or emitted a browser frame event')} />
                    <p>Expected: the parent cannot inspect or inject tags into this external origin. Browser policy may block display.</p>
                </section>
            </div>
            <EventLog entries={entries} />
        </>
    )
}