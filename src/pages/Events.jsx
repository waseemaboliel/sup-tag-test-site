import EventLog, { useEventLog } from '../components/EventLog.jsx'

export default function Events() {
  const [entries, log] = useEventLog('Click a button to see what fired.')

  function setDvar() {
    window._uxa = window._uxa || []
    window._uxa.push(['trackDynamicVariable', { key: 'testDvar', value: 'hello-world' }])
    log('CS dynamic variable set: testDvar = hello-world')
  }

  function trackManualPageview() {
    window._uxa = window._uxa || []
    window._uxa.push(['trackPageview', 'events-manual'])
    log('CS manual pageview: events-manual')
  }

  function fireHeapEvent() {
    if (window.heap) {
      window.heap.track('Test Event', { source: 'sup-tag-test-site' })
      log('Heap custom event: Test Event')
    } else {
      log('heap not loaded yet')
    }
  }

  function pushDataLayer() {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: 'test_custom_event' })
    log('GTM dataLayer push: test_custom_event')
  }

  return (
    <>
      <h1>Fire Events</h1>
      <p>
        Buttons below trigger custom Contentsquare and Heap calls directly, and a raw GTM
        dataLayer push, for testing.
      </p>
      <button onClick={setDvar}>Set Contentsquare dynamic variable</button>
      <button onClick={trackManualPageview}>Track manual Contentsquare pageview</button>
      <button onClick={fireHeapEvent}>Fire Heap custom event</button>
      <button onClick={pushDataLayer}>Push GTM dataLayer event</button>
      <EventLog entries={entries} />
    </>
  )
}
