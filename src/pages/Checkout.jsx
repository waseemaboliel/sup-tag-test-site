import { Link } from 'react-router-dom'
import EventLog, { useEventLog } from '../components/EventLog.jsx'

export default function Checkout() {
  const [entries, log] = useEventLog('Click a button to see what fired.')

  function placeOrder(id, revenue, currency) {
    window._uxa = window._uxa || []
    const payload = { revenue }
    if (id) payload.id = id
    if (currency) payload.currency = currency
    window._uxa.push(['ec:transaction:create', payload])
    window._uxa.push(['ec:transaction:send'])
    log(
      `Fired ec:transaction:create + ec:transaction:send | ${id ? 'id=' + id : 'NO id'} revenue=${revenue}${
        currency ? ' currency=' + currency : ' NO currency'
      }`,
    )
  }

  return (
    <>
      <h1>Checkout</h1>
      <p>
        Buttons below fire the documented Contentsquare ecommerce commands (
        <code>ec:transaction:create</code> + <code>ec:transaction:send</code>) in different ways,
        to test transaction tracking edge cases.
      </p>

      <button onClick={() => placeOrder('test-txn-1', 69.97, 'USD')}>
        Place order (standard, id=test-txn-1, $69.97 USD)
      </button>
      <button onClick={() => placeOrder(null, 69.97, 'USD')}>
        Place order (anonymous, no transaction id)
      </button>
      <button onClick={() => placeOrder('test-txn-1', 69.97, 'USD')}>
        Replay same order (duplicate id=test-txn-1) — tests duplicate/inflated revenue
      </button>
      <button onClick={() => placeOrder('test-txn-2', 69.97, null)}>
        Place order (id=test-txn-2, missing currency)
      </button>

      <div className="box">
        Want to test the gap where a checkout path <em>never</em> fires the transaction at all?{' '}
        <Link to="/guest-checkout">Try the guest / 3rd-party redirect checkout &rarr;</Link>
      </div>

      <EventLog entries={entries} />
    </>
  )
}
