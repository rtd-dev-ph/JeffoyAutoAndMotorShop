# Tasks

## 1. Routes + navigation

- [ ] 1.1 Add routes for products list, create, edit in main.tsx and verify navigation works
- [ ] 1.2 Add Products link to shell navigation

## 2. Products list page

- [ ] 2.1 Build ProductsPage listing products from GET /api/products in a table (SKU, name, category, price, stock, low stock, active)
- [ ] 2.2 Add Create Product button linking to /products/new
- [ ] 2.3 Add Edit button per row linking to /products/:id

## 3. Product create form

- [ ] 3.1 Build ProductFormPage for create mode (POST /api/products with CreateProductDto)
- [ ] 3.2 Load categories from GET /api/categories for category dropdown
- [ ] 3.3 Handle validation/errors and navigate back to list on success

## 4. Product edit form + deactivate

- [ ] 4.1 Support edit mode (PUT /api/products/{id} with UpdateProductDto)
- [ ] 4.2 Add deactivate/reactivate toggle (PUT with isActive)
- [ ] 4.3 Test create/edit/deactivate against running API

## 5. Final verification

- [ ] 5.1 Run `npx tsc --noEmit` and verify no errors
- [ ] 5.2 Manual test: create product, edit product, deactivate/reactivate

## Workflow follow-up

- Archive the change after implementation and testing complete.
- Verify the archived result.
