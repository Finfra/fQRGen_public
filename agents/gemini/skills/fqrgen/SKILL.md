---
name: fqrgen
description: Generate QR codes from URL/text via fQRGen REST API. Use when the user wants to create a QR code image from a given URL or string.
---

# fQRGen QR Code Generation

Generate QR code images from URLs or text provided by the user via the fQRGen REST API.

## Input

If the user does not provide a URL or text, ask the user for it.

## Prerequisites

The fQRGen REST API server (`http://localhost:3014`) must be running:

| Server             | How to Run                                      |
| ------------------ | ----------------------------------------------- |
| macOS Native App   | Launch fQRGen.app (enable REST API in Settings) |
| Node.js Web App    | `cd lib/qrgen-node && npm start`                |

## Execution Steps

1. **Check Server**: Verify the fQRGen server is running using `run_shell_command`.
   ```bash
   curl -s --connect-timeout 3 -o /dev/null -w "%{http_code}" http://localhost:3014/
   ```
   If the server is not responding, inform the user with the launch command:
   > "fQRGen REST API server is not running. Launch the app with:"
   > ```bash
   > open -a "fQRGen"
   > ```
   > "Then enable REST API in Settings. Let me know when ready."

   Do NOT attempt to start the server automatically. Wait for user confirmation before proceeding.

2. **Generate QR Code**: Generate a QR code via the REST API and save to file using `run_shell_command`.
   ```bash
   TIMESTAMP=$(date +%Y%m%d-%H%M%S)
   curl -s -X POST http://localhost:3014/api/generate \
     -H 'Content-Type: application/json' \
     -d '{"data":"<USER_INPUT>","format":"png"}' \
     --output "./qr-${TIMESTAMP}.png"
   ```
   *Replace `<USER_INPUT>` with the user's input.*
   *If SVG format is requested, change `format` to `svg` and output extension to `.svg`.*

3. **Verify Result**: Validate file size and format, then open preview on macOS.
   ```bash
   file ./qr-*.png
   open ./qr-*.png
   ```

4. **Report**: Inform the user of the generated file path and size.

## Options

- `--format=svg`: Generate as SVG (default: PNG)
- `--output=<path>`: Specify output path
- `--server=<url>`: Change server address (default: `http://localhost:3014`)