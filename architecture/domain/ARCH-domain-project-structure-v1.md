---
id: ARCH-domain-project-structure
title: "Project Data Model (project.json)"
type: data_model
layer: domain
owner: @team-backend
version: v1
status: planned
created: 2026-01-12
updated: 2026-01-12
tags: [json, data-structure, tree]
depends_on: []
referenced_by: []
---

## Context
The `project.json` file is the central source of truth for any Proposal-Copilot project. It represents the state of the project, including metadata, unstructured context (AI summary), and the structured hierarchy of systems and devices. It supports the "Generic" design principle by avoiding hardcoded industry scenarios.

## Structure
The data structure is a recursive tree stored in JSON format:

```json
{
  "meta": {
    "name": "String",
    "create_time": "ISO8601 String",
    "version": "String"
  },
  "context": "String (AI summarized background text)",
  "structure_tree": [
    {
      "id": "UUID",
      "type": "subsystem | device | feature",
      "name": "String",
      "specs": { "key": "value" },
      "quantity": "Number",
      "children": [ /* Recursive structure */ ]
    }
  ]
}
```

## Behavior
*   **Persistence**: Saved to disk whenever the UI state changes (debounced).
*   **Reactivity**: Changes in the `structure_tree` are reflected immediately in the "Tree View" UI and the "Real-time Preview" pane.
*   **Flexibility**: The recursive nature allows for arbitrary depth (e.g., System -> Subsystem -> Device -> Module).

## Evolution
### Planned
*   Implementation of schema validation (JSON Schema) to ensure integrity.
*   Migration support for future version changes.

### Historical
*   v1: Initial recursive design.
