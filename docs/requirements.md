# Jeffoy Auto and Motor Shop Management System

## 1. Project Overview

**Project Name:** Jeffoy Auto and Motor Shop Management System

**Project Type:** Web-based inventory and sales management system

**Target Business:** Jeffoy Auto and Motor Shop

The system is designed to help a small auto and motorcycle parts shop manage its product catalog, inventory, sales transactions, and basic sales reports in one application.

The project will replace manual or disconnected inventory and sales tracking with a centralized system that maintains accurate stock quantities and preserves transaction history.

## 2. Project Objectives

The primary objectives are to:

* Maintain an organized catalog of auto and motorcycle parts.
* Track product stock quantities and identify low-stock items.
* Process sales transactions involving multiple products.
* Automatically deduct stock after a successful sale.
* Record restocking and manual stock adjustments.
* Maintain a history of sales and inventory movements.
* Provide daily sales summaries and sales transaction history.
* Preserve historical sale prices when catalog prices change.
* Demonstrate practical full-stack software development skills.

## 3. Target Users

### Shop Staff

The initial version is designed for one shop staff user who can manage products, process sales, monitor inventory, and view reports.

User accounts, authentication, and role-based permissions are outside the initial MVP scope.

## 4. Technology Stack

| Component               | Technology                            |
| ----------------------- | ------------------------------------- |
| Frontend                | React                                 |
| Programming Language    | TypeScript                            |
| Frontend Tooling        | Vite                                  |
| Backend                 | ASP.NET Core Web API                  |
| Backend Language        | C#                                    |
| Database                | PostgreSQL                            |
| ORM                     | Entity Framework Core                 |
| PostgreSQL Provider     | Npgsql.EntityFrameworkCore.PostgreSQL |
| Version Control         | Git and GitHub                        |
| Development Environment | Ubuntu                                |

## 5. Functional Requirements

### FR-01: Product Management

The system shall allow shop staff to:

* Add new products.
* Assign each product a unique SKU.
* Enter the product name, category, cost price, selling price, and opening stock.
* Configure a low-stock threshold.
* Edit product details and prices.
* Activate or deactivate products.
* Search products by SKU or name.

### FR-02: Category Management

The system shall allow shop staff to:

* Create product categories.
* View existing categories.
* Edit category names and descriptions.
* Deactivate categories that are no longer used.

Categories with associated products shall not be deleted if doing so would compromise existing records.

### FR-03: Sales Processing

The system shall allow shop staff to:

* Search and select active products.
* Add multiple products to a sale.
* Enter the quantity for each item.
* Review item subtotals and the total amount.
* Select Cash or GCash as the payment method.
* Complete a sale after server-side validation.

The server shall calculate the authoritative prices and totals rather than trusting values submitted by the frontend.

### FR-04: Stock Validation

The system shall:

* Verify that all products in a sale are active.
* Verify that requested quantities are positive whole numbers.
* Verify that sufficient stock is available for every item.
* Reject the entire sale if any item fails validation.
* Prevent stock from becoming negative.
* Save the sale and deduct inventory atomically.

### FR-05: Inventory Monitoring

The system shall:

* Display current stock quantities.
* Identify low-stock products.
* Allow shop staff to configure low-stock thresholds.
* Record opening stock, sales deductions, restocking, manual adjustments, and sale void reversals.
* Maintain an inventory movement history.

### FR-06: Restocking and Stock Adjustments

The system shall allow shop staff to:

* Increase stock when products are restocked.
* Correct stock quantities through manual adjustments.
* Provide a reason for manual adjustments.
* View the quantity change and timestamp for each movement.

### FR-07: Sales History

The system shall display historical sales with:

* Sale ID.
* Sale date and time.
* Payment method.
* Total amount.
* Sale status.

Shop staff shall be able to view the items, quantities, and prices recorded for a transaction.

### FR-08: Daily Sales Summary

The system shall provide a daily summary containing:

* Total value of completed sales.
* Number of completed sales.
* Recent transactions.
* Current low-stock products.

Voided sales shall be excluded from successful sales totals and transaction counts.

### FR-09: Sale Voiding

The system shall allow shop staff to void an eligible completed sale.

When a sale is voided, the system shall:

* Preserve the original sale and sale items.
* Record the void timestamp and reason.
* Restore the sold quantities to inventory.
* Record the stock restoration in the inventory movement history.
* Prevent the same sale from being voided more than once.

Sale voiding is an internal transaction reversal. Actual payment refunds and payment-provider integration are outside the MVP scope.

## 6. Non-Functional Requirements

### NFR-01: Data Integrity

Sales, sale items, stock deductions, and related inventory movement records must be committed as one database transaction.

### NFR-02: Server-Side Validation

The backend shall validate all business-critical input and calculate sale prices and totals independently of frontend calculations.

### NFR-03: Maintainability

The codebase shall separate frontend, backend, data access, and business logic responsibilities appropriately.

### NFR-04: Data Consistency

The application shall preserve historical sale prices and maintain consistency between product stock balances and inventory movement records.

### NFR-05: Usability

The interface shall provide clear forms, validation messages, search functionality, and readable sales and inventory tables.

### NFR-06: Error Handling

The application shall provide understandable error messages without exposing sensitive implementation details.

### NFR-07: Version Control

Source code and project documentation shall be maintained in GitHub.

## 7. MVP Scope

### Included

* Product and category management.
* Product search.
* Opening stock.
* Sales with multiple line items.
* Cash and GCash payment-method recording.
* Stock validation and automatic deductions.
* Restocking and manual stock adjustments.
* Inventory movement history.
* Sales history and transaction details.
* Daily sales summary.
* Low-stock monitoring.
* Sale voiding and stock restoration.

### Excluded from the Initial Version

* User authentication and role management.
* Multiple branches.
* Customer accounts and credit sales.
* Supplier management and purchase orders.
* Barcode scanning.
* Returns and refund processing.
* Actual payment gateway integration.
* Advanced accounting and financial reporting.
* Automated purchase recommendations.
* Mobile applications.

## 8. Project Success Criteria

The MVP will be considered successful when:

1. Shop staff can create, edit, search, and deactivate products.
2. A sale can contain multiple products and quantities.
3. The backend validates available stock before completing a sale.
4. A successful sale records its items and reduces stock correctly.
5. An invalid sale does not create partial records or deductions.
6. Restocking and manual adjustments are recorded in the movement history.
7. A voided sale restores stock exactly once.
8. Historical sale prices remain unchanged after product prices are edited.
9. Daily reports exclude voided sales.
10. The application can be run locally using the documented setup instructions.

## 9. Development Approach

The project will be developed incrementally:

1. Finalize requirements and database design.
2. Set up the repository and development environment.
3. Create the PostgreSQL database and EF Core entities.
4. Implement category and product management.
5. Implement inventory movements and stock monitoring.
6. Implement sales processing and stock validation.
7. Implement sales history and daily summaries.
8. Implement sale voiding.
9. Connect the React frontend to the API.
10. Test, document, and prepare the project for demonstration.

## 10. Future Improvements

Potential future improvements include authentication, role-based access, supplier and purchasing modules, barcode support, customer records, automated backups, deployment, and expanded reporting.
