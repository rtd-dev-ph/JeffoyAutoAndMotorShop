# Proposal

## Why

Products are the core catalog for the shop. Currently there is no UI to manage them — cashiers can search them for POS, but the shop owner cannot create, edit, or deactivate products from the frontend. We need a Products CRUD screen so the owner can manage SKUs, pricing, categories, stock, and low-stock thresholds.

## What Changes

- Add Products list page (GET /api/products) with search/filter and status indicators
- Add Product create form (POST /api/products) using CreateProductDto
- Add Product edit form (PUT /api/products/{id}) using UpdateProductDto
- Add product deactivate/activate action (PUT /api/products/{id} with isActive=false/true)
- Add routes for products management
- Keep apiClient.ts, config.ts, types/api.ts untouched (reuse as-is)

## Capabilities

### New Capabilities

- `products-management`: Covers listing, creating, editing, and deactivating products. Each capability path becomes specs/products-management/spec.md.

### Modified Capabilities

None — no existing specs for products management yet.

## Impact

- Frontend: frontend/src/pages/ProductsPage.tsx, frontend/src/pages/ProductFormPage.tsx, routes in main.tsx, shell/nav updates
- Backend: none (consumes existing endpoints only)
- OpenSpec: change artifacts under openspec/changes/products-crud/
