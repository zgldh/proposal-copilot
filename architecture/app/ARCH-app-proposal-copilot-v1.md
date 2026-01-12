---
id: ARCH-app-proposal-copilot
title: "Proposal-Copilot Application Overview"
type: system
layer: application
owner: @team-core
version: v2
status: planned
created: 2026-01-12
updated: 2026-01-12
tags: [app, electron, local-first, nodejs]
depends_on: [ARCH-ui-workbench, ARCH-service-doc-engine, ARCH-domain-project-structure]
referenced_by: []
---

## Context
Proposal-Copilot is a desktop application designed for the System Integration (SI) industry. Its primary goal is to assist project managers and presales engineers in converting unstructured requirements (via natural language dialogue) into standardized structured documents (Word/PDF proposals and Excel quotations).

The system adheres to a **Local-First** principle, ensuring all data is stored on the user's machine to protect privacy. It operates on a **Conversation as Modeling** paradigm, where the chat interface directly facilitates the construction of a project data model.

## Structure
The application is built using a modern desktop technology stack:
*   **Frontend/Shell**: Electron (or Tauri) hosting a React/Vue3 application. This layer handles the UI, state management, and user interaction.
*   **Backend/Engine**: The Electron Main process (`src/main/main.ts`) handles all business logic, heavy data processing, and document generation. This ensures better performance and simpler architecture by removing the Python dependency.
*   **Storage**: File-system-based persistence. Each project is a folder containing a `project.json` file and an `/assets` subdirectory.

## Behavior
1.  **Project Initialization**: Users create or open a local folder. The app initializes or reads `project.json`.
2.  **Interaction**:
    *   **Chat**: Users converse with an LLM (Cloud or Local Ollama). The LLM prompts for missing technical parameters.
    *   **Modeling**: The conversation updates the structural representation (Project Tree) in real-time.
3.  **Generation**:
    *   **Proposals**: The Node.js engine takes a reference document (Ref Doc) and the project data to generate a styled Word/PDF document.
    *   **Quotations**: The system flattens the BOM (Bill of Materials) from the project tree into an Excel file with formula support.

## Evolution
### Planned
*   Completion of migration from Python to Node.js backend.
*   Integration with local LLMs (Ollama) directly from the Main process.

### Historical
*   v2: Replaced Python backend with Node.js (Electron Main) for performance.
*   v1: Initial design based on requirements.
