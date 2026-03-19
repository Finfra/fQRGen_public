# fQRGen 참조 아젠다 (Reference Agenda)

fQRGen 프로젝트의 전체 기능과 구조를 체계적으로 정리한 참조 문서입니다.
macOS 네이티브 앱과 Node.js 웹 앱 두 가지 구현을 모두 포함합니다.

---

## 1. 프로젝트 구조 (Project Structure)

### 1-1. macOS 네이티브 앱 (SwiftUI)
- 기술 스택: Swift 5.7+, SwiftUI, CoreImage, AppKit, Network.framework
- 번들 ID: `kr.finfra.fQRGen`
- 배포 타겟: macOS 12.0 (Monterey) 이상
- 외부 라이브러리 없음 (Apple 표준 프레임워크만 사용)
- 주요 파일 구조:
  - `fQRGenApp.swift`: 앱 진입점, MenuBarManager 초기화
  - `ContentView.swift`: 메인 컨테이너 (MainTabView 래퍼)
  - `MainTabView.swift`: 탭 네비게이션 (QR 생성 / 히스토리 / 설정)
  - `QRGeneratorView.swift`: QR 생성 메인 화면
  - `QRCodeGenerator.swift`: QR 생성 로직, 파일 저장
  - `RESTServer.swift`: NWListener 기반 REST API 서버

### 1-2. Node.js 웹 앱 (Express.js)
- 기술 스택: Node.js, Express.js, EJS, `qrcode` 패키지
- 기본 포트: 3014
- 주요 파일 구조:
  - `server.js`: REST API 서버
  - `client.js`: REST API 클라이언트 라이브러리
  - `views/index.ejs`: 메인 UI 템플릿
  - `public/`: 정적 에셋 (CSS, JS, QR 이미지)

### 1-3. 공통 도구 및 테스트
- `lib/rest/test-api.sh`: REST API 테스트 스크립트
- `claude_agent_file/`: Claude Code 에이전트 배포용 파일

---

## 2. macOS 네이티브 앱 기능 (Mac App Features)

### 2-1. QR 코드 생성 (QR Generation)
- 지원 데이터 유형:
  - 일반 텍스트 (Plain Text)
  - URL (웹 주소)
  - 이메일 (`mailto:` 스킴)
  - 전화번호 (`tel:` 스킴)
  - WiFi 접속 정보
  - SMS 메시지
  - vCard 연락처
- 생성 엔진: CoreImage `CIQRCodeGenerator` 필터
- 실시간 미리보기: 입력 시 즉시 QR 코드 갱신

### 2-2. 크기 및 오류 정정 (Size & Error Correction)
- 크기 조절: 5x ~ 20x 스케일 슬라이더
- 오류 정정 레벨:
  - L (Low, ~7% 복원)
  - M (Medium, ~15% 복원)
  - Q (Quartile, ~25% 복원)
  - H (High, ~30% 복원)

### 2-3. 저장 및 내보내기 (Save & Export)
- 파일 선택 저장: NSSavePanel을 통한 사용자 지정 경로 저장
- Downloads 자동 저장: 한 번의 클릭으로 다운로드 폴더에 저장
- 클립보드 복사: QR 이미지를 클립보드에 직접 복사
- macOS 공유 서비스: NSSharingServicePicker를 통한 네이티브 공유 (메일, AirDrop, 메시지 등)

### 2-4. 히스토리 (History)
- UserDefaults 기반 자동 저장
- 생성된 QR 코드 목록 조회
- 키워드 검색 기능
- 개별/전체 삭제 기능
- 히스토리 항목 선택 시 상세 보기

### 2-5. 메뉴바 통합 (Menu Bar Integration)
- 메뉴바 아이콘을 통한 빠른 QR 생성
- 클립보드 내용으로 즉시 QR 코드 생성
- 앱 메인 창을 열지 않고도 사용 가능

### 2-6. 설정 (Settings)
- 기본값 관리 (크기, 오류 정정 레벨 등)
- REST API 서버 설정 (포트, 활성화, 외부 접속 허용)
- 앱 정보 표시

---

## 3. 내장 REST API 서버 (Built-in REST API Server)

### 3-1. 서버 아키텍처 (NWListener 기반)
- Network.framework의 `NWListener`를 사용한 경량 HTTP 서버
- macOS 앱에 내장되어 별도 서버 설치 불필요
- 설정 화면에서 포트 번호 및 활성화 상태 동적 변경

### 3-2. API 엔드포인트 (Endpoints)
- `GET /`: 서버 상태 확인 (Health Check)
- `POST /api/generate`: QR 코드 생성
  - 요청 파라미터: `data` (QR 데이터), `scale` (크기 배율)
  - 응답: PNG 이미지 바이너리
  - UI 입력란과 자동 연동 (API 요청 시 앱 UI에도 반영)

### 3-3. CIDR 기반 외부 접속 제어 (Access Control)
- CIDR 표기법으로 허용 IP 대역 설정 (예: `192.168.1.0/24`)
- 외부 접속 허용/차단 토글
- 설정 화면에서 접근 제어 규칙 관리
- 허용되지 않은 IP의 요청은 자동 거부

### 3-4. REST API 서버 설정 항목
- 서버 활성화 여부 (Enable/Disable)
- 리스닝 포트 번호
- 외부 접속 허용 여부
- CIDR 허용 목록

---

## 4. Node.js 웹 앱 기능 (Web App Features)

### 4-1. 웹 인터페이스 (Web Interface)
- EJS 템플릿 기반 반응형 UI
- 텍스트/URL 입력 폼
- 실시간 QR 코드 미리보기

### 4-2. QR 코드 생성 및 포맷 (Generation & Formats)
- PNG 래스터 이미지 다운로드
- SVG 벡터 이미지 지원
- 데이터 크기에 따른 QR 복잡도 자동 조절

### 4-3. REST API (Web App API)
- `POST /api/generate`: QR 코드 프로그래밍 방식 생성
  - 요청: JSON `{ "data": "내용", "format": "png|svg" }`
  - 응답: 생성된 QR 이미지

### 4-4. 서버 환경 설정 (Server Configuration)
- 기본 포트: 3014 (`server.js` 내 설정)
- 개발 모드: `npm run dev` (nodemon 자동 재시작)
- 프로덕션 모드: `npm start`

---

## 5. 개발 및 운영 환경 (Development & Operations)

### 5-1. macOS 앱 빌드 환경
- Xcode 빌드: `Cmd+B` (빌드), `Cmd+R` (실행)
- CLI 빌드: `xcodebuild -scheme fQRGen -configuration Debug build`
- 프로젝트 경로: `fQRGen/fQRGen.xcodeproj`
- App Sandbox: 비활성화

### 5-2. Node.js 웹 앱 실행 환경
- 설치: `cd lib/qrgen-node && npm install`
- 개발 서버: `npm run dev` (nodemon, 포트 3014)
- 프로덕션: `npm start`
- 서버 주소: `http://localhost:3014`

### 5-3. REST API 테스트
- 테스트 스크립트: `lib/rest/test-api.sh`
- 클라이언트 라이브러리: `lib/qrgen-node/client.js`
- 사용 예제: `lib/qrgen-node/example.js`

---

## 6. 다국어 지원 (Localization)

### 6-1. 지원 언어 목록
| 코드 | 언어 |
|------|------|
| ko | 한국어 |
| en | 영어 |
| ja | 일본어 |
| de | 독일어 |
| es | 스페인어 |
| fr | 프랑스어 |
| zh-Hans | 중국어 간체 |
| zh-Hant | 중국어 번체 |

### 6-2. 구현 방식
- `StringLocalization.swift`를 통한 문자열 로컬라이제이션
- macOS 시스템 언어 설정에 따라 자동 전환
- UI 레이블, 메뉴 항목, 알림 메시지 등 전반적 적용

---

## 7. 고급 기능 및 확장 (Advanced Features & Extensions)

### 7-1. macOS 앱과 Node.js 웹 앱 REST API 비교
| 항목 | macOS 앱 REST API | Node.js 웹 앱 REST API |
|------|-------------------|----------------------|
| 기반 기술 | NWListener (Network.framework) | Express.js |
| QR 생성 엔진 | CoreImage (`CIQRCodeGenerator`) | `qrcode` npm 패키지 |
| 출력 형식 | PNG (scale 파라미터) | PNG, SVG |
| 접근 제어 | CIDR 기반 | 없음 |
| UI 연동 | 앱 입력란 자동 연동 | 독립적 웹 인터페이스 |

### 7-2. 외부 시스템 연동 가이드
- macOS 앱 REST API를 활용한 자동화 워크플로우 구축
- Node.js 클라이언트 라이브러리(`client.js`)를 통한 프로그래밍 연동
- curl을 이용한 명령줄 QR 코드 생성

### 7-3. 커스터마이징
- Node.js 웹 앱: EJS 템플릿 및 CSS 수정을 통한 UI 변경
- macOS 앱: 설정 화면에서 기본값(크기, 오류 정정 레벨) 조정

### 7-4. 데이터 저장 구조
- macOS 앱: UserDefaults, @AppStorage 기반 로컬 저장
- Node.js 웹 앱: 서버 메모리 내 처리 (영구 저장 없음)
