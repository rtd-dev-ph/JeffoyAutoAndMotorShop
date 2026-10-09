# Jeffoy Auto and Motor Shop Management System — Database Design

## 1. Overview

**Database:** PostgreSQL

**ORM:** Entity Framework Core

**Provider:** Npgsql.EntityFrameworkCore.PostgreSQL

**Database Purpose:** Store product catalog information, inventory balances, sales transactions, and stock movement history.

The database design prioritizes data integrity, transaction consistency, and preservation of historical records.

## 2. Design Principles

* Use primary keys to identify records.
* Use foreign keys to maintain valid relationships.
* Use unique constraints to prevent duplicate SKUs and category names.
* Use database transactions for stock-changing operations.
* Preserve historical sale prices and costs.
* Store timestamps using PostgreSQL `timestamp with time zone` (`timestamptz`).
* Store monetary amounts using `numeric(18,2)`.
* Use integer quantities because the shop sells whole units in the MVP.
* Deactivate products and categories instead of deleting records that have historical dependencies.
* Maintain an inventory movement ledger for stock changes.

## 3. Database Tables

The initial database contains six tables:

1. Categories
2. Products
3. Sales
4. SaleItems
5. StockMovements

These are five tables, not six. The MVP does not require a separate Payments table because each sale records one payment method.

## 4. Table: Categories

Stores the available product categories.

| Column      | PostgreSQL Type | Constraints                     |
| ----------- | --------------- | ------------------------------- |
| CategoryId  | integer         | Primary key, generated identity |
| Name        | varchar(100)    | Required, unique                |
| Description | varchar(250)    | Nullable                        |
| IsActive    | boolean         | Required, default true          |

### Rules

* Category names must be unique after trimming and case normalization.
* New products may only reference active categories.
* Categories with associated products should be deactivated rather than deleted.

## 5. Table: Products

Stores product details and the current inventory balance.

| Column            | PostgreSQL Type | Constraints                      |
| ----------------- | --------------- | -------------------------------- |
| ProductId         | integer         | Primary key, generated identity  |
| SKU               | varchar(50)     | Required, unique                 |
| Name              | varchar(150)    | Required                         |
| CategoryId        | integer         | Required, foreign key            |
| CostPrice         | numeric(18,2)   | Required, nonnegative            |
| SellingPrice      | numeric(18,2)   | Required, greater than zero      |
| StockQuantity     | integer         | Required, default 0, nonnegative |
| LowStockThreshold | integer         | Required, default 5, nonnegative |
| IsActive          | boolean         | Required, default true           |
| CreatedAt         | timestamptz     | Required                         |
| UpdatedAt         | timestamptz     | Nullable                         |

### Rules

* SKU values are trimmed and normalized consistently before storage. The database enforces uniqueness.
* Product names are required.
* Cost price cannot be negative.
* Selling price must be greater than zero.
* Stock quantity and low-stock threshold cannot be negative.
* CategoryId must reference an existing category.
* Products with historical sales must not be hard-deleted.
* CreatedAt and UpdatedAt are stored in UTC.
* StockQuantity represents the current balance and is updated in the same transaction as its associated stock movement.

### Low-Stock Logic

A product is low stock when:

`StockQuantity <= LowStockThreshold`

## 6. Table: Sales

Stores the overall details of each sale.

| Column        | PostgreSQL Type | Constraints                     |
| ------------- | --------------- | ------------------------------- |
| SaleId        | integer         | Primary key, generated identity |
| SaleDate      | timestamptz     | Required                        |
| PaymentMethod | varchar(20)     | Required                        |
| Status        | varchar(20)     | Required                        |
| TotalAmount   | numeric(18,2)   | Required, nonnegative           |
| VoidedAt      | timestamptz     | Nullable                        |
| VoidReason    | varchar(250)    | Nullable                        |

### Allowed Values

PaymentMethod:

* Cash
* GCash

Status:

* Completed
* Voided

### Rules

* SaleDate records the sale timestamp in UTC.
* TotalAmount is calculated by the backend and saved.
* Only completed sales contribute to daily sales totals and transaction counts.
* Voided sales remain in the database for historical reference.
* VoidedAt and VoidReason are populated when a sale is voided.
* A voided sale cannot be voided again.

## 7. Table: SaleItems

Stores the individual products included in each sale.

| Column     | PostgreSQL Type | Constraints                     |
| ---------- | --------------- | ------------------------------- |
| SaleItemId | integer         | Primary key, generated identity |
| SaleId     | integer         | Required, foreign key           |
| ProductId  | integer         | Required, foreign key           |
| Quantity   | integer         | Required, greater than zero     |
| UnitPrice  | numeric(18,2)   | Required, greater than zero     |
| UnitCost   | numeric(18,2)   | Required, nonnegative           |

### Rules

* Each sale item belongs to one sale.
* Each sale item references one product.
* Quantity must be a positive whole number.
* UnitPrice stores the selling price at the time of sale.
* UnitCost stores the product cost at the time of sale.
* Historical prices and costs must not change when the product catalog is updated.
* The item subtotal is calculated as Quantity multiplied by UnitPrice.

### Sale Total Calculation

The backend calculates the sale total as:

`TotalAmount = SUM(Quantity * UnitPrice)`

The calculation uses decimal arithmetic. The client-submitted total is never authoritative.

## 8. Table: StockMovements

Stores an audit trail of changes to product stock.

| Column          | PostgreSQL Type | Constraints                     |
| --------------- | --------------- | ------------------------------- |
| StockMovementId | integer         | Primary key, generated identity |
| ProductId       | integer         | Required, foreign key           |
| SaleId          | integer         | Nullable, foreign key           |
| SaleItemId      | integer         | Nullable, foreign key           |
| MovementType    | varchar(30)     | Required                        |
| QuantityChange  | integer         | Required, nonzero               |
| Reason          | varchar(250)    | Nullable                        |
| CreatedAt       | timestamptz     | Required                        |

### Allowed Movement Types

* OpeningStock
* Sale
* Restock
* Adjustment
* SaleVoid

### Quantity Change Convention

* Positive value: stock added.
* Negative value: stock deducted.

Examples:

| Event                             | Movement Type | Quantity Change |
| --------------------------------- | ------------- | --------------: |
| Product created with 20 units     | OpeningStock  |             +20 |
| Sale of 3 units                   | Sale          |              -3 |
| Restock of 10 units               | Restock       |             +10 |
| Stock correction removing 2 units | Adjustment    |              -2 |
| Voiding a sale of 3 units         | SaleVoid      |              +3 |

### Rules

* Every stock-changing operation must create a movement record.
* Stock balance updates and movement inserts must occur in the same transaction.
* Sale movements may reference the corresponding SaleId and SaleItemId.
* SaleVoid movements reference the voided SaleId and may reference the original SaleItemId.
* Opening stock is recorded when the product is created with an initial quantity greater than zero.
* Opening stock must not be added to the product balance a second time.
* Movement history must be retained for audit purposes.

## 9. Relationships

### Categories and Products

* One category can contain many products.
* Each product belongs to one category.
* Relationship: one-to-many.

### Sales and SaleItems

* One sale contains one or more sale items.
* Each sale item belongs to one sale.
* Relationship: one-to-many.

### Products and SaleItems

* One product can appear in many sale items.
* Each sale item references one product.
* Relationship: one-to-many.

### Products and StockMovements

* One product can have many stock movements.
* Each movement references one product.
* Relationship: one-to-many.

### Sales and StockMovements

* One sale can be associated with multiple stock movements.
* A movement may reference a sale or have no associated sale.
* Relationship: one-to-many, with a nullable SaleId.

### Relationship Summary

* Categories → Products
* Sales → SaleItems
* Products → SaleItems
* Products → StockMovements
* Sales → StockMovements

## 10. Constraints and Indexes

### Unique Constraints

* Products.SKU must be unique.
* Categories.Name must be unique.

Normalize SKU and category names consistently before saving. If database-level case-insensitive uniqueness is required, implement appropriate unique indexes using PostgreSQL expressions or normalized columns.

### Check Constraints

Recommended constraints include:

* Products.CostPrice >= 0
* Products.SellingPrice > 0
* Products.StockQuantity >= 0
* Products.LowStockThreshold >= 0
* SaleItems.Quantity > 0
* SaleItems.UnitPrice > 0
* SaleItems.UnitCost >= 0
* StockMovements.QuantityChange <> 0
* Sales.TotalAmount >= 0
* Sales.PaymentMethod is Cash or GCash
* Sales.Status is Completed or Voided
* StockMovements.MovementType is an allowed value

Also validate the consistency of sale void metadata.

### Recommended Indexes

| Table          | Index                | Purpose                                       |
| -------------- | -------------------- | --------------------------------------------- |
| Products       | Unique SKU index     | Find products by SKU and enforce uniqueness   |
| Products       | Name index           | Support product name lookup                   |
| Products       | CategoryId, IsActive | Filter products by category and active status |
| Sales          | SaleDate, Status     | Support date-based reports                    |
| SaleItems      | SaleId               | Retrieve items for a sale                     |
| StockMovements | ProductId, CreatedAt | Retrieve product movement history             |

A basic name index may not accelerate substring searches such as `contains`. If product search becomes slow, evaluate PostgreSQL trigram indexes or other appropriate search indexes.

### Foreign Key Delete Behavior

Configure restrictive delete behavior for records with historical dependencies.

Do not cascade-delete sales, sale items, or stock movement history when deleting or deactivating a product.

## 11. Transaction and Inventory Integrity

### Opening Stock

When creating a product with opening stock:

1. Validate the product details.
2. Insert the product with its initial StockQuantity.
3. Insert an OpeningStock movement if the initial quantity is greater than zero.
4. Commit the operation as one transaction.

The movement records the initial quantity but does not independently increment the balance again.

### Completing a Sale

1. Receive the product IDs and quantities from the frontend.
2. Validate the request and payment method.
3. Begin a database transaction.
4. Read and validate the current products and prices.
5. Protect the stock deduction against concurrent checkout requests.
6. Reject the sale if any product is inactive or has insufficient stock.
7. Create the sale and sale items with historical price and cost snapshots.
8. Deduct stock and insert the corresponding Sale movements.
9. Commit the transaction.

If any operation fails, roll back the entire transaction.

The stock protection must be enforced by the database operation or concurrency strategy, not solely by an earlier stock check. For example, a conditional stock update can deduct stock only when the available balance is sufficient, with the affected-row count checked before proceeding.

### Restocking and Adjustments

1. Validate the product and quantity change.
2. Begin a transaction.
3. Update the product stock balance.
4. Insert the appropriate Restock or Adjustment movement.
5. Commit the transaction.

An adjustment that would produce negative stock must be rejected.

### Voiding a Sale

1. Begin a transaction.
2. Verify that the sale is still Completed.
3. Restore the original sale-item quantities to stock.
4. Insert the corresponding SaleVoid movements.
5. Update the sale status, void timestamp, and reason.
6. Commit the transaction.

The operation must be concurrency-safe. Repeated or simultaneous void requests must not restore stock more than once.

## 12. Daily Sales Reporting

Store transaction timestamps in UTC.

For daily reports, convert the selected calendar day's boundaries in the Asia/Manila timezone to UTC, then query the interval using an inclusive start and exclusive end.

Include only sales with Completed status.

Calculate:

* Total sales: sum of TotalAmount for completed sales in the selected day.
* Transaction count: count of completed sales in the selected day.
* Recent sales: latest transactions, with status displayed.
* Low-stock products: products whose stock quantity is less than or equal to their configured threshold.

Do not use current product prices to reconstruct historical sale totals.

## 13. Entity Framework Core Implementation Notes

* Define one entity class for each of the six tables described in this document's overview, using the five tables listed above.
* Use Fluent API configurations for relationships, constraints, precision, and delete behavior.
* Configure PostgreSQL-compatible column types and identity generation.
* Use EF Core migrations to create and update the database schema.
* Keep business-critical validation in the backend service layer.
* Use database transactions and appropriate concurrency protection for checkout and sale voiding.
* Avoid duplicating business logic between controllers and frontend components.

## 14. Implementation Order

1. Configure the PostgreSQL connection.
2. Create Category and Product entities.
3. Configure their relationships and constraints.
4. Create the first EF Core migration.
5. Implement category management.
6. Implement product management and opening stock.
7. Add Sales and SaleItems.
8. Add StockMovements.
9. Implement transactional checkout.
10. Implement restocking, adjustments, and sale voiding.
11. Implement sales history and daily reports.
12. Test constraints, rollback behavior, and concurrent stock operations.

## 15. Future Database Improvements

Possible future additions include:

* Users and roles.
* Suppliers and purchase orders.
* Customers and credit accounts.
* Payment records for split payments.
* Returns and refund records.
* Branches and branch-specific inventory.
* Audit records for changes to sensitive product and transaction fields.
