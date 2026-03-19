---
title: fQRGen 사용자 매뉴얼 및 기능 명세서 (User Manual & Functional Specification)
description: 본 문서는 fQRGen 프로젝트의 두 가지 구현 — macOS 네이티브 앱과 Node.js 웹 앱 — 의 핵심 기능, REST API, 파일 포맷 지원 및 개발 환경에 대한 상세한 가이드를 제공합니다.
date: 2026.03.17
tags: [매뉴얼, 사용자 가이드, 기능 명세]
---

# fQRGen이란? (Overview)

fQRGen은 텍스트, URL, 연락처, WiFi 정보 등을 QR 코드로 변환할 수 있는 프로젝트입니다. 두 가지 독립적인 구현을 포함합니다:

- **macOS 네이티브 앱 (fQRGen.app)**: SwiftUI 기반의 macOS 데스크톱 애플리케이션으로, CoreImage(`CIQRCodeGenerator`)를 활용한 QR 생성, 메뉴바 통합, 히스토리 관리, NWListener 기반 내장 REST API 서버를 제공합니다.
- **Node.js 웹 앱 (lib/qrgen-node)**: Express.js 기반의 웹 애플리케이션으로, 브라우저에서 접속하여 QR 코드를 생성하고 다운로드할 수 있으며, 프로그래밍 방식의 REST API를 지원합니다.

---

# 1. macOS 네이티브 앱 기능 (fQRGen.app)

macOS 12.0 (Monterey) 이상을 지원하는 네이티브 데스크톱 앱으로, Apple 표준 프레임워크만 사용하여 외부 라이브러리 의존성이 없습니다.

## 1.1. QR 코드 생성 화면 (QR Generator)

앱의 메인 화면으로, 다양한 유형의 데이터를 QR 코드로 변환할 수 있습니다.

### 텍스트 입력
사용자는 URL, 텍스트, 연락처 정보 등 자유로운 문자열을 입력 영역에 입력할 수 있습니다. 입력 후 "QR 코드 생성" 버튼을 클릭하면 즉시 QR 코드 이미지가 화면에 표시됩니다.

### 빠른 입력 버튼 (Quick Input)
6종의 빠른 입력 버튼을 제공하여, 자주 사용하는 데이터 유형에 대한 템플릿을 즉시 입력창에 채워줍니다:

| 버튼 | 템플릿 | 용도 |
|------|--------|------|
| **웹사이트** | `https://` | URL 주소 |
| **이메일** | `mailto:` | 이메일 주소 |
| **전화번호** | `tel:` | 전화번호 |
| **WiFi** | `WIFI:T:WPA;S:네트워크명;P:비밀번호;;` | WiFi 접속 정보 |
| **문자메시지** | `sms:` | SMS 문자 |
| **연락처** | vCard 3.0 템플릿 | 연락처 카드(vCard) |

### 고급 설정
- **크기 조절 (Scale)**: 5x ~ 20x 범위의 슬라이더로 QR 코드 이미지 배율을 조절합니다. 기본값은 10x입니다.
- **오류 정정 레벨 (Error Correction Level)**: 4단계 오류 정정 수준을 선택할 수 있습니다.
  - `L` — 낮음 (~7% 복원)
  - `M` — 중간 (~15% 복원)
  - `Q` — 높음 (~25% 복원)
  - `H` — 최고 (~30% 복원, 기본값)

### 결과 액션 버튼
QR 코드 생성 후 다음 4가지 액션을 제공합니다:
- **공유**: macOS 네이티브 공유 시트(`NSSharingServicePicker`)를 통해 AirDrop, 메일, 메시지 등으로 공유
- **저장**: `NSSavePanel`을 통해 원하는 위치에 PNG 파일로 저장
- **복사**: 클립보드에 QR 코드 이미지 복사
- **다운로드**: Downloads 폴더에 자동으로 PNG 파일 저장

## 1.2. 히스토리 (History)

생성된 모든 QR 코드는 `UserDefaults` 기반으로 자동 저장되며, 히스토리 탭에서 관리할 수 있습니다.

- **목록 표시**: QR 코드 미리보기 썸네일, 원본 텍스트, 생성 날짜를 카드 형태로 표시
- **검색**: 히스토리 내 텍스트 기반 검색 (대소문자 무시, `localizedCaseInsensitiveContains`)
- **상세보기**: 개별 항목 클릭 시 QR 코드 확대 이미지, 원본 텍스트, 생성 시간을 시트(Sheet)로 표시
- **액션**: 상세보기에서 공유, 저장, 클립보드 복사 가능
- **삭제**: 개별 삭제 및 전체 삭제 지원 (전체 삭제 시 확인 대화상자 표시)

## 1.3. 설정 (Settings)

3열 레이아웃으로 구성된 설정 화면입니다.

### 1열: 기본 설정 + 히스토리 관리
- **기본 QR 코드 크기**: 5 ~ 20 범위 슬라이더 (기본값: 10)
- **기본 오류 정정 레벨**: L / M / Q / H 선택 (기본값: H)
- **언어 설정**: 8개 언어 지원
  - 한국어, English, 日本語, Deutsch, Espanol, Francais, 简体中文, 繁體中文
- **히스토리 관리**: 저장된 QR 코드 수 표시, 전체 삭제 버튼

### 2열: 앱 정보 + REST API 서버
- **앱 정보**: 버전(1.0.0), 개발자(nowage), 출시일(2025.06.15), GitHub 저장소 링크
- **REST API 서버 설정**: (아래 섹션 2에서 상세 설명)

### 3열: 지원 기능 요약
PNG 이미지 내보내기, 크기 조절, 오류 정정 레벨, 클립보드 복사, macOS 공유 서비스, 생성 히스토리, REST API 서버 등 주요 기능을 아이콘과 함께 목록으로 표시합니다.

## 1.4. 메뉴바 통합 (Menu Bar)

앱 윈도우 없이도 시스템 메뉴바에서 빠르게 QR 코드를 생성할 수 있습니다.

- **빠른 QR 생성**: 텍스트 입력 대화상자를 통해 즉시 QR 코드를 생성하고 Downloads 폴더에 자동 저장
- **클립보드에서 QR 생성**: 현재 클립보드에 복사된 텍스트를 읽어 QR 코드를 생성하고 Downloads 폴더에 자동 저장
- **앱 열기**: 메인 윈도우 활성화
- **종료**: 앱 종료 (`Cmd+Q`)

메뉴바 아이콘은 macOS 11.0 이상에서 SF Symbols의 `qrcode` 아이콘을 사용하며, 이전 버전에서는 "QR" 텍스트로 표시됩니다.

## 1.5. 공유 서비스 (Share Service)

macOS 네이티브 `NSSharingServicePicker`를 활용하여 생성된 QR 코드 이미지와 원본 텍스트를 시스템 공유 시트를 통해 다른 앱이나 서비스로 전달할 수 있습니다.

---

# 2. 내장 REST API 서버 (macOS 앱)

fQRGen.app에 내장된 NWListener(`Network.framework`) 기반 HTTP REST 서버로, 외부 프로그램에서 QR 코드를 프로그래밍 방식으로 생성할 수 있습니다.

## 2.1. 보안 정책

### 기본 접근 제어
- REST API 서버는 기본적으로 **비활성화(OFF)** 상태이며, 사용자가 설정에서 명시적으로 활성화해야 동작합니다.
- 기본 수신 범위는 **localhost(127.0.0.1)** 전용으로, 외부 네트워크에서의 접근은 차단됩니다.

### CIDR 기반 외부 접속 제어
- 설정 화면에서 **"외부 접속 허용"** 체크박스를 활성화하면 CIDR 입력 필드를 수정할 수 있습니다.
- CIDR 표기법으로 허용할 IP 범위를 지정합니다 (예: `192.168.0.0/24`, `10.0.0.0/8`).
- **외부 접속 허용이 꺼진 상태**: localhost만 접근 가능 (loopback 인터페이스만 바인딩, CIDR 필드 비활성화).
- **외부 접속 허용이 켜진 상태**: CIDR 범위 + localhost 접근 가능.
- 허용 범위에 해당하지 않는 IP는 `403 Forbidden` 응답을 받습니다.
- CIDR 유효성 검증이 실시간으로 수행되며, 잘못된 형식 입력 시 경고 메시지가 표시됩니다.

## 2.2. 기본 설정

| 항목 | 기본값 | 비고 |
|------|--------|------|
| **기본 포트** | `3014` | 설정 화면에서 변경 가능 |
| **API 활성화 상태** | `꺼짐 (OFF)` | 사용자가 설정에서 명시적으로 활성화해야 동작 |
| **외부 접속 허용** | `꺼짐 (OFF)` | 체크 시 CIDR 입력 가능 |
| **허용 CIDR** | `192.168.0.0/24` | 외부 접속 허용 시 기본 범위 |

## 2.3. 엔드포인트

### `GET /` — 서버 상태 확인

서버가 정상 동작 중인지 확인합니다.

**응답 예시:**
```json
{"status":"ok","app":"fQRGen","port":3014}
```

### `POST /api/generate` — QR 코드 생성

JSON Body로 QR 코드 생성을 요청합니다.

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| `data` | String | O | `https://example.com` | QR 코드에 인코딩할 텍스트 또는 URL |
| `format` | String | X | `png` | 출력 포맷 (`png`, `svg`) |
| `scale` | Int | X | `10` | QR 이미지 크기 배율 (5~20) |

**요청 예시:**
```json
{
  "data": "https://finfra.kr",
  "format": "png",
  "scale": 15
}
```

**응답:**
- `format=png`: `image/png` Content-Type의 바이너리 PNG 데이터
- `format=svg`: `image/svg+xml` Content-Type의 SVG 문자열

## 2.4. UI 연동

REST API를 통해 QR 코드가 생성되면, `RESTGenerateRequest` Notification이 발행되어 메인 UI의 입력란에 요청 텍스트가 자동 반영되고 QR 생성이 트리거됩니다. 이를 통해 REST API 호출 결과가 히스토리에도 자동 저장됩니다.

## 2.5. curl 사용 예시

```bash
# 서버 상태 확인
curl http://localhost:3014/

# PNG QR 코드 생성
curl -X POST http://localhost:3014/api/generate \
  -H "Content-Type: application/json" \
  -d '{"data":"https://finfra.kr"}' \
  -o qrcode.png

# SVG QR 코드 생성
curl -X POST http://localhost:3014/api/generate \
  -H "Content-Type: application/json" \
  -d '{"data":"https://finfra.kr","format":"svg"}' \
  -o qrcode.svg

# 크기 배율 지정
curl -X POST http://localhost:3014/api/generate \
  -H "Content-Type: application/json" \
  -d '{"data":"https://finfra.kr","scale":15}' \
  -o qrcode_large.png

# WiFi 접속 정보
curl -X POST http://localhost:3014/api/generate \
  -H "Content-Type: application/json" \
  -d '{"data":"WIFI:T:WPA;S:MyNetwork;P:mypassword;;"}' \
  -o wifi.png

# vCard (연락처)
curl -X POST http://localhost:3014/api/generate \
  -H "Content-Type: application/json" \
  -d '{"data":"BEGIN:VCARD\nVERSION:3.0\nFN:홍길동\nTEL:010-1234-5678\nEND:VCARD"}' \
  -o contact.png
```

### 에러 응답

| 상태 코드 | 응답 | 원인 |
|-----------|------|------|
| `400` | `{"error":"Invalid JSON"}` | 잘못된 JSON 형식 |
| `403` | `{"error":"Forbidden"}` | CIDR 범위 외 IP에서 접근 |
| `404` | `{"error":"Not Found"}` | 존재하지 않는 경로 |
| `500` | `{"error":"QR 코드 PNG 생성 실패"}` | QR 생성 내부 오류 |

---

# 3. Node.js 웹 앱 기능 (lib/qrgen-node)

Node.js 및 Express 기반의 웹 애플리케이션으로, 브라우저에서 접속하여 QR 코드를 생성하고 다운로드할 수 있습니다. 포트 3014에서 동작합니다.

## 3.1. 웹 인터페이스 (Web Interface)

설치 과정이나 복잡한 설정 없이, 브라우저에 접속하는 것만으로 QR 코드 생성 경험을 제공합니다.

### 직관적인 변환 폼 (Transform Form)
사용자는 제공된 입력창에 텍스트 또는 URL 주소를 자유롭게 입력할 수 있습니다. 폼이 제출되면 EJS 렌더링에 의해 화면 갱신 후 즉시 결과 QR 코드 이미지가 화면에 시각화됩니다.

<!-- 스크린샷: fQRGen 한국어 메인 생성 인터페이스 (kr/fQRGen_1.main.png) -->

### 무손실 벡터 / 래스터 포맷 지원 (Format Export)
사용 목적에 맞게 두 가지 이미지 포맷 타입을 직접 골라 생성할 수 있습니다.
- **PNG (Portable Network Graphics)**: 이메일 템플릿, 일반 웹 문서 및 소셜 미디어 공유 등 래스터화된 일반적 용도에 최적화된 고해상도 이미지를 제공합니다.
- **SVG (Scalable Vector Graphics)**: 인쇄물(브로셔, 전단지, 출판물) 및 크기가 가변적으로 변하는 고품질 그래픽 디자인 작업 시 깨짐(픽셀화)이 발생하지 않는 벡터 원본 포맷을 생성합니다.

### 원클릭 물리적 파일 다운로드 (Direct Download)
화면에 생성된 QR 코드 리소스를 전용 다운로드 버튼 또는 파일 제공 기능을 통해 사용자의 기기 저장소(`public/qr/`에 생성된 캐시 기반)로 즉시 다운로드 가능합니다.

## 3.2. REST API (Node.js)

Node.js 웹 앱 역시 프로그래밍 방식의 QR 생성을 위한 REST API를 제공합니다.

### `POST /api/generate`
JSON Body를 통해 QR 코드 이미지 바이너리(PNG) 또는 SVG 문자열을 반환받습니다.

```json
{
  "data": "https://example.com/promotion/123",
  "format": "png"
}
```

`body-parser` 미들웨어를 통해 입력 데이터의 유효성을 검사하고, 명확한 상태 코드를 반환합니다.

---

# 4. REST 클라이언트 라이브러리 (`lib/qrgen-node`)

fQRGen 서버에 접속하여 QR 코드를 생성하는 Node.js 클라이언트 라이브러리입니다. MCP 서버, 스킬, 자동화 스크립트 등에서 공통으로 사용할 수 있는 기반 모듈입니다.

## 4.1. 사전 조건

fQRGen 서버가 실행 중이어야 합니다:
```bash
npm start          # 프로덕션 (포트 3014)
npm run dev        # 개발 모드 (nodemon 자동 재시작)
```

## 4.2. 클라이언트 초기화

```javascript
const { FQRGenClient } = require('./lib/qrgen-node/client');
const client = new FQRGenClient('http://localhost:3014');
```

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `baseUrl` | string | `http://localhost:3014` | fQRGen 서버 주소 |

## 4.3. QR 코드 생성 (`generate`)

서버로부터 QR 코드 이미지를 Buffer(PNG) 또는 문자열(SVG)로 직접 수신합니다.

```javascript
// PNG Buffer 수신
const pngBuffer = await client.generate('https://finfra.kr', 'png');

// SVG 문자열 수신
const svgString = await client.generate('https://finfra.kr', 'svg');
```

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `data` | string | (필수) | QR 인코딩할 텍스트 또는 URL |
| `format` | `'png'` \| `'svg'` | `'png'` | 출력 이미지 형식 |

## 4.4. QR 코드 생성 후 파일 저장 (`generateAndSave`)

생성된 QR 코드를 지정한 경로에 파일로 저장합니다. `format`을 생략하면 파일 확장자에서 자동 추론합니다.

```javascript
// 확장자로 형식 자동 추론
const savedPath = await client.generateAndSave('https://finfra.kr', './output.png');

// 명시적 형식 지정
const svgPath = await client.generateAndSave('https://finfra.kr', './output.svg', 'svg');
```

## 4.5. 서버 상태 확인 (`healthCheck`)

```javascript
const isAlive = await client.healthCheck();
if (!isAlive) {
  console.error('서버에 연결할 수 없습니다');
}
```

## 4.6. CLI 예제 실행

```bash
# 기본 실행 (https://finfra.kr -> /tmp/fqrgen-test.png)
node lib/qrgen-node/example.js

# URL 지정 + SVG 형식
node lib/qrgen-node/example.js "https://github.com" --format=svg

# 저장 경로 지정
node lib/qrgen-node/example.js "Hello World" --output=./my-qr.png

# 원격 서버 지정
node lib/qrgen-node/example.js --server=http://remote-server:3014
```

## 4.7. curl 직접 호출 (참고)

클라이언트 라이브러리 없이 curl로 직접 API를 호출할 수도 있습니다:

```bash
# PNG 생성
curl -X POST http://localhost:3014/api/generate \
  -H 'Content-Type: application/json' \
  -d '{"data":"https://finfra.kr","format":"png"}' \
  --output qr.png

# SVG 생성
curl -X POST http://localhost:3014/api/generate \
  -H 'Content-Type: application/json' \
  -d '{"data":"https://finfra.kr","format":"svg"}' \
  --output qr.svg
```

---

# 5. 개발 및 운영 환경 (Development & Operations)

## 5.1. macOS 네이티브 앱

| 항목 | 상세 |
|------|------|
| **언어** | Swift 5.7+ |
| **UI 프레임워크** | SwiftUI |
| **QR 생성** | CoreImage (`CIQRCodeGenerator`) |
| **네트워크** | Network.framework (`NWListener`) |
| **데이터 저장** | UserDefaults, @AppStorage |
| **외부 라이브러리** | 없음 (Apple 표준 프레임워크만 사용) |
| **배포 타겟** | macOS 12.0 (Monterey) 이상 |
| **번들 ID** | `kr.finfra.fQRGen` |
| **빌드** | Xcode `Cmd+B` 또는 `xcodebuild -scheme fQRGen -configuration Debug build` |
| **실행** | Xcode `Cmd+R` |

## 5.2. Node.js 웹 앱

| 항목 | 상세 |
|------|------|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Template Engine** | EJS (Embedded JavaScript) |
| **Libraries** | `qrcode` (생성), `body-parser` (요청 파싱) |
| **Dev Tools** | `nodemon` (파일 변동 감지 자동 핫-리로딩) |
| **기본 포트** | 3014 |
| **설치** | `cd lib/qrgen-node && npm install` |
| **개발 서버** | `npm run dev` (nodemon, 포트 3014) |
| **프로덕션** | `npm start` |

### EJS 템플릿 환경
UI 렌더링은 정적 자산(`lib/qrgen-node/public/`)과 동적 서버-사이드 파라미터를 유연하게 결합하는 EJS 엔진에 의해 제어됩니다. 이로써 다국어 지원, 혹은 타 플랫폼으로 앱 내 마이그레이션 도중 화면 분기 처리가 매우 손쉬워집니다.
