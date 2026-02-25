# Auto-fix Code Quality Workflow
Run formatting, linting, type checking, and build to ensure project quality.

## Overview
Run code quality checks sequentially and optionally fix issues automatically.

## Checks
Run checks in this exact order. Stop immediately if any check fails:
1. `pnpm format` - auto-fix formatting issues with Biome.
2. `pnpm lint` - check for linting errors.
3. `pnpm check-types` - verify TypeScript types (no auto-fix).
4. `pnpm build` - production build to confirm overall integration.

## Failure Handling
**If any check fails:**
1. Display error output to user.
2. Ask: "Fix issues automatically? (Yes/Explain errors/Cancel)"
   - **Yes** → attempt to fix issues via `pnpm check` (applies Biome lint fixes), stage changes, and commit with `chore: fix lint/format issues`. Then re-run from step 1.
   - **Explain** → briefly list errors and stop.
   - **Cancel** → stop execution.

## Commit Requirement
- Use format: `chore: fix lint/format issues`.
- Only mark complete when ALL checks pass.
