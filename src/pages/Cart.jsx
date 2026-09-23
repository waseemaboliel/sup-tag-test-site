import { useState } from 'react'
import { Link } from 'react-router-dom'
import EventLog, { useEventLog } from '../components/EventLog.jsx'

const PRICES = { A: 19.99, B: 9.99, C: 29.99 }

export default function Cart() {
  const [qty, setQty] = useState({ A: 1, B: 2, C: 1 })
  const [entries, log] = useEventLog('Update quantities or click a button to see what fired.')

  const total = (qty.A * PRICES.A + qty.B * PRICES.B + qty.C * PRICES.C).toFixed(2)
  const count = qty.A + qty.B + qty.C

  function updateQty(key, value) {
    setQty((prev) => ({ ...prev, [key]: Number(value) || 0 }))
  }

  function pushCartDvars() {
    window._uxa = window._uxa || []
    window._uxa.push(['trackDynamicVariable', { key: 'cartValue', value: Number(total) }])
    window._uxa.push(['trackDynamicVariable', { key: 'cartItemsNb', value: count }])
    log(`Pushed dvars: cartValue=${total}, cartItemsNb=${count}`)
  }

  return (
    <>
      <h1>Cart</h1>
      <p>
        Adjust the quantities below, then click a button to push the cart totals as
        Contentsquare dynamic variables, or proceed to checkout.
      </p>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Test Product A</td>
            <td>$19.99</td>
            <td>
              <input type="number" min="0" value={qty.A} onChange={(e) => updateQty('A', e.target.value)} />
            </td>
          </tr>
          <tr>
            <td>Test Product B</td>
            <td>$9.99</td>
            <td>
              <input type="number" min="0" value={qty.B} onChange={(e) => updateQty('B', e.target.value)} />
            </td>
          </tr>
          <tr>
            <td>Test Product C</td>
            <td>$29.99</td>
            <td>
              <input type="number" min="0" value={qty.C} onChange={(e) => updateQty('C', e.target.value)} />
            </td>
          </tr>
        </tbody>
      </table>

      <p>
        <strong>Cart total:</strong> ${total} ({count} items)
      </p>

      <button onClick={pushCartDvars}>Push cart dvars (cartValue / cartItemsNb)</button>
      <Link to="/checkout">
        <button>Proceed to checkout</button>
      </Link>

      <EventLog entries={entries} />
    </>
  )
}
