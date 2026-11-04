# dashboard-reports Specification

## Purpose
Displays today's sales summary on a dashboard.

## Requirements

### Requirement: Daily sales summary
The system SHALL display today's sales report from GET /api/reports/daily-sales including transaction count, total items sold, total sales, cash total, GCash total.

#### Scenario: Dashboard loads
- **WHEN** the user navigates to Dashboard
- **THEN** the system fetches GET /api/reports/daily-sales and displays summary cards
