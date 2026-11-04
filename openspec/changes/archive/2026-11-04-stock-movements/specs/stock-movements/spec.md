# Spec Delta

## Purpose

Lets the shop owner view stock movements and restock products.

## ADDED Requirements

### Requirement: List stock movements
The system SHALL display stock movements with product, movement type, quantity change, resulting stock, and date.

#### Scenario: Stock movements load
- **WHEN** the user navigates to Stock
- **THEN** the system fetches GET /api/stock and displays them

### Requirement: Restock product
The system SHALL allow recording a stock movement via POST /api/stock/movements.

#### Scenario: Restock succeeds
- **WHEN** the user restocks a product with quantity and reason
- **THEN** the system records the movement and updates stock
