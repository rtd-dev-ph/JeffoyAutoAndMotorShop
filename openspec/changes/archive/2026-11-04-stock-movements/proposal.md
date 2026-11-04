# Proposal

## Why

Stock movements track inventory changes (opening stock, restock, adjustments). The shop owner needs to view stock history and restock products from the frontend. Backend has GET /api/stock and POST /api/stock/movements already implemented.

## What Changes

- Add Stock Movements page listing stock history (product, type, quantity change, resulting stock)
- Add Restock form to record new stock movement
- Add routes and navigation
- Keep apiClient.ts, config.ts, types/api.ts untouched

## Capabilities

### New Capabilities

- `stock-movements`: Covers listing stock movements and recording restocks.

### Modified Capabilities

None.

## Impact

- Frontend: frontend/src/pages/StockPage.tsx, frontend/src/pages/RestockPage.tsx, routes, nav
- Backend: none
- OpenSpec: openspec/changes/stock-movements/
