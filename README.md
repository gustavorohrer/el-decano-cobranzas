<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1gha6utugsVW5t_DZOiPkRsMFxts3Q8NP

## OpenSpec Development

This project uses the **OpenSpec** methodology for spec-driven development.

1. **Structure**: Specifications are located in `openspec/specs/`.
2. **Changes**: New features are proposed in `openspec/changes/`.
3. **Workflow**: Follow the 3-stage cycle: `Proposal` -> `Apply` -> `Archive`.
4. **Quality**: Before proposing a change, validate the specifications with the linter:
   `node tools/lint-specs.cjs`

For more details, consult `openspec/AGENTS.md`.

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
