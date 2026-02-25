# Capability: Accounting Module

## Purpose
Manage the club's financial movements, separating income and expenditure by categories.

## Requirements

### Requirement: Accounting Movement Recording
The system SHALL allow the recording of income and expenditure by specifying the amount, date, and category.

#### Scenario: Painting expenditure entry
- **GIVEN** an expenditure category "Signboard Painting"
- **WHEN** the user records an expense of $10,000
- **THEN** a record SHALL be created in `accounting_movements`
- **AND** the total balance SHALL be updated.

---

### Requirement: Differentiation of Expenditure Groups
The system SHALL allow for the grouping of accounting movements into groups (Members vs Advertising).

#### Scenario: Filtering by group
- **GIVEN** a list of accounting movements
- **WHEN** the user filters by "Advertising"
- **THEN** only movements with `expense_group` set to `advertising` SHALL be shown.
