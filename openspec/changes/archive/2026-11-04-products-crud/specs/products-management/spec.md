# Spec Delta

## Purpose

Lets the shop owner manage the product catalog: list products with details and stock status, create new products with category/price/stock, edit existing product details, and deactivate/reactivate products.

## ADDED Requirements

### Requirement: List products
The system SHALL display all products with SKU, name, category, cost/selling price, stock quantity, low-stock status, and active status.

#### Scenario: Products list loads
- **WHEN** the user navigates to the Products page
- **THEN** the system fetches GET /api/products and displays them in a table

### Requirement: Create product
The system SHALL allow creating a product via POST /api/products using CreateProductDto (sku, name, description, categoryId, costPrice, sellingPrice, openingStock, lowStockThreshold, openingStockReason).

#### Scenario: Create product succeeds
- **WHEN** the user fills the create form with valid data and submits
- **THEN** the system posts to POST /api/products and shows the new product in the list

#### Scenario: Create product validation error
- **WHEN** the user submits invalid data
- **THEN** the system displays API validation errors

### Requirement: Edit product
The system SHALL allow editing a product via PUT /api/products/{id} using UpdateProductDto (sku, name, description, categoryId, costPrice, sellingPrice, lowStockThreshold, isActive).

#### Scenario: Edit product succeeds
- **WHEN** the user edits an existing product and saves
- **THEN** the system puts to PUT /api/products/{id} and updates the product in the list

### Requirement: Deactivate/reactivate product
The system SHALL allow toggling a product's active status.

#### Scenario: Deactivate product
- **WHEN** the user deactivates a product
- **THEN** the system updates the product with isActive false and reflects the status in the list
