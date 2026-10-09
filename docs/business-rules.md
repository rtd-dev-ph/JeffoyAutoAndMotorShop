# Jeffoy Auto and Motor Shop Management System — Business Rules

## Purpose

This document defines the business rules that govern products, sales, inventory, and reporting.

Business-critical rules must be enforced by the backend and, where appropriate, reinforced by database constraints.

## 1. Product Rules

### BR-01: Required Product Information

Every product must have a SKU, name, category, cost price, selling price, and low-stock threshold.

### BR-02: Unique SKU

Each product SKU must be unique, ignoring case and leading or trailing whitespace after normalization.

### BR-03: Valid Prices

* Cost price must be greater than or equal to zero.
* Selling price must be greater than zero.
* Prices must use decimal precision suitable for Philippine peso amounts.
* Floating-point arithmetic must not be used for financial calculations.

### BR-04: Valid Stock Quantities

Stock quantities and low-stock thresholds must be nonnegative whole numbers.

### BR-05: Product Deactivation

Products with sales history must be deactivated rather than deleted. Inactive products cannot be added to new sales.

### BR-06: Historical Price Preservation

Changing a product's current cost or selling price must not alter the prices already saved in historical sale items.

## 2. Category Rules

### BR-07: Unique Category Name

Category names must be unique after trimming and case normalization.

### BR-08: Category Availability

New products can only be assigned to active categories. Existing products and historical transactions must remain reviewable if a category is later deactivated.

## 3. Sales Rules

### BR-09: At Least One Item

A sale must contain at least one sale item.

### BR-10: Valid Sale Items

Every sale item must reference an existing active product and have a positive whole-number quantity.

### BR-11: Server-Calculated Prices and Totals

The backend must retrieve authoritative product prices and calculate item subtotals and the sale total. Frontend-supplied prices and totals must not be trusted.

### BR-12: Stock Availability

The requested quantity of every product must be available when checkout is processed.

### BR-13: No Negative Stock

A sale must not cause any product's stock quantity to become negative.

### BR-14: Atomic Sale Processing

Saving a sale, saving its items, deducting stock, and recording related stock movements must occur within one database transaction.

If any operation fails, the entire transaction must be rolled back.

### BR-15: Sale Identification and Timestamp

Each sale must receive a unique identifier and a recorded timestamp. Timestamps are stored in UTC.

### BR-16: Payment Method

The MVP supports one recorded payment method per sale: Cash or GCash.

This records the selected method; it does not verify or process payments through an external provider.

### BR-17: Historical Sale Snapshots

Each sale item must preserve the unit selling price and unit cost used when the sale was completed.

The sale total must remain stored for historical reference and be consistent with its saved line items.

### BR-18: Concurrent Checkout Safety

The backend must protect stock balances against concurrent sales. Stock availability must be checked as part of a concurrency-safe database transaction, not only when products are added to the cart.

## 4. Inventory Rules

### BR-19: Opening Stock

When a product is created, its initial stock balance must be recorded consistently with an OpeningStock movement.

The opening-stock movement must not be counted a second time in the current stock balance.

### BR-20: Restocking

Restocking must use a positive whole-number quantity. The product's stock balance and its Restock movement must be saved atomically.

### BR-21: Manual Stock Adjustments

Every manual adjustment must record its quantity change, timestamp, and reason. An adjustment must not result in negative stock.

### BR-22: Inventory Movement History

Every stock-changing event must create an inventory movement record:

* OpeningStock: initial inventory.
* Sale: inventory deducted for a completed sale.
* Restock: inventory added from replenishment.
* Adjustment: manual inventory correction.
* SaleVoid: inventory restored after a sale is voided.

Quantity changes are signed integers: positive values add stock, and negative values subtract stock.

Movement history must not be deleted as a routine way to correct inventory.

### BR-23: Current Stock Balance

The product's stored stock quantity represents its current balance. Every operation that changes this balance must also create the corresponding movement record within the same transaction.

The balance must remain consistent with the opening balance and subsequent movements.

### BR-24: Low-Stock Detection

A product is considered low stock when:

`StockQuantity <= LowStockThreshold`

A product with zero stock must also be identifiable as out of stock.

## 5. Sale Voiding Rules

### BR-25: Eligible Sales

Only sales with Completed status may be voided.

### BR-26: Void Reason

A void operation must include a reason and record the void timestamp.

### BR-27: Single Void Operation

A sale may be voided only once. Repeated requests must not restore stock again.

### BR-28: Atomic Void Processing

Changing the sale status, restoring the stock quantities, and inserting SaleVoid movements must occur in one transaction.

If any operation fails, the entire void operation must be rolled back.

### BR-29: Preserve Transaction History

Voiding a sale must not delete its sale record, sale items, or original Sale movements.

The system must retain the original transaction for audit purposes.

### BR-30: Void Is Not a Payment Refund

Voiding a sale reverses the application's transaction and stock effects. Actual cash refunds, GCash refunds, and payment-provider integration are outside the MVP scope.

## 6. Reporting Rules

### BR-31: Daily Sales Total

The daily sales total must sum the saved totals of sales with Completed status for the selected calendar day in the Asia/Manila timezone.

### BR-32: Daily Transaction Count

The daily transaction count must include only sales with Completed status for the selected shop-local day.

### BR-33: Historical Reporting

Historical reports must use saved sale and sale-item values, not current product catalog prices.

### BR-34: Voided Sales

Voided sales must remain visible in transaction history but must be excluded from completed-sales totals and counts.

## 7. General Data Integrity Rules

### BR-35: Restrict Deletion of Historical Records

Products, sales, sale items, and inventory movements must not be hard-deleted when doing so would compromise transaction history.

### BR-36: Database Constraints

Where practical, database constraints must enforce valid quantities, prices, required fields, unique values, and permitted status or payment-method values.

### BR-37: Server-Side Enforcement

The backend must enforce business rules even if requests are sent directly to the API without using the React interface.
