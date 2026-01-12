---
id: ARCH-service-doc-engine
title: "Intelligent Document Generation Engine"
type: service
layer: service
owner: @team-backend
version: v1
status: planned
created: 2026-01-12
updated: 2026-01-12
tags: [python, docx, excel, ai]
depends_on: [ARCH-domain-project-structure]
referenced_by: []
---

## Context
The Document Engine is the core value proposition of Proposal-Copilot. It transforms the structured data from `project.json` and the unstructured intent from the user into professional-grade artifacts (Word, PDF, Excel). It utilizes a "No-Code Template" approach, relying on AI to mimic the style of reference documents rather than rigid placeholder replacement.

## Structure
This component is implemented in Python to leverage mature libraries:
*   **Docx Processing**: `python-docx` for reading reference styles and structure.
*   **Data Processing**: `pandas` for Excel generation.
*   **AI Glue**: Integration with LLM APIs to generate semantic content (HTML fragments) that fits specific sections of the document skeleton.

## Behavior
### Word/PDF Export
1.  **Skeleton Analysis**: Parses the user-uploaded "Reference Document" to extract header hierarchy and styles.
2.  **Content Generation**: AI generates content (HTML) based on the `context` and `structure_tree` from the project model.
3.  **Injection**: The engine maps the generated content to semantic anchors in the skeleton (e.g., "Project Background", "Topology Description") and renders the final file.

### Excel Export
1.  **Traversal**: Traverses the `structure_tree` to identify all nodes of type `device`.
2.  **Flattening**: Converts the tree into a flat list of BOM items.
3.  **Formulation**: Writes data to Excel, applying pre-configured formulas for totals and taxes.

## Evolution
### Planned
*   Development of a Python bridge (REST API or Stdin/Stdout) to communicate with the Electron frontend.
*   Optimization of HTML-to-Docx conversion to preserve reference formatting.

### Historical
*   v1: Conceptual design.
