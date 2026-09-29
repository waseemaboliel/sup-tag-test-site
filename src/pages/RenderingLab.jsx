import { useEffect, useRef, useState } from 'react'
import EventLog, { useEventLog } from '../components/EventLog.jsx'

function sendVendorSignals(log, label) {
    const results = []
    try {
        if (typeof window.hj === 'function') {
            window.hj('event', 'rendering_lab_interaction')
            results.push('Hotjar sent')
        } else {
            results.push('Hotjar unavailable')
        }
    } catch (error) {
        results.push('Hotjar error')
    }
    try {
        if (window.heap && typeof window.heap.track === 'function') {
            window.heap.track('Rendering Lab Interaction', { surface: label })
            results.push('Heap sent')
        } else {
            results.push('Heap unavailable')
        }
    } catch (error) {
        results.push('Heap error')
    }
    try {
        window._uxa = window._uxa || []
        window._uxa.push(['trackDynamicVariable', { key: 'renderingSurface', value: label }])
        results.push('Contentsquare queued')
    } catch (error) {
        results.push('Contentsquare error')
    }
    log(`${label}: ${results.join(', ')}`)
}

function CanvasFixture({ onInteract }) {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        context.fillStyle = '#dce8ff'
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.fillStyle = '#2f6fed'
        context.beginPath()
        context.arc(110, 90, 54, 0, Math.PI * 2)
        context.fill()
        context.fillStyle = '#1c2128'
        context.font = '20px sans-serif'
        context.textAlign = 'center'
        context.fillText('Canvas pixels', 240, 94)
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="test-canvas"
            width="480"
            height="180"
            onClick={onInteract}
            aria-label="Canvas drawing with a circle and text"
        />
    )
}

function ShadowFixture({ mode, onInteract }) {
    const hostRef = useRef(null)
    const interactionRef = useRef(onInteract)
    const [adopted, setAdopted] = useState(false)

    interactionRef.current = onInteract

    useEffect(() => {
        const host = hostRef.current
        const root = host.attachShadow({ mode })
        const sheet = new CSSStyleSheet()
        sheet.replaceSync('.inner { padding: 12px; border: 2px solid #2f6fed; background: #eaf0ff; } button { padding: 8px; }')
        if ('adoptedStyleSheets' in root) {
            root.adoptedStyleSheets = [sheet]
            setAdopted(true)
        }
        const wrapper = document.createElement('div')
        wrapper.className = 'inner'
        wrapper.innerHTML = '<strong>Shadow-root content</strong><p>Dynamic child inside the component.</p><button type="button">Click inner button</button>'
        wrapper.querySelector('button').addEventListener('click', () => interactionRef.current())
        root.appendChild(wrapper)

        return () => host.replaceChildren()
    }, [mode])

    return (
        <div>
            <div ref={hostRef} className="shadow-host" />
            <small>{mode} root · adopted stylesheet: {adopted ? 'supported' : 'unavailable'}</small>
        </div>
    )
}

export default function RenderingLab() {
    const [entries, log] = useEventLog('Interact with canvas, Shadow DOM, and HTML controls.')
    const handleInteraction = (label) => () => sendVendorSignals(log, label)

    return (
        <>
            <h1>Canvas &amp; Shadow DOM</h1>
            <p>
                Compare content rendered as pixels or inside Shadow DOM with ordinary HTML controls. Run
                the page with All tags, then isolate each vendor with the header switcher.
            </p>

            <h2>Canvas versus HTML</h2>
            <div className="rendering-grid">
                <div className="fixture-panel">
                    <strong>Canvas</strong>
                    <CanvasFixture onInteract={handleInteraction('canvas')} />
                </div>
                <div className="fixture-panel">
                    <strong>HTML control</strong>
                    <button type="button" onClick={handleInteraction('html-control')}>Click HTML control</button>
                    <p className="html-comparison">Plain text and button content remain normal DOM nodes.</p>
                </div>
            </div>

            <h2>Open and closed Shadow DOM</h2>
            <div className="rendering-grid">
                <div className="fixture-panel">
                    <strong>Open root</strong>
                    <ShadowFixture mode="open" onInteract={handleInteraction('open-shadow-root')} />
                </div>
                <div className="fixture-panel">
                    <strong>Closed root</strong>
                    <ShadowFixture mode="closed" onInteract={handleInteraction('closed-shadow-root')} />
                </div>
            </div>
            <p className="notice">
                The closed root is intentionally not inspected by test code. Compare vendor behavior from
                the visible interaction, replay, and network data instead of treating browser internals as
                a supported API.
            </p>
            <EventLog entries={entries} />
        </>
    )
}