import { useCallback, useState } from 'react'

// Shared "click a button, see what fired" log used by Events/Cart/Checkout/GuestCheckout —
// ported from the identical inline <div id="log"> + log() pattern every static page used to repeat.
export function useEventLog(initialMessage) {
  const [entries, setEntries] = useState(initialMessage ? [initialMessage] : [])

  const log = useCallback((msg) => {
    const time = new Date().toLocaleTimeString()
    setEntries((prev) => [`[${time}] ${msg}`, ...prev])
  }, [])

  return [entries, log]
}

export default function EventLog({ entries }) {
  return <div className="log">{entries.join('\n')}</div>
}
