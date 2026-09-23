import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import PageTwo from './pages/PageTwo.jsx'
import Events from './pages/Events.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import GuestCheckout from './pages/GuestCheckout.jsx'

// BrowserRouter (not HashRouter): gives clean URLs like /cart?tags=all instead of
// /?tags=all#/cart. GitHub Pages has no server-side rewrites, so a hard refresh or direct
// link to a deep path like /cart would normally 404 — public/404.html + the redirect-restore
// script at the top of index.html (the standard github.com/rafgraph/spa-github-pages trick)
// handle that instead. basename comes from Vite's BASE_URL so it always matches vite.config.js.
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
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
    </BrowserRouter>
  )
}
