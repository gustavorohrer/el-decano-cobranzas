# Pull Request Workflow
Create a PR for the current branch with OpenSpec integration.

## Guardrails
- Check for an existing PR before creating a new one.
- Detect if an OpenSpec change is implemented but not archived.
- Include a concise, actionable PR description.
- Use `gh pr create` for automation.

## Steps
1. Identify the current branch and its purpose.
2. Check if there are active OpenSpec changes in the branch.
3. If an OpenSpec change is implemented:
   - Reference the change ID in the PR title: `feat: implement <change-id> change`.
   - List affected capabilities in the description.
4. Run `gh pr create` with the following template:
   - **Title**: `<type>[scope]: <description>`
   - **Body**: 
     - Brief summary of changes.
     - OpenSpec context (if any).
     - Manual verification steps performed.
5. Provide the PR link to the user.

## Reference
Follow Conventional Commits for the PR title.
