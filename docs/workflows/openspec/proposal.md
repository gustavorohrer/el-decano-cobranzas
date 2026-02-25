# OpenSpec: Proposal Workflow
Scaffold a new OpenSpec change and validate strictly.

## Guardrails
- Before starting, review `openspec/project.md` and current specs in `openspec/specs/`.
- Do NOT write application code. Only create proposal documents (`proposal.md`, `tasks.md`) and spec deltas.
- Identify vague or ambiguous details and ask clarifying questions before editing files.

## Steps
1. Run `openspec list` and `openspec list --specs` to ground the proposal in current behaviour.
2. Choose a unique verb-led `change-id` (e.g., `add-auth-v2`).
3. Create the directory `openspec/changes/<id>/`.
4. Scaffold `proposal.md` (Why, What Changes, Impact).
5. Draft spec deltas in `openspec/changes/<id>/specs/<capability>/spec.md` using `## ADDED|MODIFIED|REMOVED Requirements`.
6. Ensure every requirement header contains **SHALL** or **MUST** and has at least one **#### Scenario:**.
7. Draft `tasks.md` as an ordered checklist of implementation steps.
8. Validate with `openspec validate <id> --strict`.

## Reference
See `openspec/AGENTS.md` for the full OpenSpec specification and formatting rules.
