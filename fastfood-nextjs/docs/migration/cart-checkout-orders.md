# Cart, Checkout, Orders Migration Notes

## Cart
- Rendering strategy: CSR
- Fetching strategy: browser fetch -> Next API proxy -> existing backend
- Why this strategy: the cart is user/session dependent and needs immediate client-side interaction for quantity updates and item removal.
- Flow: Browser -> `/api/proxy/cart/:userId` -> backend cart controller -> MySQL
- Network tab: shows a browser request to Next first, then a proxied backend call from the server route.
- SEO: not important for a private authenticated page.
- Hydration: the page hydrates as a client component; the cart state is loaded after mount via `useEffect`.
- Migration changes from React: preserved item cards, totals, empty state, and quantity controls; only the fetch URLs changed.

## Checkout
- Rendering strategy: CSR
- Fetching strategy: browser fetch -> Next API proxy -> backend order creation; external geocode fetch remains browser-side.
- Why this strategy: checkout is interactive, session-aware, and depends on live form state, address selection, and map clicks.
- Flow: Browser -> `/api/proxy/cart/:userId` -> `/api/proxy/orders` -> backend order controller -> MySQL
- Network tab: cart load and order creation are visible as browser requests to Next API routes; map geocoding remains an external browser request.
- SEO: not important for checkout.
- Hydration: the map picker and form controls hydrate on the client; this avoids SSR issues with Leaflet.
- Migration changes from React: preserved address selectors, map picker, validation, and redirect to the payment handoff page.

## Orders
- Rendering strategy: CSR
- Fetching strategy: browser fetch -> Next API proxy -> existing backend, including delivery progress polling.
- Why this strategy: order history and delivery tracking are user-specific and heavily interactive.
- Flow: Browser -> `/api/proxy/orders/user/:id` and `/api/proxy/delivery/progress/:orderId` -> backend -> MySQL
- Network tab: the order list loads from a browser call to the Next API route; the popup polls the proxied delivery progress route repeatedly.
- SEO: not important for authenticated order history.
- Hydration: the page and the map popup are client-only because they depend on localStorage and Leaflet.
- Migration changes from React: preserved the table, status icons, and delivery map popup; only the fetch layer moved behind the proxy.

## Payment handoff
- Rendering strategy: CSR
- Fetching strategy: browser fetch -> Next API proxy -> backend order detail
- Why this strategy: the existing app shows a payment demo page after checkout; we keep that flow but source the order data through the proxy when available.
- Flow: Browser -> `/api/proxy/orders/:id/detail` -> backend -> MySQL
- Network tab: order details are fetched after navigation to the payment page.
- SEO: not relevant.
- Hydration: client-only page because it reads query params and optionally fetches live order data.
- Migration changes from React: preserved the QR/payment layout and added optional live order detail loading.
