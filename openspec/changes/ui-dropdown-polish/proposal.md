## Why

Dropdown options and selected labels are difficult to read across the application. The Tailwind v4 theme is not connected to the shared components, and the current working tree also contains broken product confirmation wiring and build errors.

## What Changes

- Restore semantic theme colors and light/dark consistency; give cards, controls, tables and navigation clear hierarchy, borders and restrained shadows.
- Fix all existing selects: category on product create/edit, product on restock, and POS payment. Preserve values while displaying names, support keyboard selection, visible highlights, wrapping and bounded scrolling.
- Add accessible field labels, explicit loading/empty/error states for asynchronous options, responsive layouts, and consistent navigation/actions across all page components.
- Repair product confirmation wiring and the shared confirmation Cancel behavior; preserve existing confirmation intent and prevent repeat submission.
- Add browser regression tests with clearly identified fixtures and read-only live API checks. Do not mutate the development database during verification.

## Capabilities

### New Capabilities
- `form-controls`: Readable, accessible, theme-aware select controls and explicit confirmation behavior shared by shop forms.
- `application-shell`: Responsive navigation and consistent semantic visual surfaces across the application.

### Modified Capabilities
None. Existing business operations and API contracts remain unchanged; this change repairs their UI integration. Unrelated historical spec/API discrepancies are out of scope.

## Impact

Frontend source, shared UI components, an isolated test harness, and OpenSpec documentation. Playwright is a development-only dependency. No backend, authentication, database schema, or production API changes. Existing uncommitted changes must be preserved.
