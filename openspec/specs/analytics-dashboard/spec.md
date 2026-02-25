# Capability: Analytics Dashboard

## Purpose
Visualise the club's general status, including collection and finance metrics.

## Requirements

### Requirement: Collection Metrics Visualisation
The system SHALL display charts showing the monthly collection evolution.

#### Scenario: Collection chart loaded
- **GIVEN** recorded payment data
- **WHEN** the user accesses the Dashboard
- **THEN** a bar chart (Recharts) SHALL be loaded showing the total collection per month.

---

### Requirement: Daily Financial Summary
The system SHALL display a summary of the day's income and expenditure.

#### Scenario: Daily balance visualisation
- **GIVEN** accounting movements recorded for today
- **WHEN** the user accesses the Dashboard
- **THEN** the consolidated total income and total expenditure SHALL be displayed.
