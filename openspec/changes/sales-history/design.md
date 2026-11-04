# Design

## Context

Reuse patterns from POS/Products/Categories slices. apiClient.ts untouched. Backend endpoints: GET /api/sales, GET /api/sales/{id}, POST /api/sales/{id}/void with VoidSaleDto { reason }.

## Goals / Non-Goals

**Goals:**
- Sales list table
- Sale detail view
- Void sale with reason

**Non-Goals:**
- Export/print sales report
- Filtering by date range

## Decisions

- Routes: /sales, /sales/:id
- Void via POST /api/sales/{id}/void with VoidSaleDto
- Keep it simple

## Risks / Trade-offs

- Backend void endpoint may not exist yet — verify before implementing void

## Open Questions

None.
