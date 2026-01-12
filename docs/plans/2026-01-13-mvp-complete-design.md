# Proposal-Copilot MVP Design

**Date:** 2026-01-13
**Status:** Validated
**Target:** MVP (Minimum Viable Product)

## Overview

Complete the Proposal-Copilot MVP with full end-to-end functionality: AI-powered conversation modeling, real-time tree updates, and hybrid document generation.

## Architecture

### Core Modules

**LLM Provider Module** (Main Process)
- `ILLMProvider` interface with `sendMessage()`, `configure()` methods
- Concrete providers: `OpenAIProvider`, `DeepSeekProvider`, `CustomEndpointProvider`
- Provider factory for runtime selection
- Credentials stored in Electron app data directory

**Conversation Engine** (Main Process)
- Orchestrates chat flow and LLM interactions
- Parses LLM responses for structured operations
- Maintains conversation history in memory
- Generates proactive questions when model data is incomplete

**Document Generation Service** (Main Process)
- Uses `docx` npm package for template parsing
- LLM generates section content based on project data
- Merges AI content into template placeholders
- Excel export via `exceljs` with formulas

**Design Principle:** All business logic in Electron Main Process (per Architecture v2), Renderer handles UI only.

## Data Flow & Conversation Modeling

### Conversation → Tree Sync

1. **User Message** → ChatPanel (renderer) → IPC to Main Process
2. **Conversation Engine** builds prompt:
   - System prompt: Extract structured operations from user requests
   - Context: Current `project.json` + conversation history
3. **LLM Response** returns JSON operations:
   ```json
   {
     "operations": [
       { "action": "add_node", "path": "sys-1", "type": "device", "name": "IP Camera", "quantity": 10, "specs": {...} },
       { "action": "update_context", "text": "Customer needs 4K surveillance..." }
     ],
     "proactive_questions": ["What is the required storage duration?"]
   }
   ```
4. **Engine applies operations** to `project.json`, triggers auto-save
5. **Updated tree** syncs to renderer → TreeView updates

### State Management
- **Main Process:** Single source of truth for `project.json`
- **Renderer:** Local React state, synced via IPC
- **Auto-save:** Debounced (500ms) on every tree change

### Error Handling
- Invalid JSON from LLM: Regenerate with schema validation
- Failed operations: User-friendly error in chat

## UI/UX Implementation

### ChatPanel
- Streaming chat UI with `react-markdown`
- Message history (user + AI messages)
- Proactive question cards with quick-reply buttons
- File drop zone: Copy to `/assets`, trigger RAG context
- LLM provider selector dropdown

### RequirementTree
- Right-click context menu: Add/Edit/Delete nodes
- Inline edit for node name/quantity
- Specs editor modal (key-value pairs)
- Drag-and-drop reordering (AntD Tree `draggable` prop)

### Live Preview Tab
- Real-time HTML rendering as AI generates content
- "Export to Word/PDF" and "Export to Excel" buttons

### Header
- Editable project name
- Save status indicator (Saved/Unsaved/Saving...)
- Settings: API keys, LLM provider, auto-save toggle

### Error UI
- Toast notifications for errors
- Error boundary around ChatPanel

## Testing Strategy

### Unit Tests
- LLM Providers: Mock API responses, message formatting
- Conversation Engine: Operation parsing, JSON schema validation
- Project Service: File I/O, JSON validation, auto-save
- Tree utilities: Edge cases in transformation

### Integration Tests
- End-to-end: Create → Chat → Tree update → Document export
- IPC communication: Renderer ↔ Main process sync
- Provider switching: Seamless switching between providers

### Manual Testing
- Real LLM APIs (OpenAI, DeepSeek)
- Large projects (1000+ nodes) → performance
- Rapid edits → auto-save reliability
- Exported documents match template formatting

## MVP Acceptance Criteria

1. **Conversation → Tree:** Create project → Chat with LLM → Tree updates reflect in UI
2. **Batch Operations:** Add 10+ devices via conversation → All appear correctly
3. **Word Export:** Document contains proper styling from reference template
4. **Excel Export:** BOM includes all devices with quantities and totals

## Implementation Priority

1. **Phase 1:** LLM Provider Module + Conversation Engine
2. **Phase 2:** Chat UI enhancements + Tree editing
3. **Phase 3:** Document generation (Word/PDF)
4. **Phase 4:** Excel export + final polish
