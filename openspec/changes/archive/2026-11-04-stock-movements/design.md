# Design

## Context

Reuse existing patterns. apiClient untouched. Backend: GET /api/stock, POST /api/stock/movements (likely CreateStockMovementDto with productId, movementType, quantityChange, reason).

## Goals / Non-Goals

**Goals:**
- Stock movements list
- Restock form

**Non-Goals:**
- Adjustment types beyond restock

## Decisions

- Routes: /stock, /stock/restock
- Simple form for restock

## Risks / Trade-offs

- Need to verify CreateStockMovementDto shape from backend

## Open Questions

None.
