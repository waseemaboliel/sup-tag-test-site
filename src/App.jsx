import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import PageTwo from './pages/PageTwo.jsx'
import Events from './pages/Events.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import GuestCheckout from './pages/GuestCheckout.jsx'

// HashRouter (not BrowserRouter): GitHub Pages serves static files with no
// server-side rewrite rules, so a hard refresh on a deep BrowserRouter path
// like /cart would 404. Hash-based routes avoid that entirely.
export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/page-two" element={<PageTwo />} />
          <Route path="/events" element={<Events />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/guest-checkout" element={<GuestCheckout />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}
