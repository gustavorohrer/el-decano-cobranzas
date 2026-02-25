# El Decano Cobranzas

A comprehensive management system for clubs: members, accounting, advertising, and PWA.

⚠️ **Project Status: Work In Progress (WIP) & Refactoring**

This project was originally bootstrapped using automated AI generation (AI Studio). As a result, the initial codebase was of low technical quality and lacked professional engineering standards.

I am currently in the process of **drastically improving and evolving** this project to demonstrate professional software engineering practices, including:
- **Monorepo Architecture**: Migrating to a scalable monorepo using `pnpm` workspaces and `Turborepo`.
- **Spec-Driven Development (SDD)**: Implementing the **OpenSpec** methodology to ensure every change is documented, validated, and traceable.
- **Strict Quality Control**: Integrating **Biome** for fast linting/formatting and enforcing strict TypeScript configurations.
- **Refactoring**: Rewriting legacy AI-generated services and components into clean, maintainable, and type-safe code.

## Methodology: OpenSpec

This project follows the **OpenSpec** methodology for rigorous spec-driven development.

1. **Specifications**: Located in `openspec/specs/`. These define the "Source of Truth" for system capabilities.
2. **Proposals**: New features or architectural changes are proposed in `openspec/changes/`.
3. **Workflow**: We follow a 3-stage lifecycle: `Proposal` -> `Apply` -> `Archive`.
4. **Validation**: All specifications are strictly validated using a custom linter to ensure normative language (`SHALL`/`MUST`) and scenario coverage.

### How to Add a New Feature
To implement a new feature following SDD, refer to our detailed **[Step-by-Step Guide](docs/workflows/sdd-step-by-step.md)**.
It explains the workflow for environments without Linear or automated CI/CD.

For more details on how AI agents and humans collaborate on this repo, see `openspec/AGENTS.md`.

## Tech Stack

- **Framework**: React 19 + Vite
- **Monorepo Tooling**: pnpm workspaces + Turborepo
- **Database & Auth**: Supabase
- **Quality**: TypeScript (Strict), Biome (Linting & Formatting)
- **UI**: Tailwind CSS, Lucide React, Recharts

## Getting Started

### Prerequisites

- Node.js >= 22.0.0
- pnpm >= 8.0.0

### Installation

```bash
pnpm install
```

### Development

Run the development server for all apps:

```bash
pnpm dev
```

The main web application is located in `apps/web-app`.

---
*Note: This repository is part of a portfolio demonstrating the transition from AI-generated prototypes to production-grade engineering.*
