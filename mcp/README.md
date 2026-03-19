# fQRGen MCP Server

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server that exposes the fQRGen REST API as tools.
Generate QR codes directly from AI agents such as Claude Code and Claude Desktop.

## Prerequisites

The fQRGen REST API server must be running:

| Server             | How to Run                                 |
| ------------------ | ------------------------------------------ |
| macOS Native App   | Launch fQRGen.app (enable REST API in Settings) |
| Node.js Web App    | `cd lib/qrgen-node && npm start`           |

Default server address: `http://localhost:3014`

---

## Installation

### Option 1: Global Install (Recommended)

```bash
npm install -g fqrgen-mcp
```

[![npm](https://img.shields.io/npm/v/fqrgen-mcp)](https://www.npmjs.com/package/fqrgen-mcp)

### Option 2: npx (No Installation Required)

Run directly via `npx` in your MCP configuration.

### Option 3: From Source

```bash
git clone https://github.com/nowage/fQRGen.git
cd fQRGen_public/mcp
npm install
```

---

## Configuration

### Claude Code

* Add to `~/.claude/settings.json` or project `.claude/settings.json`:
  - For Claude Desktop, add to `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "fqrgen": {
      "command": "npx",
      "args": ["-y", "fqrgen-mcp"]
    }
  }
}
```

* If running from source:
```json
  "mcpServers": {
    "fqrgen": {
      "command": "node",
      "args": [
        "{PROJECT_ROOT-type-or-paste-it}/mcp/index.js"
      ]
    }
  }
```

* To change the server address:
```json
{
  "mcpServers": {
    "fqrgen": {
      "command": "npx",
      "args": ["-y", "fqrgen-mcp", "--server=http://192.168.0.10:3014"]
    }
  }
}
```

### After Global Install

```json
{
  "mcpServers": {
    "fqrgen": {
      "command": "fqrgen-mcp"
    }
  }
}
```

---

## Tools

### 1. `health_check`

Check the fQRGen server status.

**Parameters**: None

**Response example**:
```json
{
  "status": "ok",
  "app": "fQRGen",
  "port": 3014
}
```

---

### 2. `generate_qr`

Generate a QR code from text or URL.

**Parameters**:

| Name        | Type               | Required | Default                 | Description              |
| ----------- | ------------------ | -------- | ----------------------- | ------------------------ |
| `data`      | string             | No       | `"https://example.com"` | Data to encode in QR     |
| `format`    | `"png"` \| `"svg"` | No       | `"png"`                 | Output format            |
| `save_path` | string             | No       | -                       | File save path           |

**Behavior**:
- With `save_path`: Saves to file and returns the path
- `format=svg`: Returns SVG XML string as text
- `format=png`: Returns Base64-encoded PNG image

**Usage example** (ask Claude):
```
Generate a QR code for "https://finfra.kr" as PNG and save it to ~/Downloads/finfra-qr.png
```

---

### 3. `generate_qr_batch`

Generate multiple QR codes at once.

**Parameters**:

| Name                | Type               | Required | Description               |
| ------------------- | ------------------ | -------- | ------------------------- |
| `items`             | array              | Yes      | List of QR codes          |
| `items[].data`      | string             | Yes      | Data to encode            |
| `items[].format`    | `"png"` \| `"svg"` | No       | Output format (default: png) |
| `items[].save_path` | string             | Yes      | Save path                 |

**Usage example** (ask Claude):
```
Generate QR codes for these URLs:
- https://finfra.kr → ~/Downloads/finfra.png
- https://github.com → ~/Downloads/github.png
- https://example.com → ~/Downloads/example.png
```

---

## Debugging

### Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector npx fqrgen-mcp
```

Opens the Inspector UI in your browser to test each tool interactively.

### Verify Server Connection

```bash
# Check if the fQRGen REST API server is running
curl http://localhost:3014/
```

---

## Publishing to npm

```bash
cd mcp
npm publish
```

---

## Architecture

```
Claude Code / Claude Desktop
    │
    │ MCP (stdio)
    ▼
fqrgen-mcp (this server)
    │
    │ HTTP (REST API)
    ▼
fQRGen Server (localhost:3014)
    ├── macOS Native App (Swift)
    └── Node.js Web App (Express)
```

---

## License

MIT
