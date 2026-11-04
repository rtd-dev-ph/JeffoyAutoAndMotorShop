# Proposal

## Why

Cashiers and owners need to view past sales and void completed sales when necessary (returns/errors). The backend has GET /api/sales, GET /api/sales/{id}, and POST /api/sales/{id}/void already implemented.

## What Changes

- Add Sales History page listing sales (date, sale number, total, payment method, status)
- Add Sale detail view
- Add void sale action with reason using POST /api/sales/{id}/void
- Add routes and navigation
- Keep apiClient.ts, config.ts, types/api.ts untouched

## Capabilities

### New Capabilities

- `sales-history`: Covers listing sales, viewing details, and voiding completed sales.

### Modified Capabilities

None.

## Impact

- Frontend: frontend/src/pages/SalesPage.tsx, frontend/src/pages/SaleDetailPage.tsx, routes, nav
- Backend: none
- OpenSpec: openspec/changes/sales-history/
