## ADDED Requirements

### Requirement: Consistent semantic surfaces
The system SHALL use consistent theme-aware colors, typography, borders, and control treatments on every existing page, including login, forms, lists, POS, dashboard, reports, receipts and sale details.

#### Scenario: User changes theme
- **WHEN** the user switches between light and dark themes
- **THEN** page surfaces, controls and floating menus remain readable and the choice is retained

### Requirement: Responsive navigation and content
The system SHALL keep navigation and page actions usable on phone, tablet and desktop widths, indicate the current section, and contain wide tables within their own scroll area.

#### Scenario: Narrow viewport
- **WHEN** the app is viewed at a phone or tablet width
- **THEN** navigation is accessible through a labeled menu, form fields and toolbars fit, and the document does not overflow horizontally

#### Scenario: Receipt navigation
- **WHEN** the user chooses New Sale or Back to POS from a receipt
- **THEN** the app navigates to `/pos` without a full document reload

### Requirement: Preserve empty dashboard context
The system SHALL retain all dashboard summary cards with muted zero values when the selected day has no sales.

#### Scenario: Empty day
- **WHEN** a report has zero transactions and zero items sold
- **THEN** all five summary cards remain visible and the recent-sales area explains how to populate the report
