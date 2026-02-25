# Project Context: El Decano Cobranzas

## Purpose
Integral management system for El Decano club: member management, membership fee collections, income/expenditure accounting, and advertising panel administration.
This project is undergoing a professional refactoring from an AI-generated prototype to high-quality engineering standards.

## Tech Stack
- **Monorepo**: pnpm workspaces + Turborepo
- **Framework**: React 19 (Vite)
- **Backend/DB**: Supabase
- **Language**: TypeScript (Strict mode)
- **Quality Control**: Biome (Linting & Formatting)
- **UI**: Tailwind CSS, Recharts, Lucide React

## Monorepo Structure
- `apps/web-app/`: Main React application.
- `packages/`: Shared libraries and configurations (to be developed).
- `docs/`: Centralized documentation (Conventions and Workflows).
- `openspec/`: Spec-driven development files.

## Project Conventions
- **UK English** for code, technical documentation, and commit messages.
- **US English** for end-user facing content.
- **Spec-driven development** using the OpenSpec framework.
- **DRY (Don't Repeat Yourself)**: Always search for existing utilities before creating new ones.
- **Hierarchical Documentation**: All authoritative rules are in `docs/` and referenced via pointers in `.aiassistant/rules/`.

For a full list of conventions, refer to `docs/conventions/base.md`.
