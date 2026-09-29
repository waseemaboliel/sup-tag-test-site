import { useEffect, useRef, useState } from 'react'
import EventLog, { useEventLog } from '../components/EventLog.jsx'

const BATCH_SIZE = 8
const MAX_PRODUCTS = 40

function productImage(index) {
    const color = ['#dce8ff', '#f2e6c9', '#d9efe6', '#f5d9df'][index % 4]
    const label = `Product ${index + 1}`
    return `data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="220"><rect width="320" height="220" fill="${color}"/><circle cx="160" cy="95" r="54" fill="#ffffff" fill-opacity=".75"/><text x="160" y="175" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#1c2128">${label}</text></svg>`,
    )}`
}

export default function InfiniteScroll() {
    const [visibleCount, setVisibleCount] = useState(BATCH_SIZE)
    const [entries, log] = useEventLog('Scroll or load more products to append new content.')
    const sentinelRef = useRef(null)
    const hasMore = visibleCount < MAX_PRODUCTS

    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel) return undefined

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && visibleCount < MAX_PRODUCTS) {
                    setVisibleCount((count) => Math.min(count + BATCH_SIZE, MAX_PRODUCTS))
                    log('Infinite scroll appended a product batch')
                }
            },
            { rootMargin: '240px' },
        )
        observer.observe(sentinel)
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
        if (!hasMore) return
        setVisibleCount((count) => Math.min(count + BATCH_SIZE, MAX_PRODUCTS))
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
                <strong>{visibleCount} / {MAX_PRODUCTS}</strong>
                <span>Loading</span>
                <strong>{hasMore ? 'On scroll' : 'Complete'}</strong>
            </div>
            <div className="product-grid">
                {Array.from({ length: visibleCount }, (_, index) => (
                    <article className="product-card" key={index}>
                        <img src={productImage(index)} alt={`Synthetic product ${index + 1}`} loading="lazy" />
                        <div>
                            <strong>Product {index + 1}</strong>
                            <p>{index % 2 === 0 ? 'New arrival' : 'Limited test collection'}</p>
                            <button type="button" onClick={() => recordProductClick(index)}>
                                Select product
                            </button>
                        </div>
                    </article>
                ))}
            </div>
            <div ref={sentinelRef} className="scroll-sentinel" aria-hidden="true" />
            {hasMore && <button type="button" onClick={loadMore}>Load more products</button>}
            {!hasMore && <p className="notice">All synthetic products are rendered. Scroll back through appended content to compare replay behavior.</p>}
            <EventLog entries={entries} />
        </>
    )
}