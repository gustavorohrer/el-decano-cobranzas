# PR Review Workflow
Review a pull request and draft a GitHub review comment.

## Guardrails
- Keep the review concise and high-signal.
- Use prefixes: `[Nit]`, `[Suggestion]`, `[Concern]`, `[Risk]`.
- Detect if the PR aligns with the OpenSpec change it implements.

## Steps
1. Use `gh pr view` and `gh pr diff` to analyse the changes.
2. Verify that the PR title and description follow the conventional formats.
3. Compare the implemented code with the `proposal.md` and `tasks.md` in `openspec/changes/<change-id>/`.
4. Run `pnpm check-types` and `pnpm lint` to ensure quality.
5. Create a draft review with the findings:
   - Identify potential bugs or regressions.
   - Point out areas where DRY could be better applied.
   - Verify that OpenSpec deltas correctly represent the final state.
6. Present the draft to the user for final approval before submitting with `gh pr review`.

## Reference
The goal is to maintain high engineering standards while evolving the code.
