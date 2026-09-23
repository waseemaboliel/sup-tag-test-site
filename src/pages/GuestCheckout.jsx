import EventLog, { useEventLog } from '../components/EventLog.jsx'

export default function GuestCheckout() {
  const [entries, log] = useEventLog('Click the button and note that no ec:transaction:* commands fire.')

  function completeGuestCheckout() {
    // Deliberately does NOT call window._uxa.push(['ec:transaction:create', ...]) or ['ec:transaction:send'].
    log(
      'Order "completed" via simulated 3rd-party redirect. No ec:transaction:* commands fired — this is the gap Support sees on real checkout paths like Shop Pay / PayPal redirect.',
    )
  }

  return (
    <>
      <h1>Guest / 3rd-Party Redirect Checkout</h1>
      <p>
        This simulates a checkout path some real customers have (guest checkout, Shop Pay,
        PayPal redirect, etc.) that lands on a confirmation page <strong>without</strong> the
        site ever calling the ecommerce commands itself — reproducing the recurring "some
        checkout paths don't fire the transaction" pattern.
      </p>
      <button onClick={completeGuestCheckout}>Complete guest checkout</button>
      <EventLog entries={entries} />
    </>
  )
}
