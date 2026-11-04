# Spec Delta

## Purpose

Lets the shop owner manage categories: list all categories, create new categories, edit category details, and activate/deactivate categories.

## ADDED Requirements

### Requirement: List categories
The system SHALL display all categories with name, description, and active status.

#### Scenario: Categories list loads
- **WHEN** the user navigates to the Categories page
- **THEN** the system fetches GET /api/categories and displays them in a table

### Requirement: Create category
The system SHALL allow creating a category via POST /api/categories using CreateCategoryDto (name, description).

#### Scenario: Create category succeeds
- **WHEN** the user fills the create form and submits
- **THEN** the system posts to POST /api/categories and shows the new category in the list

### Requirement: Edit category
The system SHALL allow editing a category via PUT /api/categories/{id} using UpdateCategoryDto (name, description).

#### Scenario: Edit category succeeds
- **WHEN** the user edits and saves
- **THEN** the system updates the category via PUT and reflects changes

### Requirement: Activate/deactivate category
The system SHALL allow toggling a category's active status.

#### Scenario: Toggle category status
- **WHEN** the user toggles active status
- **THEN** the system updates the category and reflects the status
