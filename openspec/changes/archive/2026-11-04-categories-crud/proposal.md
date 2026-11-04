# Proposal

## Why

Categories organize products. The shop owner needs to manage categories (create, edit, activate/deactivate) so products can be properly categorized. Currently no frontend UI exists for categories management.

## What Changes

- Add Categories list page (GET /api/categories)
- Add Category create form (POST /api/categories) using CreateCategoryDto
- Add Category edit form (PUT /api/categories/{id}) using UpdateCategoryDto
- Add activate/deactivate toggle
- Add routes and navigation
- Keep apiClient.ts, config.ts, types/api.ts untouched

## Capabilities

### New Capabilities

- `categories-management`: Covers listing, creating, editing, and activating/deactivating categories.

### Modified Capabilities

None.

## Impact

- Frontend: frontend/src/pages/CategoriesPage.tsx, frontend/src/pages/CategoryFormPage.tsx, routes in main.tsx, shell/nav updates
- Backend: none
- OpenSpec: change artifacts under openspec/changes/categories-crud/
