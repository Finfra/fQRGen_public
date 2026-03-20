# fQRGen Gemini Agent Integration

This directory contains specialized skills and workflows that empower the Gemini CLI agent to interact directly with the fQRGen application via its REST API. By installing these, the agent can autonomously check the server status and generate QR codes for you while the app is running.

## Directory Structure

- `skills/`: Contains atomic agent capabilities (e.g., `generate-qr.md` which teaches the agent how to format the API request).
- `workflows/`: Contains step-by-step processes (e.g., `fqrgen-api-workflow.md` which guides the agent to check health status before generating).

## Installation

To enable your Gemini CLI agent to use these capabilities, you need to copy them into your project's agent configuration directory.

Run the following commands in the root of your project:

```bash
# Create the target directories if they don't exist
mkdir -p .agent/skills .agent/workflows

# Copy the skill and workflow files
cp -r _public/agents/gemini/skills/* .agent/skills/
cp -r _public/agents/gemini/workflows/* .agent/workflows/
```

*Note: If your agent configuration is stored in `.gemini/` or another directory, adjust the destination path accordingly.*

## Usage

Once installed, ensure your fQRGen app is running and the API server is enabled (default port: `3014`).

You can then prompt your Gemini CLI agent like this:
> "Run the fQRGen API workflow to generate a PNG QR code for https://github.com and save it as github.png"

The agent will automatically check the server's health and use the `curl` commands defined in the skill to generate and save the QR code.