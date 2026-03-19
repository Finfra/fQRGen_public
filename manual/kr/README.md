# fQRGen 사용자 가이드

fQRGen은 텍스트, URL, 연락처, WiFi 정보 등을 QR 코드로 변환하는 프로젝트입니다. 두 가지 독립적인 구현을 포함합니다:

- **macOS 네이티브 앱 (fQRGen.app)**: SwiftUI 기반 데스크톱 앱, 내장 REST API 서버 포함
- **Node.js 웹 앱 (lib/qrgen-node)**: Express.js 기반 웹 앱, 브라우저에서 접속하여 QR 생성

---

## 빠른 시작

### macOS 네이티브 앱

1. Xcode에서 `fQRGen/fQRGen.xcodeproj` 열기
2. `Cmd+R`로 빌드 및 실행
3. 입력 필드에 텍스트 또는 URL 입력 후 "QR 코드 생성" 클릭
4. 요구사항: macOS 12.0 (Monterey) 이상

### Node.js 웹 앱

```bash
cd lib/qrgen-node
npm install
npm run dev        # 개발 모드 (포트 3014)
```

브라우저에서 `http://localhost:3014` 접속

---

## 주요 기능

### QR 코드 생성
- 지원 데이터 유형: 일반 텍스트, URL, 이메일 (`mailto:`), 전화번호 (`tel:`), WiFi, SMS, vCard
- 출력 포맷: PNG (래스터), SVG (벡터)
- 크기 조절: 5x ~ 20x 배율
- 오류 정정 레벨: L (7%), M (15%), Q (25%), H (30%)

### macOS 앱 전용 기능
- **히스토리**: QR 코드 자동 저장, 검색 및 상세보기
- **메뉴바**: 앱 윈도우 없이 시스템 메뉴바에서 빠른 QR 생성
- **공유**: macOS 네이티브 공유 (AirDrop, 메일, 메시지 등)
- **저장 옵션**: 파일 저장, Downloads 폴더 자동 저장, 클립보드 복사

### 단축키 (macOS 앱)

| 단축키 | 동작 |
|--------|------|
| `Cmd+1` | QR 생성 탭 |
| `Cmd+2` | 히스토리 탭 |
| `Cmd+3` | 설정 탭 |
| `Cmd+Q` | 종료 |

---

## REST API

macOS 앱과 Node.js 웹 앱 모두 프로그래밍 방식의 QR 코드 생성을 위한 REST API를 제공합니다.

### 서버 상태 확인

```bash
curl http://localhost:3014/
```

응답: `{"status":"ok","app":"fQRGen","port":3014}`

### QR 코드 생성

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

# 크기 배율 지정
curl -X POST http://localhost:3014/api/generate \
  -H "Content-Type: application/json" \
  -d '{"data":"https://example.com","scale":15}' \
  -o qrcode_large.png
```

### API 파라미터

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| `data` | String | O | - | QR 코드에 인코딩할 텍스트 또는 URL |
| `format` | String | X | `png` | 출력 포맷 (`png`, `svg`) |
| `scale` | Int | X | `10` | 이미지 크기 배율 (5~20, macOS 앱 전용) |

### 에러 응답

| 상태 코드 | 응답 | 원인 |
|-----------|------|------|
| `400` | `{"error":"Invalid JSON"}` | 잘못된 JSON 형식 |
| `403` | `{"error":"Forbidden"}` | CIDR 허용 범위 외 IP 접근 (macOS 앱) |
| `404` | `{"error":"Not Found"}` | 존재하지 않는 경로 |
| `500` | `{"error":"..."}` | QR 생성 내부 오류 |

---

## 보안 (macOS 앱 REST API)

- REST API 서버는 기본적으로 **비활성화(OFF)** 상태이며, 설정에서 명시적으로 활성화해야 동작
- 기본 바인딩: **localhost 전용** (127.0.0.1)
- CIDR 기반 외부 접속 제어 (예: `192.168.0.0/24`)
- 허용되지 않은 IP는 `403 Forbidden` 응답

---

## 관련 문서

- [기능 명세서](../FunctionalSpecification.md)
- [참조 아젠다](../ReferenceAgenda.md)
- [용어 사전](../Glossary.md)
