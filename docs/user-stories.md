# Jeffoy Auto and Motor Shop Management System — User Stories

## Purpose

This document defines the user stories and acceptance criteria for the initial MVP.

Stories should be implemented incrementally and verified against their acceptance criteria before being considered complete.

## US-01: Add Product

**User Story**

As a shop staff member, I want to add a product so that I can maintain an accurate catalog of items available for sale.

**Acceptance Criteria**

* The system accepts a product SKU, name, category, cost price, selling price, opening stock, and low-stock threshold.
* Required fields must be provided.
* The SKU must be unique.
* Cost price cannot be negative.
* Selling price must be greater than zero.
* Opening stock and low-stock threshold must be nonnegative whole numbers.
* The selected category must exist and be active.
* The product and its opening-stock movement are saved successfully.
* If opening stock is greater than zero, exactly one opening-stock movement is recorded for that quantity.
* Invalid input is rejected with a meaningful error message.

## US-02: Search Products

**User Story**

As a shop staff member, I want to search for products by SKU or name so that I can find items quickly.

**Acceptance Criteria**

* The system supports searching by SKU or product name.
* Matching products display their SKU, name, category, selling price, and stock quantity.
* Inactive products are excluded from normal sales selection.
* The product-management screen can still display inactive products when needed.
* An empty search displays the appropriate product list.
* A search with no matches displays a helpful empty state.

## US-03: Edit Product

**User Story**

As a shop staff member, I want to edit product details so that the catalog remains accurate as prices and information change.

**Acceptance Criteria**

* The system allows editing eligible product details.
* The SKU must remain unique.
* Prices and stock thresholds must satisfy validation rules.
* Editing the selling price does not change the price of previously recorded sales.
* Editing the cost price does not change previously recorded sale-item cost snapshots.
* The update timestamp is maintained.
* Products with historical transactions are deactivated instead of deleted.

## US-04: Build a Sale

**User Story**

As a shop staff member, I want to add multiple products to a sale so that I can process a customer's purchase in one transaction.

**Acceptance Criteria**

* The user can search and select active products.
* The user can add multiple products to the cart.
* The user can change item quantities or remove items before checkout.
* Quantities must be positive whole numbers.
* The system displays item subtotals and a cart total.
* The server recalculates authoritative prices and totals during checkout.
* An empty cart cannot be checked out.

## US-05: Validate Stock

**User Story**

As a shop staff member, I want the system to verify stock availability so that I cannot complete a sale that exceeds available inventory.

**Acceptance Criteria**

* Every sale item must reference an existing active product.
* Requested quantities must be positive whole numbers.
* The backend checks current stock at checkout.
* If any item has insufficient stock, the entire sale is rejected.
* Rejected sales do not create partial sale records or stock deductions.
* Concurrent checkout requests must not cause overselling.
* The user receives an understandable validation message.

## US-06: Complete Sale

**User Story**

As a shop staff member, I want to complete a validated sale so that the transaction is recorded and inventory is updated automatically.

**Acceptance Criteria**

* A sale must contain at least one valid item.
* The user selects Cash or GCash as the payment method.
* The server calculates each item subtotal and the total amount.
* The system assigns a unique sale ID and records the sale timestamp.
* The system saves the sale, sale items, stock deductions, and stock movement records atomically.
* The sale-item unit price and unit cost are saved as historical snapshots.
* Product stock decreases by the sold quantities.
* If the transaction fails, all changes are rolled back.
* A completed sale appears in sales history and contributes to the daily summary.

## US-07: Monitor Inventory

**User Story**

As a shop staff member, I want to view stock levels and low-stock products so that I can identify items that may need replenishment.

**Acceptance Criteria**

* The inventory screen displays each product's current stock quantity.
* The system identifies a product as low stock when its stock quantity is less than or equal to its configured threshold.
* Products with zero stock are clearly identifiable.
* The user can search and filter the inventory list.
* The user can view inventory movement history for a product.
* Inactive products remain available for historical review.

## US-08: Restock Products

**User Story**

As a shop staff member, I want to record restocking so that inventory reflects newly received products.

**Acceptance Criteria**

* The user selects an existing product.
* The user enters a positive whole-number quantity.
* The user may enter a restocking note or reason.
* The system increases the product's stock quantity.
* A Restock movement records the positive quantity change and timestamp.
* The stock update and movement record are saved atomically.
* Invalid quantities are rejected.

## US-09: View Sales History

**User Story**

As a shop staff member, I want to view previous sales so that I can review transactions and their details.

**Acceptance Criteria**

* The system lists sales with their ID, timestamp, payment method, total, and status.
* The user can open a transaction to view its line items.
* Each line item shows the recorded product, quantity, unit price, and subtotal.
* Historical prices come from saved sale-item records rather than current catalog prices.
* Voided transactions remain visible and clearly marked as voided.
* The user can identify when a sale was voided.

## US-10: Daily Sales Summary

**User Story**

As a shop staff member, I want to view a daily sales summary so that I can monitor the shop's sales activity.

**Acceptance Criteria**

* The dashboard displays the total value of completed sales for the selected shop-local day.
* The dashboard displays the number of completed sales.
* Voided sales are excluded from both figures.
* The dashboard displays recent transactions.
* The dashboard displays low-stock products.
* The day is interpreted using the shop's configured timezone, initially Asia/Manila.
* Daily figures are based on saved transaction values and statuses.

## US-11: Adjust Stock

**User Story**

As a shop staff member, I want to correct a product's stock quantity when a discrepancy is found so that the system reflects the actual inventory.

**Acceptance Criteria**

* The user selects an existing product.
* The adjustment records a signed quantity change and a reason.
* The adjustment cannot result in negative stock.
* The system updates the current stock balance.
* The system records an Adjustment movement with a timestamp.
* The stock update and movement record are saved atomically.
* The movement history preserves the adjustment for future review.

## US-12: Void a Sale

**User Story**

As a shop staff member, I want to void an incorrectly recorded sale so that inventory can be restored without deleting transaction history.

**Acceptance Criteria**

* Only a sale with Completed status can be voided.
* A reason must be provided.
* The system changes the sale status to Voided and records the void timestamp and reason.
* The system restores the quantities sold for each sale item.
* The system records corresponding SaleVoid inventory movements.
* The status change, stock restoration, and movement records are committed atomically.
* A sale cannot be voided more than once.
* The original sale and its items remain available for audit.
* The voided sale no longer contributes to successful daily sales totals or counts.

## Definition of Done

A story is complete when:

* The acceptance criteria have been implemented.
* Server-side validation is in place where applicable.
* Database changes preserve data integrity.
* Relevant tests pass.
* Errors are handled appropriately.
* The code has been committed to Git.
* The corresponding Trello card has been moved to Done after verification.
