# fQRGen MCP Server

fQRGen REST API를 [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) 도구로 제공하는 서버입니다.
AI 에이전트(Claude Code, Claude Desktop 등)에서 QR 코드를 직접 생성할 수 있습니다.

## 전제 조건

fQRGen REST API 서버가 실행 중이어야 합니다:

| 서버              | 실행 방법                                  |
| ----------------- | ------------------------------------------ |
| macOS 네이티브 앱 | fQRGen.app 실행 (설정에서 REST API 활성화) |
| Node.js 웹 앱     | `cd lib/qrgen-node && npm start`           |

기본 서버 주소: `http://localhost:3014`

---

## 설치

### 방법 1: 글로벌 설치 (권장)

```bash
npm install -g fqrgen-mcp
```

[![npm](https://img.shields.io/npm/v/fqrgen-mcp)](https://www.npmjs.com/package/fqrgen-mcp)

### 방법 2: npx (설치 없이 바로 실행)

별도 설치 없이 MCP 설정에서 `npx`로 직접 실행합니다.

### 방법 3: 소스에서 직접 실행

```bash
git clone https://github.com/nowage/fQRGen.git
cd fQRGen_public/mcp
npm install
```

---

## 설정

### Claude Code

* `~/.claude/settings.json` 또는 프로젝트 `.claude/settings.json`에 추가:
  - Claude Desktop의 경우 `~/Library/Application Support/Claude/claude_desktop_config.json`에 추가:  
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

* 소스에서 직접 실행 했다면:
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

* 서버 주소를 변경하려면:
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

### 글로벌 설치 후 사용

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

## 제공 도구 (Tools)

### 1. `health_check`

fQRGen 서버 상태를 확인합니다.

**파라미터**: 없음

**응답 예시**:
```json
{
  "status": "ok",
  "app": "fQRGen",
  "port": 3014
}
```

---

### 2. `generate_qr`

텍스트 또는 URL로 QR 코드를 생성합니다.

**파라미터**:

| 이름        | 타입               | 필수   | 기본값                  | 설명                      |
| ----------- | ------------------ | ------ | ----------------------- | ------------------------- |
| `data`      | string             | 아니오 | `"https://example.com"` | QR 코드에 인코딩할 데이터 |
| `format`    | `"png"` \| `"svg"` | 아니오 | `"png"`                 | 출력 형식                 |
| `save_path` | string             | 아니오 | -                       | 파일 저장 경로            |

**동작**:
- `save_path` 지정 시: 파일로 저장하고 경로를 반환
- `format=svg`: SVG XML 문자열을 텍스트로 반환
- `format=png`: Base64 인코딩된 PNG 이미지를 반환

**사용 예시** (Claude에게 요청):
```
"https://finfra.kr" QR 코드를 PNG로 생성해서 ~/Downloads/finfra-qr.png에 저장해줘
```

---

### 3. `generate_qr_batch`

여러 개의 QR 코드를 일괄 생성합니다.

**파라미터**:

| 이름                | 타입               | 필수   | 설명                  |
| ------------------- | ------------------ | ------ | --------------------- |
| `items`             | array              | 예     | QR 코드 목록          |
| `items[].data`      | string             | 예     | 인코딩할 데이터       |
| `items[].format`    | `"png"` \| `"svg"` | 아니오 | 출력 형식 (기본: png) |
| `items[].save_path` | string             | 예     | 저장 경로             |

**사용 예시** (Claude에게 요청):
```
다음 URL들을 QR 코드로 만들어줘:
- https://finfra.kr → ~/Downloads/finfra.png
- https://github.com → ~/Downloads/github.png
- https://example.com → ~/Downloads/example.png
```

---

## 디버깅

### MCP Inspector로 테스트

```bash
npx @modelcontextprotocol/inspector npx fqrgen-mcp
```

브라우저에서 Inspector UI가 열리며, 각 도구를 직접 테스트할 수 있습니다.

### 서버 연결 확인

```bash
# fQRGen REST API 서버가 실행 중인지 확인
curl http://localhost:3014/
```

---

## npm 배포

```bash
cd mcp
npm publish
```

---

## 아키텍처

```
Claude Code / Claude Desktop
    │
    │ MCP (stdio)
    ▼
fqrgen-mcp (이 서버)
    │
    │ HTTP (REST API)
    ▼
fQRGen Server (localhost:3014)
    ├── macOS 네이티브 앱 (Swift)
    └── Node.js 웹 앱 (Express)
```

---

## 라이선스

MIT
