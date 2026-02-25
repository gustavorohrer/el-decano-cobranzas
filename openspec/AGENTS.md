# OpenSpec Instructions (El Decano Cobranzas)

Instructions for AI coding assistants using OpenSpec for spec-driven development.

**New Feature?** See our detailed **[SDD Step-by-Step Guide](../docs/workflows/sdd-step-by-step.md)** for a practical workflow in environments without Linear or CI/CD.

## TL;DR Quick Checklist
- **Search existing work**: `openspec list --specs`, `openspec list`. Use `rg` for full-text search.
- **Decide scope**: New capability vs. modifying existing one.
- **Pick a unique `change-id`**: Kebab-case, verb-led (e.g., `refactor-members-dao`).
- **Scaffold**: `proposal.md`, `tasks.md`, and spec deltas under `openspec/changes/<id>/`.
- **MANDATORY**: Requirements MUST use normative language (**SHALL** or **MUST**) and include at least one **#### Scenario:** header.
- **Validate**: `openspec validate [id] --strict` and fix issues.
- **Implement**: Run `@openspec-apply` and follow the `tasks.md`.

## Three-Stage Workflow

Always use the JetBrains AI `@rules` to invoke the workflows.

### Stage 1: Creating Changes (`@openspec-proposal`)
Create a proposal for:
- New features or functionality.
- Refactoring existing legacy code.
- Breaking changes (schema, API).
- Architectural shifts.

Refer to `docs/workflows/openspec/proposal.md` for details.

### Stage 2: Implementing Changes (`@openspec-apply`)
1. Read `proposal.md` and `tasks.md`.
2. Implement tasks sequentially.
3. Update `tasks.md` progress.
4. Run `pnpm check` and `pnpm check-types`.

Refer to `docs/workflows/openspec/apply.md` for details.

### Stage 3: Archiving Changes (`@openspec-archive`)
After successful deployment and verification:
- Run `openspec archive <id>`.
- Create the final archive commit.

Refer to `docs/workflows/openspec/archive.md` for details.

## Critical Spec File Rules
- **Scenario Formatting**: MUST use `#### Scenario: Name` (4 hashtags). No bullets or bold in headers.
- **Normative Language**: Use **SHALL** or **MUST** for requirements.
- **Atomic Changes**: Keep proposals small and focused on a single outcome.

## Context Checklist
Before any task:
- [ ] Read `openspec/project.md` for current conventions.
- [ ] Read relevant specs in `openspec/specs/`.
- [ ] Check pending changes in `openspec/changes/` for conflicts.
- [ ] **MANDATORY**: Scan for existing functions/helpers before creating new ones (DRY).

## Directory Structure
```
openspec/
├── project.md              # Project conventions and tech stack
├── specs/                  # Current truth - what IS built
│   └── [capability]/       # Single focused capability
│       └── spec.md         # Requirements and scenarios
├── changes/                # Proposals - what SHOULD change
│   └── [change-name]/
│       ├── proposal.md     # Why, what, impact
│       ├── tasks.md        # Implementation checklist
│       └── specs/          # Delta changes
└── archive/                # Completed changes historical record
```

Remember: Specs are truth. Changes are proposals. Always consult `docs/` for authoritative workflows.
