# OpenSpec Instructions (El Decano Cobranzas)

Instructions for AI coding assistants using OpenSpec for spec-driven development.

## TL;DR Quick Checklist
- Search existing work: `openspec spec list --long`, `openspec list` (use `rg` only for full-text search)
- Decide scope: new capability vs modify existing capability
- Pick a unique `change-id`: kebab-case, verb-led (`add-`, `update-`, `remove-`, `refactor-`)
- Scaffold: `proposal.md`, `tasks.md`, `design.md` (only if needed), and delta specs per affected capability
- **MANDATORY**: Requirements MUST use normative language (**SHALL** or **MUST**) and include at least one **#### Scenario:** header.
- Validate: `openspec validate [change-id] --strict` and fix issues

## Three-Stage Workflow

### Stage 1: Creating Changes
Create proposal when you need to:
- Add features or functionality
- Refactor existing code (to ensure behavior preservation)
- Make breaking changes (schema, API)
- Architecture or pattern shifts

### Stage 2: Implementing Changes
Track these steps as TODOs in `tasks.md`:
1. Read `proposal.md`, `design.md` (if exists), and `tasks.md`.
2. Implement tasks sequentially.
3. Confirm completion. Update checklist.

### Stage 3: Archiving Changes
After deployment, archive the change:
- `openspec archive <change-id>`
- Move `changes/[name]/` → `changes/archive/YYYY-MM-DD-[name]/`
- Update `specs/` with the new truth.

## Spec File Format
Every requirement MUST have at least one scenario using `#### Scenario: Name` format.

## Directory Structure
```
openspec/
├── project.md              # Project conventions
├── specs/                  # Current truth - what IS built
├── changes/                # Proposals - what SHOULD change
│   └── [change-name]/
│       ├── proposal.md     # Why, what, impact
│       ├── tasks.md        # Implementation checklist
│       ├── specs/          # Delta changes
│   └── archive/            # Completed changes
```
