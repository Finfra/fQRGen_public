# fQRGen 매뉴얼 개요 (Manual Structure Overview)

본 문서는 fQRGen 사용자/개발자 매뉴얼의 상위 구조와 작성 가이드를 정의합니다. 실제 세부 문서는 본 구조에 따라 하위 파일로 확장합니다.

## 목적과 범위
- 대상: macOS 앱 사용자, 웹 인터페이스 사용자, 개발자(API 연동 및 배포)
- 범위: 설치 → 빠른 시작 → 사용자 가이드 → API 레퍼런스 → 부록
- 규칙: 모든 링크는 리포지토리 루트 기준 상대 경로 사용, 한국어 우선

## 프로젝트 구성
fQRGen은 두 가지 독립적인 구현을 포함합니다:
- **macOS 네이티브 앱** (`fQRGen/fQRGen/`): SwiftUI 기반, Apple 표준 프레임워크만 사용, 내장 REST API 서버 포함
- **Node.js 웹 앱** (`lib/qrgen-node/`): Express.js 기반, 브라우저에서 QR 생성

## 디렉토리 구조(제안)
- 01_Overview/
  - Introduction.md: 제품 개요, macOS 앱 및 Node.js 웹 앱의 주요 기능, 기본 개념
- 02_Install/
  - Setup_MacApp.md: macOS 앱 설치 및 실행 가이드 (Xcode 빌드, macOS 12.0+ 요구사항)
  - Setup_WebApp.md: Node.js 버전, 환경 요구사항, `npm install` 가이드
- 03_QuickStart/
  - QuickStart_MacApp.md: macOS 앱 실행 흐름 (Xcode `Cmd+R` 또는 CLI 빌드)
  - QuickStart_WebApp.md: 웹 서버 구동 흐름(`npm run dev`), 로컬 브라우저 접근 가이드
- 04_UserGuide/
  - WebUI.md: 웹 폼을 통한 QR 생성법, 포맷(PNG/SVG) 선택, 다운로드 매뉴얼
    - 참조 이미지: `kr/fQRGen_1.main.png` (메인 화면)
- 05_MacApp/
  - QRGeneration.md: QR 생성 기능 (텍스트, URL, 이메일, 전화, WiFi, SMS, vCard)
  - SizeAndCorrection.md: 크기 조절 (5x~20x 스케일), 오류 정정 레벨 (L/M/Q/H)
  - SaveAndExport.md: 저장 옵션 (파일 선택 저장, Downloads 자동 저장, 클립보드 복사, macOS 공유 서비스)
  - History.md: 히스토리 기능 (UserDefaults 기반 자동 저장, 검색, 삭제)
  - MenuBar.md: 메뉴바 통합 (빠른 QR 생성, 클립보드 연동)
  - Settings.md: 설정 화면 (기본값 관리, REST API 서버 설정, 앱 정보)
- 06_REST_API/
  - MacApp_REST.md: macOS 앱 내장 REST API (NWListener 기반)
    - `GET /` (상태 확인), `POST /api/generate` (QR 생성)
    - CIDR 기반 외부 접속 제어, 포트 및 활성화 설정
  - WebApp_REST.md: Node.js 웹 앱 REST API
    - `POST /api/generate` (QR 생성, PNG/SVG 지원)
  - API_Comparison.md: macOS 앱 REST API와 Node.js 웹 앱 REST API 차이점 비교
- 07_Localization/
  - Localization.md: 다국어 지원 가이드 (ko, en, ja, de, es, fr, zh-Hans, zh-Hant)
- 08_Reference/
  - API_Endpoints.md: 전체 API 엔드포인트 명세 및 JSON Payload 예시
    - 참조: `ReferenceAgenda.md`
- 09_FAQ/
  - FAQ.md: 자주 묻는 질문 (포트 충돌 해결, SVG 이미지 깨짐 현상, 접근성 권한 등)
- 99_Appendix/
  - Glossary.md: 용어 사전(프로젝트 용어 통일)
    - 참조: `Glossary.md`

## 작성 가이드
- 파일/제목 규칙: 폴더별 주제 중심, 명사형 제목 사용
- 링크 정책: 문서 간 교차 참조는 상대 경로 사용
- 스크린샷/캡처: `manual/en/` 및 `manual/kr/` 하위의 `fQRGen.capture` 지원 리소스 활용

## 빠른 시작(요약)

### macOS 네이티브 앱
- **Xcode 실행**: 프로젝트 파일 `fQRGen/fQRGen.xcodeproj` 열기 → `Cmd+R`
- **CLI 빌드**: `xcodebuild -scheme fQRGen -configuration Debug build`
- **요구사항**: macOS 12.0 (Monterey) 이상, Swift 5.7+
- 앱 실행 후 텍스트 입력 → QR 코드 즉시 생성
- 내장 REST API 서버: 설정에서 활성화 후 `http://localhost:<포트>` 접근

### Node.js 웹 앱
- 패키지 설치: `cd lib/qrgen-node && npm install`
- 개발 모드 구동: `npm run dev` (nodemon 기반 포트 3014 실행)
- 프로덕션 구동: `npm start`
- 웹 접속: `http://localhost:3014`

## REST API 비교

| 항목 | macOS 앱 내장 REST API | Node.js 웹 앱 REST API |
|------|----------------------|----------------------|
| 기반 기술 | NWListener (Network.framework) | Express.js |
| QR 생성 엔진 | CoreImage (`CIQRCodeGenerator`) | `qrcode` npm 패키지 |
| 엔드포인트 | `GET /`, `POST /api/generate` | `POST /api/generate` |
| 출력 형식 | PNG (scale 파라미터 지원) | PNG, SVG |
| 접근 제어 | CIDR 기반 외부 접속 제어 | 없음 |
| UI 연동 | 입력란 자동 연동, QR 생성 트리거 | 독립적 웹 인터페이스 |
| 포트 설정 | 설정 화면에서 동적 변경 | `server.js` 내 고정 (기본 3014) |

## 향후 작성 일정(To-Do)
- [ ] 01_Overview/Introduction.md 초안 구성 (macOS 앱 + Node.js 웹 앱 통합 소개)
- [ ] 02_Install/Setup_MacApp.md (macOS 앱 설치 및 빌드 가이드)
- [ ] 03_QuickStart/QuickStart_MacApp.md (macOS 앱 스크린샷 포함)
- [ ] 03_QuickStart/QuickStart_WebApp.md (웹 앱 스크린샷 포함)
- [ ] 05_MacApp/ 섹션 전체 문서 작성
- [ ] 06_REST_API/API_Comparison.md (REST API 비교 문서)
- [ ] 07_Localization/Localization.md (다국어 지원 가이드)
- [ ] 08_Reference/API_Endpoints.md (curl 테스트 예제 추가)

## 관련 문서(핵심 링크)
- 참조 아젠다: `ReferenceAgenda.md`
- 프로젝트 정보: `GEMINI.md`
