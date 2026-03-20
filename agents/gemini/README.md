# fQRGen Gemini CLI Skill & Workflow

A Gemini CLI skill and workflow that generates QR codes via the fQRGen REST API.
After installation, you can generate QR codes instantly using Gemini CLI.

---

## Features

### 1. Skill (`fqrgen`)

Generates QR code images from URLs or text via the fQRGen REST API.

**Usage:**
```
Use the fqrgen skill to create a QR code for https://finfra.kr
Generate a QR code for https://github.com in svg format
```

### 2. Workflow (`fqrgen.md`)

A workflow template for generating QR codes within Gemini CLI.

---

## Installation

### Skill Install
This skill can be installed via the packaged `.skill` file.

1. Package the skill (if not already done):
   ```bash
   node <path-to-skill-creator>/scripts/package_skill.cjs _public/agents/gemini/skills/fqrgen _public/agents/gemini/skills
   ```
2. Install:
   ```bash
   gemini skills install _public/agents/gemini/skills/fqrgen.skill --scope workspace
   ```
3. Run `/skills reload` in your interactive Gemini CLI session.

### Workflow Install
Copy the workflow file to your project's workflow directory.

```bash
cp _public/agents/gemini/workflows/fqrgen.md .agent/workflows/fqrgen.md
```

---

## Prerequisites

The fQRGen REST API server must be running:

| Server             | How to Run                                      |
| ------------------ | ----------------------------------------------- |
| macOS Native App   | Launch fQRGen.app (enable REST API in Settings) |
| Node.js Web App    | `cd lib/qrgen-node && npm start`                |

> If the server is not running, the skill will prompt the user to launch fQRGen.app.
