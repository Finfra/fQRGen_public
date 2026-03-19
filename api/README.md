# fQRGen REST API Documentation

## Overview

fQRGen provides a REST API that converts text, URLs, and other data into QR codes.

| Server Implementation | Tech Stack | Default Port |
|----------------------|------------|--------------|
| macOS Native App | Swift / Network.framework (NWListener) | 3014 |
| Node.js Web App | Express.js / `qrcode` package | 3014 |

Both servers provide the **same API endpoint** (`POST /api/generate`).

> OpenAPI 3.0 Spec: [openapi.yaml](./openapi.yaml)

---

## Security

- The API server is **disabled by default** and must be explicitly enabled in Settings.
- By default, only **localhost (127.0.0.1)** connections are accepted.
- External access can be enabled via the "Allow External Access" checkbox in Settings, which unlocks the CIDR input field for specifying an allowed IP range (e.g. `192.168.0.0/24`).
- Connections from IPs outside the allowed CIDR range receive a `403 Forbidden` response.
- localhost is always allowed regardless of CIDR settings.

---

## Endpoints

### 1. Health Check

```
GET /
```

**Response** (macOS App):
```json
{
  "status": "ok",
  "app": "fQRGen",
  "port": 3014
}
```

**Response** (Node.js): Web UI page (HTML)

---

### 2. Generate QR Code

```
POST /api/generate
Content-Type: application/json
```

#### Request Parameters

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `data` | string | No | `"https://example.com"` | Data to encode in the QR code |
| `format` | string | No | `"png"` | Output format: `"png"` or `"svg"` |
| `scale` | integer | No | `10` | QR image size multiplier (5~20) |

#### Request Example

```json
{
  "data": "https://finfra.kr",
  "format": "png"
}
```

Sending an empty body `{}` applies default values.

#### Response

**Success (200)**:

| format | Content-Type | Body |
|--------|-------------|------|
| `png` | `image/png` | PNG binary |
| `svg` | `image/svg+xml` | SVG XML string |

**Error**:

| Status Code | Cause | Response Example |
|-------------|-------|-----------------|
| 400 | JSON parsing failure | `{"error": "Invalid JSON"}` |
| 403 | Unauthorized IP | `{"error": "Forbidden"}` |
| 404 | Invalid path | `{"error": "Not Found"}` |
| 500 | QR generation failure | `{"error": "QR code generation error"}` |

---

### 3. Download QR Image (Node.js Only)

```
GET /download/:filename
```

Downloads a QR image generated via the web UI.

---

## Usage Examples

### cURL

```bash
# Generate PNG
curl -X POST http://localhost:3014/api/generate \
  -H "Content-Type: application/json" \
  -d '{"data": "https://finfra.kr", "format": "png"}' \
  -o qr.png

# Generate SVG
curl -X POST http://localhost:3014/api/generate \
  -H "Content-Type: application/json" \
  -d '{"data": "https://finfra.kr", "format": "svg"}' \
  -o qr.svg

# Generate with defaults
curl -X POST http://localhost:3014/api/generate \
  -H "Content-Type: application/json" \
  -d '{}' \
  -o qr.png

# Health check
curl http://localhost:3014/
```

### Node.js Client

```javascript
const FQRGenClient = require('./lib/qrgen-node/client');

const client = new FQRGenClient('http://localhost:3014');

// Health check
const isAlive = await client.healthCheck();

// Generate QR (returns Buffer)
const pngBuffer = await client.generate('https://finfra.kr', 'png');

// Generate QR and save to file
const filePath = await client.generateAndSave('https://finfra.kr', './qr.png');
```

### Python

```python
import requests

response = requests.post(
    'http://localhost:3014/api/generate',
    json={'data': 'https://finfra.kr', 'format': 'png'}
)

with open('qr.png', 'wb') as f:
    f.write(response.content)
```

---

## QR Generation Options

Default QR generation settings per server:

| Option | macOS App (Swift) | Node.js |
|--------|------------------|---------|
| Error Correction Level | H (High) | H (High) |
| Margin | 1 | 1 |
| Scale (PNG) | Per app settings (5x~20x) | 10 |
| QR Library | CoreImage (`CIQRCodeGenerator`) | `qrcode` npm |

---

## Server Differences

| Feature | macOS App | Node.js |
|---------|----------|---------|
| Port Configuration | App settings UI | `PORT` env var / `--port` CLI option |
| CORS | `Access-Control-Allow-Origin: *` | Not configured |
| UI Integration | REST requests auto-reflect in app UI | None |
| Web UI | None | Served at `GET /` |
| File Download | None | `GET /download/:filename` |

---

## Testing

```bash
# Automated tests (6 items)
bash api/test-api.sh

# Test remote server
bash api/test-api.sh --server=http://192.168.0.10:3014
```

Test items:
1. Main page access (GET `/`)
2. PNG QR generation and format validation
3. SVG QR generation and `<svg>` tag validation
4. SVG content validity check
5. Default value application (empty request)
6. 404 response handling
