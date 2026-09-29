import { useState } from 'react'
import EventLog, { useEventLog } from '../components/EventLog.jsx'

const TEST_ATTRIBUTES = {
  plan: 'trial',
  role: 'support-test',
  language: 'en',
  widgets_opt_out: false,
}

function hotjarCall(command) {
  if (typeof window.hj !== 'function') return false
  window.hj(...command)
  return true
}

export default function SurveyTargeting() {
  const [entries, log] = useEventLog('Choose an Identify or Event test, then verify the matching Survey in Hotjar.')
  const [variant, setVariant] = useState('a')

  function identifyThenEvent(eventName) {
    const identified = hotjarCall(['identify', 'test-survey-user', TEST_ATTRIBUTES])
    const eventSent = hotjarCall(['event', eventName])
    log(`Identify ${identified ? 'sent' : 'unavailable'} before Event ${eventSent ? 'sent' : 'unavailable'}: ${eventName}`)
  }

  function changeVariant(value) {
    setVariant(value)
    const url = new URL(window.location.href)
    url.searchParams.set('variant', value)
    window.history.pushState({}, '', url)
    identifyThenEvent(`hotjar_variant_${value}_displayed`)
  }

  return (
    <>
      <h1>Survey Targeting</h1>
      <p>
        This page provides stable URL, Event, and User Attribute values for a dashboard-configured
        Hotjar Survey. The page does not create or configure a Survey.
      </p>

      <div className="identity-status" aria-live="polite">
        <span>Route</span><code>{window.location.pathname}</code>
        <span>Variant</span><strong>{variant}</strong>
      </div>

      <h2>URL targeting fixtures</h2>
      <p>Use these URLs when configuring Simple, Exact, Contains, or Regex rules in Hotjar.</p>
      <ul>
        <li><code>/survey-targeting</code> — simple path match</li>
        <li><code>/survey-targeting?variant=a</code> — query-string variant</li>
        <li><code>/survey-targeting?variant=b#experiment</code> — query and fragment</li>
      </ul>
      <button type="button" onClick={() => changeVariant('a')}>Show variant A</button>
      <button type="button" onClick={() => changeVariant('b')}>Show variant B</button>

      <h2>Identify and Event targeting</h2>
      <p>
        The controls send Identify first, then the Event, matching Hotjar&apos;s targeting order. Use
        <code>plan=trial</code>, <code>role=support-test</code>, and
        <code>hotjar_checkout_started</code> in the dashboard rule.
      </p>
      <button type="button" onClick={() => identifyThenEvent('hotjar_checkout_started')}>Trigger checkout Survey event</button>
      <button type="button" onClick={() => identifyThenEvent('hotjar_test_completed')}>Trigger completion Survey event</button>

      <h2>Dashboard setup reminder</h2>
      <p className="notice">
        Configure the Survey in Hotjar first. Test Popover, Button, Bubble, Embedded, Full Screen,
        and Link formats separately; Link Survey responses use another domain and cannot connect to
        Recordings from this site.
      </p>
      <EventLog entries={entries} />
    </>
  )
}