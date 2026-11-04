# Proposal

## Why

The Jeffoy Auto and Motor Shop backend is complete, but the frontend only has a health-check UI. Cashiers cannot ring up a sale yet — there is no product search, cart, or checkout screen. The POS checkout is the most valuable screen for the MVP: it lets a cashier search products, add them to a cart, select Cash or GCash payment, and complete a sale against the real API.

## What Changes

- Add layout + routing scaffold to the React frontend (Tailwind CSS + shadcn/ui).
- Add POS page: product search (GET /api/products), cart with quantity selector, payment method selector (Cash / GCash).
- Add checkout action calling POST /api/sales/checkout with CheckoutDto.
- Add receipt view rendering CheckoutResponseDto.
- Keep apiClient.ts, config.ts, types/api.ts untouched (reuse as-is).

## Capabilities

### New Capabilities

- `pos-checkout`: Covers creating a sale at the point of sale — search products, build a cart, select payment method, submit checkout, and view a printed receipt. Each capability path becomes specs/pos-checkout/spec.md.

### Modified Capabilities

None — no existing specs in this project yet.

## Impact

- Frontend: frontend/src/ (App.tsx, routes, components), package.json (new deps), vite config (API proxy), Tailwind/shadcn setup.
- Backend: none (consumes existing endpoints only).
- OpenSpec: change artifacts under openspec/changes/pos-checkout-ui/.
