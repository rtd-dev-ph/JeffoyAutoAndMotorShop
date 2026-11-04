# Design

## Context

Frontend now has shell + routing (POS + Receipt). Existing apiClient.ts, config.ts, types/api.ts untouched. DTOs CreateProductDto and UpdateProductDto already defined in types/api.ts. Categories available via GET /api/categories for product form dropdown.

See proposal.md for motivation and specs/products-management/spec.md for requirements.

## Goals / Non-Goals

**Goals:**
- Products list page with table showing key fields
- Create product form
- Edit product form
- Deactivate/reactivate toggle

**Non-Goals:**
- Bulk operations
- Product image uploads
- Stock movement UI (separate future slice)

## Decisions

- **Table + form pages** — Products list at `/products`, create at `/products/new`, edit at `/products/:id`
- **Reuse existing apiClient and DTO types** — POST/PUT to existing endpoints
- **Category dropdown** — load categories for create/edit forms
- **Toggle active status** — use PUT with isActive to deactivate/reactivate

## Risks / Trade-offs

- [Category required for create] → Load categories in form; show error if none
- [PUT requires full UpdateProductDto] → Form must include all required fields (sku, name, categoryId, costPrice, sellingPrice, lowStockThreshold, isActive)

## Open Questions

None.
