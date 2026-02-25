# Capability: Advertising Management

## Purpose
Manage the club's advertising signage, contracts, and advertisers.

## Requirements

### Requirement: Advertising Panel Management
The system SHALL allow for the visualisation of each advertising panel's status.

#### Scenario: Visualisation of panel status
- **GIVEN** a set of panels in Supabase
- **WHEN** the user accesses the Advertising module
- **THEN** a grid SHALL be displayed showing the current status of each panel (Available, Occupied, Expired).

---

### Requirement: 1.5 Panel Rule
The system SHALL restrict the association of panels that already have a special size of 1.5.

#### Scenario: Attempting association with 1.5 panel
- **GIVEN** a panel with a special number (1.5 panel)
- **WHEN** the user attempts to associate it with another panel
- **THEN** the system SHALL prevent the action
- **AND** display an error message indicating that it already has a special size.
