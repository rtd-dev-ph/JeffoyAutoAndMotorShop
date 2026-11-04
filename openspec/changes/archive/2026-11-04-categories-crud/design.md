# Design

## Context

Reuse existing patterns from POS and Products CRUD. apiClient.ts, types/api.ts untouched. Backend endpoints: GET/POST/PUT /api/categories.

## Goals / Non-Goals

**Goals:**
- Categories list, create, edit, toggle active

**Non-Goals:**
- Bulk operations

## Decisions

- Routes: /categories, /categories/new, /categories/:id
- Use PUT to toggle isActive
- Keep forms simple

## Risks / Trade-offs

- API may not support toggling isActive directly; if needed use PUT with full UpdateCategoryDto

## Open Questions

None.
