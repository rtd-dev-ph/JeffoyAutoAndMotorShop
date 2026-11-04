# Proposal

## Why

Owner needs a dashboard showing today's sales summary for quick overview. Backend has GET /api/reports/daily-sales returning DailySalesReportDto.

## What Changes

- Add Dashboard/Reports page showing today's sales summary (transactions, items sold, totals by payment method)
- Add route and navigation
- Keep apiClient.ts, config.ts, types/api.ts untouched

## Capabilities

### New Capabilities

- `dashboard-reports`: Covers displaying daily sales summary.

### Modified Capabilities

None.

## Impact

- Frontend: frontend/src/pages/DashboardPage.tsx, routes, nav
- Backend: none
- OpenSpec: openspec/changes/dashboard-reports/
