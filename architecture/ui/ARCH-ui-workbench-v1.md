---
id: ARCH-ui-workbench
title: "Core Workbench UI"
type: component
layer: presentation
owner: @team-frontend
version: v1
status: planned
created: 2026-01-12
updated: 2026-01-12
tags: [ui, react, split-screen]
depends_on: [ARCH-domain-project-structure]
referenced_by: []
---

## Context
The Workbench is the primary interface for Proposal-Copilot, facilitating the "Double Screen Interaction" model. It combines a conversational interface with a structured visual representation of the project, allowing users to build complex systems intuitively.

## Structure
The UI is divided into two main panels:
1.  **Left Panel (Smart Dialogue)**:
    *   Streaming Chat Interface.
    *   File upload/drag-and-drop zone (RAG source).
2.  **Right Panel (Live Context)**:
    *   **Tab 1: Tree View**: A visualization of `project.json` supporting CRUD operations.
    *   **Tab 2: Live Preview**: HTML rendering of the proposal segments currently being discussed/generated.

## Behavior
*   **Synchronization**: Modifications in the Chat (e.g., "Add 10 cameras") trigger updates in the Tree View. Conversely, manual edits in the Tree View update the context for the AI.
*   **Proactive Questioning**: The Chat interface renders questions from the AI when technical parameters are missing from the model.
*   **Asset Management**: Dragging files into the interface copies them to the project `/assets` folder and indexes them.

## Evolution
### Planned
*   Implementation of the split-pane layout using React components.
*   Integration of a tree-view component with drag-and-drop reordering support.

### Historical
*   v1: Layout design.
