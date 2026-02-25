# OpenSpec: Apply Workflow
Implement an approved OpenSpec change proposal.

## Guardrails
- Implementation MUST follow the `proposal.md` and `tasks.md` defined in the change.
- Do NOT start implementation until the proposal is approved.

## Steps
1. Read the `proposal.md` and `tasks.md` in `openspec/changes/<change-id>/`.
2. Implement tasks sequentially as defined in `tasks.md`.
3. After completing a task, update the checklist in `tasks.md` with `- [x]`.
4. Run `pnpm check` and `pnpm check-types` after the implementation to ensure quality.
5. Create a commit using the standard format: `feat: implement <change-id> change`.

## Reference
Implementation details and technical decisions are stored in `design.md` (if it exists).
