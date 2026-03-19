# fQRGen REST API 문서

## 개요

fQRGen은 텍스트, URL 등의 데이터를 QR 코드로 변환하는 REST API를 제공합니다.

| 서버 구현 | 기술 스택 | 기본 포트 |
|-----------|-----------|-----------|
| macOS 네이티브 앱 | Swift / Network.framework (NWListener) | 3014 |
| Node.js 웹 앱 | Express.js / `qrcode` 패키지 | 3014 |

두 서버 모두 **동일한 API 엔드포인트** (`POST /api/generate`)를 제공합니다.

> OpenAPI 3.0 스펙: [openapi.yaml](./openapi.yaml)

---

## 보안

- API 서버는 **기본적으로 비활성화** 상태이며, 설정에서 명시적으로 활성화해야 합니다.
- 기본적으로 **localhost (127.0.0.1)** 연결만 허용됩니다.
- 설정의 "외부 접근 허용" 체크박스를 통해 외부 접근을 활성화할 수 있으며, 허용할 IP 범위를 CIDR 형식(예: `192.168.0.0/24`)으로 지정할 수 있습니다.
- 허용된 CIDR 범위 밖의 IP에서 접속 시 `403 Forbidden` 응답을 반환합니다.
- localhost는 CIDR 설정과 관계없이 항상 허용됩니다.

---

## 엔드포인트

### 1. 서버 상태 확인

```
GET /
```

**응답** (macOS 앱):
```json
{
  "status": "ok",
  "app": "fQRGen",
  "port": 3014
}
```

**응답** (Node.js): 웹 UI 페이지 (HTML)

---

### 2. QR 코드 생성

```
POST /api/generate
Content-Type: application/json
```

#### 요청 파라미터

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `data` | string | 아니오 | `"https://example.com"` | QR 코드에 인코딩할 데이터 |
| `format` | string | 아니오 | `"png"` | 출력 형식: `"png"` 또는 `"svg"` |
| `scale` | integer | 아니오 | `10` | QR 이미지 크기 배율 (5~20) |

#### 요청 예시

```json
{
  "data": "https://finfra.kr",
  "format": "png"
}
```

빈 본문 `{}` 전송 시 기본값이 적용됩니다.

#### 응답

**성공 (200)**:

| format | Content-Type | 본문 |
|--------|-------------|------|
| `png` | `image/png` | PNG 바이너리 |
| `svg` | `image/svg+xml` | SVG XML 문자열 |

**에러**:

| 상태 코드 | 원인 | 응답 예시 |
|-----------|------|-----------|
| 400 | JSON 파싱 실패 | `{"error": "Invalid JSON"}` |
| 403 | 허용되지 않은 IP | `{"error": "Forbidden"}` |
| 404 | 잘못된 경로 | `{"error": "Not Found"}` |
| 500 | QR 생성 실패 | `{"error": "QR 코드 생성 중 오류 발생"}` |

---

### 3. QR 이미지 다운로드 (Node.js 전용)

```
GET /download/:filename
```

웹 UI에서 생성된 QR 이미지를 다운로드합니다.

---

## 사용 예시

### cURL

```bash
# PNG 생성
curl -X POST http://localhost:3014/api/generate \
  -H "Content-Type: application/json" \
  -d '{"data": "https://finfra.kr", "format": "png"}' \
  -o qr.png

# SVG 생성
curl -X POST http://localhost:3014/api/generate \
  -H "Content-Type: application/json" \
  -d '{"data": "https://finfra.kr", "format": "svg"}' \
  -o qr.svg

# 기본값으로 생성
curl -X POST http://localhost:3014/api/generate \
  -H "Content-Type: application/json" \
  -d '{}' \
  -o qr.png

# 헬스 체크
curl http://localhost:3014/
```

### Node.js 클라이언트

```javascript
const FQRGenClient = require('./lib/qrgen-node/client');

const client = new FQRGenClient('http://localhost:3014');

// 서버 상태 확인
const isAlive = await client.healthCheck();

// QR 생성 (Buffer 반환)
const pngBuffer = await client.generate('https://finfra.kr', 'png');

// QR 생성 후 파일 저장
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

## QR 생성 옵션

서버별 기본 QR 생성 설정:

| 옵션 | macOS 앱 (Swift) | Node.js |
|------|------------------|---------|
| 에러 정정 레벨 | H (High) | H (High) |
| 여백 (margin) | 1 | 1 |
| 스케일 (PNG) | 앱 설정에 따름 (5x~20x) | 10 |
| QR 라이브러리 | CoreImage (`CIQRCodeGenerator`) | `qrcode` npm |

---

## 서버별 차이점

| 기능 | macOS 앱 | Node.js |
|------|---------|---------|
| 포트 변경 | 앱 설정 UI | `PORT` 환경변수 / `--port` CLI 옵션 |
| CORS | `Access-Control-Allow-Origin: *` | 미설정 |
| UI 연동 | REST 요청 시 앱 UI 자동 반영 | 없음 |
| 웹 UI | 없음 | `GET /` 에서 제공 |
| 파일 다운로드 | 없음 | `GET /download/:filename` |

---

## 테스트

```bash
# 자동화 테스트 (6개 항목)
bash api/test-api.sh

# 원격 서버 테스트
bash api/test-api.sh --server=http://192.168.0.10:3014
```

테스트 항목:
1. 메인 페이지 접근 (GET `/`)
2. PNG QR 생성 및 형식 검증
3. SVG QR 생성 및 `<svg>` 태그 검증
4. SVG 콘텐츠 유효성 검증
5. 기본값 적용 (빈 요청)
6. 404 응답 처리
