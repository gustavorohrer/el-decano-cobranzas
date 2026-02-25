---
apply: manually
description: "Archiving deployed OpenSpec changes"
---
# OpenSpec Archive Workflow
Archive the completed change after it is successfully deployed.
Use the CLI to perform the archiving:
```bash
openspec archive <change-id>
```
This will:
- Move the change to the archive directory.
- Update the main `specs/` directory with the new requirements.
- Ensure the project remains in sync with the current implementation.

Validate the results using `openspec validate --strict`.
