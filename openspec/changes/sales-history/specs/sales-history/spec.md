# Spec Delta

## Purpose

Lets users view past sales, view sale details, and void completed sales with a reason.

## ADDED Requirements

### Requirement: List sales
The system SHALL display past sales with sale number, date, total, payment method, and status.

#### Scenario: Sales list loads
- **WHEN** the user navigates to Sales History
- **THEN** the system fetches GET /api/sales and displays them in a table

### Requirement: View sale detail
The system SHALL display sale items for a selected sale.

#### Scenario: View sale detail
- **WHEN** the user clicks a sale
- **THEN** the system fetches GET /api/sales/{id} and shows items

### Requirement: Void sale
The system SHALL allow voiding a completed sale with a reason via POST /api/sales/{id}/void.

#### Scenario: Void sale succeeds
- **WHEN** the user enters a void reason and confirms
- **THEN** the system voids the sale and updates its status
