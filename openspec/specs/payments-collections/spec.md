# Capability: Payments & Collections

## Purpose
Manage membership fee collections and generate payment receipts.

## Requirements

### Requirement: Membership Fee Payment Recording
The system SHALL allow for the collection of a monthly membership fee for a specific member.

#### Scenario: Successful fee payment
- **GIVEN** an active member with outstanding fees
- **WHEN** the user records the payment for a specific month
- **THEN** a record SHALL be created in `member_payments`
- **AND** a consecutive receipt number SHALL be generated.

---

### Requirement: HTML Receipt Issuance/Printing
The system SHALL generate a print-ready receipt view.

#### Scenario: Receipt printing
- **GIVEN** a recorded payment
- **WHEN** the user requests the receipt
- **THEN** the system SHALL open a window with the receipt's HTML format
- **AND** SHALL trigger the browser's print dialogue.
