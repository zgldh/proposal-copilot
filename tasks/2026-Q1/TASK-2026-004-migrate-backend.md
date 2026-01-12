---
id: TASK-2026-004
title: "Migrate Backend to Node.js (Remove Python)"
status: ready
priority: high
type: tech_debt
estimate: 8h
assignee: @backend-dev
created: 2026-01-12
updated: 2026-01-12
parents: []
children: []
arch_refs: [ARCH-app-proposal-copilot, ARCH-service-doc-engine]
risk: low
audit_log:
  - {date: 2026-01-12, user: "@AI-DocArchitect", action: "created with status ready"}
---

## Description
Transition the project architecture to a pure Node.js/TypeScript environment to improve performance and simplify deployment. This involves removing the existing Python engine code (`engine/` directory), removing Python spawning logic from `src/main/main.ts`, and preparing `src/main/main.ts` to handle backend responsibilities directly.

## Acceptance Criteria
1.  The `engine/` directory and `requirements.txt` are removed from the repository.
2.  `src/main/main.ts` no longer references or spawns a Python child process.
3.  The application launches without errors related to missing Python components.
4.  `src/main/main.ts` is structured to handle future service calls (e.g., document generation) directly.

## Definition of Done
*   Code refactored and merged to main.
*   App starts up cleanly.
*   Documentation updated (already covered by Architecture updates).
