---
id: TASK-2026-002
title: "Implement Core Data Model & Project Management"
status: backlog
priority: high
type: feature
estimate: 16h
assignee: @backend-dev
created: 2026-01-12
updated: 2026-01-12
parents: [TASK-2026-001]
children: []
arch_refs: [ARCH-domain-project-structure, ARCH-app-proposal-copilot]
risk: medium
audit_log:
  - {date: 2026-01-12, user: "@AI-DocArchitect", action: "created with status backlog"}
---

## Description
Implement the logic for creating, opening, and saving projects. Each project corresponds to a local folder. The core task is to define the `project.json` schema and implement the read/write operations in the application backend (Electron Main process `src/main/main.ts`) using Node.js `fs`.

## Acceptance Criteria
1.  User can select a directory to create a new project.
2.  System generates a valid `project.json` with default metadata in the selected directory.
3.  User can open an existing project folder; system validates and loads `project.json`.
4.  Changes to the internal state are persisted to disk (auto-save or manual).

## Definition of Done
*   Unit tests for JSON serialization/deserialization.
*   UI dialogs for "New Project" and "Open Project" are functional.
*   Recursion support for `structure_tree` is verified.

## Notes
*   Ensure file locks or safe-write mechanisms are used to prevent data corruption.
