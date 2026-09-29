import { useState } from 'react'
import EventLog, { useEventLog } from '../components/EventLog.jsx'

const TEST_USER_ID = 'test-user-123'

function pushContentsquareStatus(status) {
    window._uxa = window._uxa || []
    window._uxa.push(['trackDynamicVariable', { key: 'loggingStatus', value: status }])
    return true
}

function identifyHeap() {
    if (!window.heap) return false
    window.heap.identify(TEST_USER_ID)
    window.heap.addUserProperties({ plan: 'test' })
    return true
}

function identifyHotjar() {
    if (typeof window.hj !== 'function') return false
    window.hj('identify', TEST_USER_ID, { plan: 'test' })
    return true
}

export default function Login() {
    const [loggedIn, setLoggedIn] = useState(false)
    const [entries, log] = useEventLog('Choose Log in or Log out to send identity calls.')

    function logIn() {
        const contentsquareReady = pushContentsquareStatus('logged')
        const heapReady = identifyHeap()
        const hotjarReady = identifyHotjar()
        setLoggedIn(true)
        log(
            `Login sent: Contentsquare ${contentsquareReady ? 'queued' : 'unavailable'}, Heap ${heapReady ? 'identified' : 'unavailable'
            }, Hotjar ${hotjarReady ? 'identified' : 'unavailable'}`,
        )
    }

    function logOut() {
        const contentsquareReady = pushContentsquareStatus('anonymous')
        const heapReady = Boolean(window.heap)
        if (heapReady) window.heap.resetIdentity()
        setLoggedIn(false)
        log(
            `Logout sent: Contentsquare ${contentsquareReady ? 'queued' : 'unavailable'}, Heap ${heapReady ? 'identity reset' : 'unavailable'
            }, Hotjar has no reset call in this test`,
        )
    }

    return (
        <>
            <h1>Login &amp; Identity</h1>
            <p>
                Simulate a user session and compare how Contentsquare, Heap, and Hotjar receive identity
                and logged-in state changes.
            </p>

            <div className="identity-status" aria-live="polite">
                <span>Test user</span>
                <code>{TEST_USER_ID}</code>
                <strong>{loggedIn ? 'Logged in' : 'Anonymous'}</strong>
            </div>

            <button type="button" onClick={logIn} disabled={loggedIn}>
                Log in test user
            </button>
            <button type="button" onClick={logOut} disabled={!loggedIn}>
                Log out test user
            </button>

            <h2>Vendor calls</h2>
            <ul>
                <li>Contentsquare: <code>loggingStatus</code> dynamic variable</li>
                <li>Heap: <code>identify</code>, user properties, and <code>resetIdentity</code></li>
                <li>Hotjar: <code>identify</code> with the test plan</li>
            </ul>
            <EventLog entries={entries} />
        </>
    )
}