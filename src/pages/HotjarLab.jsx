import { useEffect, useState } from 'react'
import EventLog, { useEventLog } from '../components/EventLog.jsx'

const TEST_USER_ID = 'test-user-123'
const BASE_ATTRIBUTES = {
  plan: 'trial',
  role: 'support-test',
  subscription_type: 'monthly',
  on_trial: true,
  language: 'en',
  widgets_opt_out: false,
  total_purchases: 42,
  signed_up: '2026-09-29T00:00:00.000Z',
}

function isHotjarAvailable() {
  return typeof window.hj === 'function'
}

function callHotjar(command) {
  if (!isHotjarAvailable()) return false
  window.hj(...command)
  return true
}

function getStorageState() {
  const state = { cookies: false, localStorage: false, sessionStorage: false }

  try {
    state.cookies = navigator.cookieEnabled
  } catch (error) {
    // Browser privacy settings can make this unavailable.
  }

  try {
    const key = '__hotjar_lab_local__'
    localStorage.setItem(key, '1')
    localStorage.removeItem(key)
    state.localStorage = true
  } catch (error) {
    // Browser privacy settings can make this unavailable.
  }

  try {
    const key = '__hotjar_lab_session__'
    sessionStorage.setItem(key, '1')
    sessionStorage.removeItem(key)
    state.sessionStorage = true
  } catch (error) {
    // Browser privacy settings can make this unavailable.
  }

  return state
}

function isValidEventName(name) {
  return name.length > 0 && name.length <= 250 && /^[a-zA-Z0-9_\-. :|/]+$/.test(name)
}

export default function HotjarLab() {
  const [entries, log] = useEventLog('Choose a Hotjar test to begin.')
  const [storage, setStorage] = useState(getStorageState)
  const [eventName, setEventName] = useState('hotjar_test_started')
  const [identified, setIdentified] = useState(false)

  useEffect(() => {
    setStorage(getStorageState())
  }, [])

  function sendEvent(name = eventName) {
    if (!isValidEventName(name)) {
      log('Event rejected locally: use valid Hotjar characters and keep the name under 250 characters.')
      return
    }
    const sent = callHotjar(['event', name])
    log(`Hotjar event ${sent ? 'sent' : 'unavailable'}: ${name}`)
  }

  function identify(attributes = BASE_ATTRIBUTES) {
    const sent = callHotjar(['identify', TEST_USER_ID, attributes])
    setIdentified(sent)
    log(`Hotjar Identify ${sent ? 'sent' : 'unavailable'} for synthetic user ${TEST_USER_ID}`)
  }

  function identifyAnonymous() {
    const sent = callHotjar(['identify', null, { plan: 'anonymous-test', language: 'en' }])
    log(`Anonymous Identify ${sent ? 'sent' : 'unavailable'} with non-PII attributes`)
  }

  function sendStateChange() {
    const path = `${window.location.pathname}/manual-hotjar-state`
    const sent = callHotjar(['stateChange', path])
    log(`Hotjar stateChange ${sent ? 'sent' : 'unavailable'}: ${path}`)
  }

  function refreshStorage() {
    setStorage(getStorageState())
    log('Storage capability check refreshed; raw values are intentionally hidden.')
  }

  function openDebugMode() {
    const url = new URL(window.location.href)
    url.searchParams.set('hjDebug', '1')
    window.location.href = url.toString()
  }

  return (
    <>
      <h1>Hotjar Lab</h1>
      <p>
        A focused Hotjar playground for Events, User Attributes, SPA state changes, storage, and
        privacy-safe recording checks. Hotjar is still loaded only by GTM.
      </p>

      <div className="identity-status" aria-live="polite">
        <span>Hotjar API</span>
        <strong>{isHotjarAvailable() ? 'Available' : 'Unavailable or disabled'}</strong>
        <span>Identify</span>
        <strong>{identified ? 'Sent' : 'Not sent'}</strong>
      </div>

      <h2>Events</h2>
      <p>Events have names only. Do not send PII, timestamps, URLs, product SKUs, or detailed logs.</p>
      <input
        value={eventName}
        onChange={(event) => setEventName(event.target.value)}
        aria-label="Hotjar event name"
        placeholder="hotjar_test_started"
      />
      <button type="button" onClick={() => sendEvent()}>Send Hotjar event</button>
      <button type="button" onClick={() => sendEvent('hotjar_checkout_started')}>Checkout outcome event</button>
      <button type="button" onClick={() => sendEvent('hotjar_variant_a_displayed')}>A/B variant event</button>
      <button type="button" onClick={() => sendEvent('hotjar_test_started')}>Duplicate-safe test event</button>

      <h2>Identify and User Attributes</h2>
      <p>
        These are synthetic values. Enable User Attributes for site <code>2866949</code> in Hotjar
        before expecting them in the dashboard.
      </p>
      <button type="button" onClick={() => identify()}>Identify synthetic test user</button>
      <button
        type="button"
        onClick={() => identify({ ...BASE_ATTRIBUTES, plan: 'paid', total_purchases: 84 })}
      >
        Update plan and purchase bucket
      </button>
      <button type="button" onClick={identifyAnonymous}>Identify anonymous test user</button>

      <h2>SPA state change</h2>
      <p>
        Use this control when Hotjar is configured for manual URL tracking. Automatic URL tracking
        may make this call unnecessary; compare the resulting path in Hotjar.
      </p>
      <button type="button" onClick={sendStateChange}>Send manual stateChange</button>

      <h2>Storage and privacy diagnostics</h2>
      <div className="box storage-grid">
        <span>Cookies</span><strong>{storage.cookies ? 'Available' : 'Unavailable'}</strong>
        <span>Local storage</span><strong>{storage.localStorage ? 'Available' : 'Unavailable'}</strong>
        <span>Session storage</span><strong>{storage.sessionStorage ? 'Available' : 'Unavailable'}</strong>
      </div>
      <p>
        Hotjar User IDs are automatic and cannot be read from JavaScript. This page shows capability
        names only and never displays cookie or storage values.
      </p>
      <div className="suppression-grid">
        <div>
          <strong>Control content</strong>
          <p>Visible synthetic text and number 12345.</p>
        </div>
        <div data-hj-suppress>
          <strong>Suppressed content</strong>
          <p>Suppressed text and child number 123456789.</p>
        </div>
      </div>
      <button type="button" onClick={refreshStorage}>Refresh storage checks</button>
      <button type="button" onClick={openDebugMode}>Reload with Hotjar debug mode</button>

      <h2>Documentation-pending tests</h2>
      <p className="notice">
        Consent API arguments and intentionally allowed keystroke configuration are not enabled
        until their current Hotjar documentation is confirmed.
      </p>
      <EventLog entries={entries} />
    </>
  )
}