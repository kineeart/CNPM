# CSR to CSR + API Proxy Conversion Guide

## Pattern
- Before: React page calls the backend directly with `axios`/`fetch`.
- After: client page calls `/api/proxy/...` and the Next.js route handler forwards the request to the backend.

## Example: Login / Cart / Orders

### Before
```jsx
const res = await axios.get(`${BACKEND_URL}/cart/${userId}`);
```

### After
```tsx
const response = await fetch(`/api/proxy/cart/${userId}`, { cache: "no-store" });
```

## Behavior differences
- Browser tab: now shows a request to Next.js first.
- Server logs: the Next API route becomes the gateway.
- Rendering: stays CSR, so the UI still hydrates in the browser.
- Backend contract: unchanged; the same routes and payloads are forwarded.

## Affected files
- `app/api/proxy/[...path]/route.ts`
- `app/page.tsx`
- `app/register/page.tsx`
- `app/cart/page.tsx`
- `app/checkout/page.tsx`
- `app/my-orders/page.tsx`
- `app/zalopay-test/page.tsx`

## When to use this pattern
- Use it when the page is session-dependent, form-heavy, or interactive.
- Keep it for auth, cart, checkout, orders, and admin views.
- Move to SSR later only for content where SEO or server-first HTML matters.

## Hydration note
- Keep the page as a client component when it depends on `localStorage`, map libraries, or client state.
- This avoids SSR/client mismatches and keeps the original interaction model.
