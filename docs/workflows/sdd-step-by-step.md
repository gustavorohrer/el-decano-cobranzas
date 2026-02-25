# SDD Step-by-Step Guide: Adding a New Feature

This guide explains how to add a new feature to **El Decano Cobranzas** using the Spec-Driven Development (SDD) methodology and the OpenSpec framework.

Since this project does not use Linear or automated CI/CD pipelines, we follow a manual but rigorous process to ensure high-quality engineering.

---

## Workflow Overview: The 3-Stage Lifecycle

The development of any new feature follows three distinct stages:
1. **Proposal**: Define *what* and *why* before writing any code.
2. **Apply**: Implement the changes following the approved plan.
3. **Archive**: Finalize the feature and update the system's "Source of Truth".

---

## Step 1: Phase 0 - Ideation (Conversational)

Before creating formal documents, discuss the feature with **your preferred AI Assistant**.

- **Prompt Example**: "I want to add a feature for [Feature Name]. It should allow users to [Capability]. How should we approach this?"
- **Goal**: Clarify requirements, identify affected files, and decide if a new capability spec is needed or if an existing one should be modified.

---

## Step 2: Phase 1 - Proposal (Design)

Once the idea is clear, create the formal proposal. **Do NOT write application code yet.**

1. **Invoke the workflow**: Type `@openspec-proposal` in the chat.
2. **Choose a Change ID**: Use a short, kebab-case name starting with a verb (e.g., `add-member-profile-photo`).
3. **Draft the Proposal**: The AI will create a folder in `openspec/changes/<change-id>/` with:
   - `proposal.md`: Explains the *Why*, *What*, and *Impact*.
   - `tasks.md`: A checklist of all implementation steps.
   - `specs/<capability>/spec.md`: The "Delta" changes (new requirements using **SHALL** or **MUST** and **Scenarios**).
4. **Validation**: Run `node tools/lint-specs.cjs` to ensure the syntax is correct.
5. **Review**: Read the documents and ensure you are happy with the plan.

---

## Step 3: Phase 2 - Implementation (Coding)

Now it's time to write the code.

1. **Invoke the workflow**: Type `@openspec-apply` in the chat.
2. **Follow the tasks**: The AI will read your `tasks.md` and start implementing the feature step-by-step.
3. **Track progress**: As tasks are finished, the AI (or you) should mark them as completed in `tasks.md` (`- [x]`).
4. **Manual Verification**: Since there is no CI/CD, run the app locally (`pnpm dev`) and manually test the scenarios defined in your proposal.

---

## Step 4: Phase 3 - Quality Check (Verification)

Before finalizing, ensure the code meets our strict standards.

1. **Invoke the workflow**: Type `@auto-fix` in the chat OR run these commands manually:
   - `pnpm check`: Runs Biome for linting and formatting.
   - `pnpm check-types`: Runs TypeScript compiler to catch type errors.
2. **Fix Issues**: If any errors appear, the AI should fix them before proceeding.

---

## Step 5: Phase 4 - Commit (Record)

Save your progress with a professional commit message.

1. **Stage your changes**: `git add .`
2. **Invoke the workflow**: Type `@commit` in the chat.
3. **Review**: The AI will generate a **Conventional Commit** message (e.g., `feat: implement member profile photos`).
4. **Push**: `git push origin main`.

---

## Step 6: Phase 5 - Archive (Finalization)

Once the feature is working perfectly in your local environment and pushed to GitHub, you must "Archive" the change.

1. **Invoke the workflow**: Type `@openspec-archive` in the chat OR run:
   - `openspec archive <change-id>`
2. **What happens**: This command moves the change documents to `openspec/archive/` and updates the files in `openspec/specs/`.
3. **The Goal**: `openspec/specs/` always reflects the *current* state of the live system.
4. **Final Commit**: Commit the archive changes: `git add . && git commit -m "docs(openspec): archive <change-id>"`

---

## Tips for Success

- **Keep it Atomic**: Don't try to build a massive feature in one proposal. Break it down into smaller, manageable changes.
- **Search First (DRY)**: Before adding a new utility or component, search the codebase. The AI is good at this, but you should double-check.
- **No Linear? No Problem**: Use `openspec/changes/` as your "Sprint Board". Any folder there is an active "Ticket".
- **No CI/CD? No Problem**: Your local environment is your staging area. Don't Archive until you've seen the feature working in the browser.
