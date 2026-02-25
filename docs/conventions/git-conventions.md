# Git Conventions

## Conventional Commits
All commits use Conventional Commits format: `<type>[optional scope]: <description>`

### Types
- `feat:` - new feature
- `fix:` - bug fix
- `docs:` - documentation only
- `chore:` - routine tasks, maintenance, build config
- `refactor:` - code restructuring (no behavior change)
- `perf:` - performance improvements
- `test:` - test additions/changes

### Scopes
Use `web-app` for application-specific changes, or feature areas.
For OpenSpec operations, always use `docs(openspec):`.

### Style
- **Lowercase**
- **Imperative mood** ("add" not "added")
- **Concise** (sacrifice grammar for brevity)
- **UK spelling**
- **Never credit AI** in commits or use co-author tags.

### Examples
```
feat(web-app): add member search
fix(web-app): resolve payments calculation bug
docs(openspec): open add-member-v2 change
chore: configure Biome
refactor: simplify supabase service
```

## OpenSpec Commit Lifecycle
OpenSpec changes follow three-commit lifecycle:

### 1. Opening a Change
```
docs(openspec): open $change_name change
```
Created when proposing a new specification.

### 2. Implementing a Change
```
feat: implement $change_name change
fix: implement $change_name change
refactor: implement $change_name change
```
Type depends on the nature of the change.

### 3. Archiving a Change
```
docs(openspec): archive $change_name change
```
Marks change as deployed/completed.

## Best Practices
### Linear History
Prefer rebase over merge to keep history clean and easy to follow during technical reviews.
```bash
git fetch origin
git rebase origin/main
```
### Early Commits
Commit frequently. Small, logical commits are much easier to review and revert if necessary.
