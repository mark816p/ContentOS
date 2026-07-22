# ContentOS Engine

ContentOS Engine is a production-ready, full-stack, local-first web and desktop AI orchestrator modeled after the Hermes 3-panel UI architecture.

## Features

- **Local-First AI Execution**: Native integrations for Ollama and Model Context Protocol (MCP) servers.
- **Hermes Architecture**: A highly productive 3-panel workspace UI for AI researchers and power users.
- **Cross-Platform Installers**: Compile standalone desktop apps for Windows, macOS, and Linux (x64 and ARM).
- **SQLite Persistence**: User prompts and generated drafts are automatically persisted locally via Prisma ORM.
- **Dynamic CSS Themes**: Switch between multiple aesthetic themes instantly (Hermes Gold, Slate Dev, Ares Red, etc.).

## Installation

You can download the pre-compiled standalone installers for Windows, Mac, and Linux from our [GitHub Releases page](https://github.com/mark816p/ContentOS/releases/latest).

### Building from Source

To build the desktop application locally, you need Node.js (v20+) installed.

```bash
git clone https://github.com/mark816p/ContentOS.git
cd ContentOS/contentos-app
npm install
npm run build:desktop
```

## Architecture

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS v4, Zustand.
- **Desktop Runtime**: Electron + `electron-builder`.
- **Database**: Prisma ORM with SQLite.
- **AI Integrations**: OpenRouter, Anthropic, Ollama, and local MCP SDKs.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
