# Spec Delta

## Purpose

Lets a cashier ring up a sale at the point of sale: search products, build a cart, select Cash or GCash payment, submit checkout, and receive a receipt — all backed by the existing API.

## ADDED Requirements

### Requirement: Search products
The system SHALL let the cashier search products by name or SKU and return matching results.

#### Scenario: Product found by name
- **WHEN** the cashier types a product name into the search field
- **THEN** the system displays matching products from GET /api/products

#### Scenario: Product found by SKU
- **WHEN** the cashier types a product SKU into the search field
- **THEN** the system displays matching products from GET /api/products

### Requirement: Add item to cart
The system SHALL let the cashier add a searched product to the cart with a quantity.

#### Scenario: Add product to empty cart
- **WHEN** the cashier selects a product and sets a quantity
- **THEN** the system adds the item to the cart with the product name, unit price, and line total

### Requirement: Review cart
The system SHALL display cart items with quantities, unit prices, line totals, and a grand total, and let the cashier adjust quantities or remove items.

#### Scenario: Cart shows grand total
- **WHEN** items are in the cart
- **THEN** the system shows the sum of line totals as the grand total

### Requirement: Select payment method
The system SHALL let the cashier select Cash or GCash as the payment method before checkout.

#### Scenario: Payment method selected
- **WHEN** the cashier chooses Cash or GCash
- **THEN** the system stores that payment method for the checkout request

### Requirement: Submit checkout
The system SHALL POST the cart and payment method to POST /api/sales/checkout and show the result.

#### Scenario: Successful checkout
- **WHEN** the cashier submits a non-empty cart with a payment method
- **THEN** the system sends CheckoutDto to POST /api/sales/checkout and displays CheckoutResponseDto (saleId, saleNumber, grandTotal, paymentMethod, items)

#### Scenario: Checkout validation error
- **WHEN** the cart is empty or the API rejects the request
- **THEN** the system shows an error message instead of a receipt

### Requirement: View receipt
The system SHALL render a receipt view from the CheckoutResponseDto after a successful checkout.

#### Scenario: Receipt shows sale details
- **WHEN** checkout succeeds
- **THEN** the system displays saleNumber, grandTotal, paymentMethod, createdAtUtc, and the item list as a printable receipt
