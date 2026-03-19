# fQRGen User Guide

fQRGen is a QR code generator project that converts text, URLs, contacts, WiFi credentials, and more into QR codes. It includes two independent implementations:

- **macOS Native App (fQRGen.app)**: A SwiftUI-based desktop application with built-in REST API server
- **Node.js Web App (lib/qrgen-node)**: An Express.js-based web application accessible from any browser

---

## Quick Start

### macOS Native App

1. Open `fQRGen/fQRGen.xcodeproj` in Xcode
2. Press `Cmd+R` to build and run
3. Enter text or URL in the input field and click "Generate QR Code"
4. Requirements: macOS 12.0 (Monterey) or later

### Node.js Web App

```bash
cd lib/qrgen-node
npm install
npm run dev        # Development mode (port 3014)
```

Open `http://localhost:3014` in your browser.

---

## Features

### QR Code Generation
- Supported data types: Plain Text, URL, Email (`mailto:`), Phone (`tel:`), WiFi, SMS, vCard
- Output formats: PNG (raster), SVG (vector)
- Adjustable scale: 5x to 20x
- Error correction levels: L (7%), M (15%), Q (25%), H (30%)

### macOS App Specific
- **History**: Auto-saved QR code history with search and detail view
- **Menu Bar**: Quick QR generation from the system menu bar without opening the app window
- **Share**: Native macOS sharing (AirDrop, Mail, Messages, etc.)
- **Save Options**: Save to file, download to Downloads folder, copy to clipboard

### Keyboard Shortcuts (macOS App)

| Shortcut | Action |
|----------|--------|
| `Cmd+1` | QR Generator tab |
| `Cmd+2` | History tab |
| `Cmd+3` | Settings tab |
| `Cmd+Q` | Quit |

---

## REST API

Both the macOS app and Node.js web app provide a REST API for programmatic QR code generation.

### Health Check

```bash
curl http://localhost:3014/
```

Response: `{"status":"ok","app":"fQRGen","port":3014}`

### Generate QR Code

```bash
# PNG
curl -X POST http://localhost:3014/api/generate \
  -H "Content-Type: application/json" \
  -d '{"data":"https://example.com"}' \
  -o qrcode.png

# SVG
curl -X POST http://localhost:3014/api/generate \
  -H "Content-Type: application/json" \
  -d '{"data":"https://example.com","format":"svg"}' \
  -o qrcode.svg

# With scale
curl -X POST http://localhost:3014/api/generate \
  -H "Content-Type: application/json" \
  -d '{"data":"https://example.com","scale":15}' \
  -o qrcode_large.png
```

### API Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `data` | String | Yes | - | Text or URL to encode |
| `format` | String | No | `png` | Output format (`png`, `svg`) |
| `scale` | Int | No | `10` | Image scale (5-20, macOS app only) |

### Error Responses

| Status | Response | Cause |
|--------|----------|-------|
| `400` | `{"error":"Invalid JSON"}` | Malformed JSON body |
| `403` | `{"error":"Forbidden"}` | IP not in CIDR allowlist (macOS app) |
| `404` | `{"error":"Not Found"}` | Invalid endpoint |
| `500` | `{"error":"..."}` | Internal QR generation error |

---

## Security (macOS App REST API)

- REST API server is **disabled by default** and must be explicitly enabled in Settings
- Default binding: **localhost only** (127.0.0.1)
- CIDR-based access control for external connections (e.g., `192.168.0.0/24`)
- Unauthorized IPs receive `403 Forbidden`

---

## Related Documents

- [Functional Specification](../FunctionalSpecification.md)
- [Reference Agenda](../ReferenceAgenda.md)
- [Glossary](../Glossary.md)
