import { useEffect, useRef, useState } from 'react'
import EventLog, { useEventLog } from '../components/EventLog.jsx'

const BATCH_SIZE = 12
const PRODUCT_IMAGES = [
    'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=640&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68d407e8e1?auto=format&fit=crop&w=640&q=80',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=640&q=80',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=640&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=640&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=640&q=80',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=640&q=80',
    'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=640&q=80',
    'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=640&q=80',
    'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=640&q=80&sat=-20',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=640&q=80',
    'https://images.unsplash.com/photo-1496217590455-aa63a8350eea?auto=format&fit=crop&w=640&q=80',
]

const CATEGORIES = ['Outerwear', 'Knitwear', 'Essentials', 'Accessories']
const PRODUCT_NAMES = ['Studio Jacket', 'Soft Structure Knit', 'Everyday Trouser', 'Canvas Tote', 'Relaxed Overshirt', 'Ribbed Layer', 'Travel Coat', 'Utility Shirt']

function productFor(index) {
    return {
        id: index + 1,
        image: PRODUCT_IMAGES[index % PRODUCT_IMAGES.length],
        name: PRODUCT_NAMES[index % PRODUCT_NAMES.length],
        category: CATEGORIES[index % CATEGORIES.length],
        price: 48 + ((index * 17) % 9) * 10,
        rating: (4 + (index % 10) / 10).toFixed(1),
        reviews: 12 + ((index * 31) % 280),
        badge: index % 7 === 0 ? 'Best seller' : index % 5 === 0 ? 'New' : '',
    }
}

export default function InfiniteScroll() {
    const [visibleCount, setVisibleCount] = useState(BATCH_SIZE)
    const [entries, log] = useEventLog('Scroll or load more products to append new content.')
    const sentinelRef = useRef(null)
    const loadingRef = useRef(false)

    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel) return undefined

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !loadingRef.current) {
                    loadingRef.current = true
                    observer.unobserve(sentinel)
                    setVisibleCount((count) => count + BATCH_SIZE)
                    log('Infinite scroll appended a product batch')
                }
            },
            { rootMargin: '240px' },
        )
        observer.observe(sentinel)
        loadingRef.current = false
        return () => observer.disconnect()
    }, [log, visibleCount])

    function recordProductClick(index) {
        const eventName = 'plp_product_selected'
        if (typeof window.hj === 'function') window.hj('event', eventName)
        if (window.heap) window.heap.track('PLP Product Selected', { position: index + 1 })
        window._uxa = window._uxa || []
        window._uxa.push(['trackDynamicVariable', { key: 'plpProductPosition', value: index + 1 }])
        log(`Product ${index + 1} interaction sent to available vendor queues`)
    }

    function loadMore() {
        setVisibleCount((count) => count + BATCH_SIZE)
        log('Manual load more appended a product batch')
    }

    return (
        <>
            <h1>Infinite-scroll PLP</h1>
            <p>
                A product-listing-style surface that appends new cards as you scroll. Use the tag switcher
                to compare all vendors or isolate Contentsquare, Heap, or Hotjar.
            </p>
            <div className="identity-status" aria-live="polite">
                <span>Products rendered</span>
                <strong>{visibleCount} loaded</strong>
                <span>Loading</span>
                <strong>Always available</strong>
            </div>
            <div className="product-grid">
                {Array.from({ length: visibleCount }, (_, index) => {
                    const product = productFor(index)
                    return <article className="product-card" key={product.id}>
                        <div className="product-image-wrap">
                            <img src={product.image} alt={`${product.name}, ${product.category}`} loading="lazy" />
                            {product.badge && <span className="product-badge">{product.badge}</span>}
                            <button type="button" className="quick-view" onClick={() => recordProductClick(index)}>Quick view</button>
                        </div>
                        <div>
                            <small>{product.category}</small>
                            <strong>{product.name}</strong>
                            <p className="product-rating">★ {product.rating} <span>({product.reviews})</span></p>
                            <p className="product-price">${product.price}.00</p>
                            <button type="button" onClick={() => recordProductClick(index)}>
                                Add to bag
                            </button>
                        </div>
                    </article>
                })}
            </div>
            <div ref={sentinelRef} className="scroll-sentinel" aria-hidden="true" />
            <button type="button" onClick={loadMore}>Load more products</button>
            <p className="notice">This feed is intentionally unbounded. Keep scrolling to create a long session with continuously appended content.</p>
            <EventLog entries={entries} />
        </>
    )
}