# Skill: Generate QR Code via fQRGen API

## Description
This skill enables the agent to interact with the fQRGen REST API to generate QR codes dynamically when the app is running.

## Instructions
1. **Endpoint**: `POST http://localhost:3014/api/generate` (adjust port if the user specified a different one).
2. **Headers**: `Content-Type: application/json`
3. **Payload**: 
   - `data` (string, required): The text or URL to encode.
   - `format` (string, optional): "png" or "svg". Default is "png".
   - `scale` (integer, optional): Size multiplier between 5 and 20. Default is 10.
4. **Execution**: Use the `run_shell_command` tool with `curl`.
   - For PNG: `curl -s -X POST http://localhost:3014/api/generate -H "Content-Type: application/json" -d '{"data":"<TEXT>","format":"png"}' --output <FILENAME>.png`
   - For SVG: `curl -s -X POST http://localhost:3014/api/generate -H "Content-Type: application/json" -d '{"data":"<TEXT>","format":"svg"}' --output <FILENAME>.svg`

## Example Usage
```bash
curl -s -X POST http://localhost:3014/api/generate \
  -H "Content-Type: application/json" \
  -d '{"data": "https://finfra.kr", "format": "png", "scale": 10}' \
  --output my_qrcode.png
```