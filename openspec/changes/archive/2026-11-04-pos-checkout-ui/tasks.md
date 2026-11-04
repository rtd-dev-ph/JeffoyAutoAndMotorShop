# Tasks

## 1. Scaffold frontend tooling

- [x] 1.1 Install deps: react-router-dom, tailwindcss, @tailwindcss/vite, clsx, tailwind-merge, class-variance-authority, lucide-react and verify `npm install` completes without errors
- [x] 1.2 Configure Vite + Tailwind (tailwind config, vite plugin, CSS entry) and verify `npm run dev` starts on `http://localhost:5173`
- [x] 1.3 Initialize shadcn/ui (components.json + utils) and verify button/card/dialog components scaffold under `frontend/src/components/ui/`
- [x] 1.4 Add react-router-dom routes in main.tsx (POS route `/`, receipt route `/receipt`) and verify app renders without routing errors

## 2. Layout + shell

- [x] 2.1 Create shell layout (sidebar/nav + main outlet) with Tailwind and verify navigation persists across route changes
- [x] 2.2 Replace health-check App content with routed shell while keeping `/health/database` check working

## 3. POS page

- [x] 3.1 Build product search input calling GET /api/products via existing apiClient, render result list with SKU/name/price and verify against running backend
- [x] 3.2 Build cart component: add item, adjust quantity, remove item, compute grand total from line totals and verify totals match product prices
- [x] 3.3 Build payment method selector (Cash / GCash) using CheckoutDto { items[], paymentMethod } shape and verify selection is captured
- [x] 3.4 Wire checkout button to POST /api/sales/checkout via apiClient, handle CheckoutResponseDto { saleId, saleNumber, grandTotal, paymentMethod, createdAtUtc, items[] } and verify a real checkout returns a sale number
- [x] 3.5 Add error handling for empty cart and API errors (ApiError from apiClient), verify error message displays instead of receipt

## 4. Receipt view

- [x] 4.1 Build receipt page rendering CheckoutResponseDto (saleNumber, grandTotal, paymentMethod, createdAtUtc, item list) as printable layout and verify it displays a completed sale's data
- [x] 4.2 Link receipt from POS checkout success (redirect or route with saleId) and verify receipt opens after checkout

## 5. Test against real API

- [x] 5.1 Run backend (`dotnet run`) and frontend (`npm run dev`) together, perform an end-to-end checkout (search → add → pay → checkout → receipt) and verify sale completes against the live API

## Workflow follow-up

- Archive the change after implementation is complete and reviewed.
- Verify the archived result.
