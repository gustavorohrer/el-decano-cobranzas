# Commit Workflow
Draft a commit message following **Conventional Commits** for STAGED changes ONLY.

## Guardrails
- Before proceeding, read `docs/conventions/git-conventions.md` to understand formatting rules.
- Analyse only STAGED changes.

## Steps
1. Run `git diff --cached` and `git status` to see staged changes.
2. Analyse the changes to determine:
   - The type (feat/fix/chore/etc.).
   - The scope (web-app, openspec, etc.).
   - A concise, UK English description in imperative mood.
3. Incorporate any additional user instructions provided after the `@commit` command.
4. Draft the message and present it for approval.
5. If approved, execute the commit: `git commit -m "message"`.
6. Show the commit hash and a brief summary.

## Reference
For OpenSpec operations, use the standard format: `docs(openspec): [open|archive] [change-name] change`.
