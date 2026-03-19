# fQRGen Claude Code Plugin

A Claude Code plugin that generates QR codes via the fQRGen REST API.
After installation, generate QR codes instantly using slash commands in Claude Code.

---

## Plugin Structure

```
.claude-plugin/
└── plugin.json          # Plugin manifest
skills/
└── fqrgen/
    └── SKILL.md         # QR code generation skill
```

---

## Skills

### `fqrgen` — QR Code Generation

Generates QR code images from URLs or text via the fQRGen REST API.

**Usage:**
```
/fqrgen:fqrgen https://finfra.kr
/fqrgen:fqrgen https://github.com --format=svg
/fqrgen:fqrgen "Hello World" --output=./hello.png
```

**Features:**
- Guides user to launch fQRGen.app if server is not running
- Supports PNG / SVG formats
- Opens macOS preview after generation
- Timestamped filenames

**Options:**

| Option            | Description           | Default                 |
| ----------------- | --------------------- | ----------------------- |
| `--format=svg`    | Generate as SVG       | `png`                   |
| `--output=<path>` | Specify output path   | `./qr-{timestamp}.png`  |
| `--server=<url>`  | Change server address | `http://localhost:3014` |

**API Summary:**

| Field        | Value                         |
| ------------ | ----------------------------- |
| Endpoint     | `POST /api/generate`          |
| Content-Type | `application/json`            |
| `data`       | URL/text to encode in QR code |
| `format`     | `png` or `svg`                |

---

## Installation

### Option 1: Plugin Install (Recommended)

```bash
/plugin marketplace add nowage/fQRGen
/plugin install fqrgen
```

### Option 2: Manual Copy

Copy the plugin directory to your project:

```bash
# From fQRGen project root
cp -r agents/claude/.claude-plugin .claude-plugin
cp -r agents/claude/skills .claude/skills
```

### Option 3: Symbolic Link

```bash
ln -sf agents/claude/skills/fqrgen .claude/skills/fqrgen
```

---

## Prerequisites

The fQRGen REST API server must be running:

| Server             | How to Run                                      |
| ------------------ | ----------------------------------------------- |
| macOS Native App   | Launch fQRGen.app (enable REST API in Settings) |
| Node.js Web App    | `cd lib/qrgen-node && npm start`                |

> If the server is not running, the skill will prompt the user to launch fQRGen.app.

---

## Related Extensions

| Extension                    | Location       | Description                                          |
| ---------------------------- | -------------- | ---------------------------------------------------- |
| [MCP Server](../../mcp/)    | `mcp/` | QR generation via MCP protocol (Claude Desktop compatible) |

---

## License

MIT
