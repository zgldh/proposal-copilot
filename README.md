# Proposal-Copilot

An AI agent to help Sales, Engineers, Account Owners provide great proposals and estimations to clients.

## Features

- **AI-Powered Conversation Modeling**: Chat with LLM to build project structure naturally
- **Real-Time Tree Updates**: See project structure update as you converse
- **Multiple LLM Providers**: Support for OpenAI, DeepSeek, and custom endpoints (e.g., Ollama)
- **Document Generation**: Export to Word (.docx) and Excel (.xlsx)
- **Local-First**: All data stored locally on your machine
- **Auto-Save**: Changes are automatically saved to project.json

## Getting Started

### Prerequisites

- Node.js 22+
- npm or yarn

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```


## Configuration

Open Settings to configure your LLM provider:

1. **OpenAI**: Requires API key from https://platform.openai.com/
2. **DeepSeek**: Requires API key from https://platform.deepseek.com/
3. **Custom**: Configure for local LLMs (e.g., Ollama at http://localhost:11434/v1)

## Usage

1. Create a new project folder
2. Start describing your requirements in chat
3. Watch as project tree update automatically
4. Export to Word or Excel when ready

## Project Structure

```
project/
├── project.json      # Project data and structure tree
└── assets/          # Uploaded files and documents
```

## License

MIT
