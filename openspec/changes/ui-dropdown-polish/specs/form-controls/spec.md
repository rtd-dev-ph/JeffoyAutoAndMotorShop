## ADDED Requirements

### Requirement: Readable select options
The system SHALL render select menus with opaque theme-aware backgrounds, readable text, visible pointer/keyboard highlights and a distinct selected indicator.

#### Scenario: Select is opened in either theme
- **WHEN** a user opens the category, restock product, or payment select in light or dark mode
- **THEN** its options are readable above page content and its highlighted and selected states are visible

### Requirement: Selected option labels
The system SHALL display the option label instead of the stored identifier, including asynchronously loaded edit values, and SHALL show a placeholder when no value is selected.

#### Scenario: Existing category loads
- **WHEN** an existing product and its category options finish loading
- **THEN** the category trigger displays the category name without requiring the menu to be opened

#### Scenario: Selection changes
- **WHEN** an option is chosen using a pointer or keyboard
- **THEN** the menu closes and the trigger displays that option's label while the form retains the correct value

### Requirement: Bounded accessible selects
The system SHALL associate each select with an accessible field label and keep all options reachable within the viewport through wrapping and vertical scrolling.

#### Scenario: Long option list on a small screen
- **WHEN** the user opens a long option list on a narrow viewport
- **THEN** the page does not gain horizontal overflow, long option labels can be read, and the final option can be reached with keyboard navigation

### Requirement: Asynchronous option states
The system SHALL distinguish loading, empty, failed and ready option states and SHALL prevent invalid submissions while required options are unavailable.

#### Scenario: Options fail or are empty
- **WHEN** the options API fails or returns no available records
- **THEN** the form explains the state rather than presenting a blank working select

### Requirement: Explicit form confirmation
The system SHALL connect product/category save actions to a confirmation dialog, allow cancellation without a write, and prevent repeated confirmation while a write is pending.

#### Scenario: Cancel confirmation
- **WHEN** the user cancels a save confirmation
- **THEN** the dialog closes, the form values remain, and no API write occurs

#### Scenario: Confirm product save
- **WHEN** the user confirms a valid product save
- **THEN** exactly one request is made with the selected category identifier and navigation occurs only after success
