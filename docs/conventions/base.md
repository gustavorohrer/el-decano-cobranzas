# Core Conventions

## Project
**El Decano Cobranzas** - a management system for clubs (members, accounting, advertising).
This project is undergoing a professional refactoring from an AI-generated prototype to a high-quality, scalable application.

## Code Style
- **UK English spelling** throughout the codebase, documentation, and commit messages.
- **Extremely concise** commit messages and code implementations.
- **Avoid emojis** unless explicitly requested.
- Use **US English spelling** only for user-facing content (if applicable).

## Monorepo Structure
### Apps
- `apps/web-app/` - Main React application (Vite-based).

### Packages (Future)
- Shared logic should be moved to `packages/` as the project evolves.

## Duplication Avoidance (DRY)
Avoid duplicating logic across the codebase. Before implementing new helper functions or utility methods:
1. **Search First**: Scan `apps/web-app/services/` and `hooks/` for existing similar functions.
2. **Reuse**: If a suitable utility exists, use it or refactor it to be more generic.
3. **Extend over Create**: If an existing function provides similar logic, extend it (e.g., via optional parameters) instead of creating a new one.
4. **Verification**: Always ensure that refactoring does not change existing behavior unless explicitly requested in a proposal.

## Language Consistency
All technical documentation, requirements, and internal code comments MUST be in English (UK). User-facing labels in the UI (Spanish) are the only exception.
