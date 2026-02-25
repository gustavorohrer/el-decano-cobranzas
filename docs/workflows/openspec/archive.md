# OpenSpec: Archive Workflow
Archive a completed and deployed OpenSpec change.

## Guardrails
- Archiving happens ONLY after the change is successfully deployed.
- This process updates the "Source of Truth" in `openspec/specs/`.

## Steps
1. Run `openspec archive <change-id>` to move the change to `openspec/archive/`.
2. Confirm that the `openspec/specs/` directory reflects the final state of the capability.
3. Validate the archived state with `openspec validate --strict`.
4. Create a commit using the standard format: `docs(openspec): archive <change-id> change`.

## Reference
The archive maintains a historical record of all changes made to the system.
