# fQRGen Gemini CLI 스킬 및 워크플로우

fQRGen REST API를 통해 QR 코드를 생성하는 Gemini CLI 전용 스킬과 워크플로우입니다.
설치 후 Gemini CLI에서 직접 QR 코드를 생성할 수 있습니다.

---

## 제공 기능

### 1. 스킬 (`fqrgen`)

fQRGen REST API를 통해 URL 또는 텍스트를 QR 코드 이미지로 생성합니다.

**사용 예시:**
```
fqrgen 스킬을 써서 https://finfra.kr QR코드를 만들어줘
https://github.com QR코드를 svg 포맷으로 생성해줘
```

### 2. 워크플로우 (`fqrgen.md`)

QR 코드를 생성하는 워크플로우 템플릿입니다.

---

## 설치 방법

### 스킬 설치
이 스킬은 빌드되어 패키징된 `.skill` 파일을 통해 설치할 수 있습니다.

1. 스킬 패키징 (이미 되어있지 않은 경우):
   ```bash
   node <path-to-skill-creator>/scripts/package_skill.cjs _public/agents/gemini/skills/fqrgen _public/agents/gemini/skills
   ```
2. 설치:
   ```bash
   gemini skills install _public/agents/gemini/skills/fqrgen.skill --scope workspace
   ```
3. 설치 후 Gemini CLI 프롬프트에서 `/skills reload` 명령을 실행합니다.

### 워크플로우 복사
Gemini CLI 워크플로우 디렉토리에 워크플로우 파일을 복사합니다.

```bash
cp _public/agents/gemini/workflows/fqrgen.md .agent/workflows/fqrgen.md
```

---

## 전제 조건

fQRGen REST API 서버가 실행 중이어야 합니다:

| 서버              | 실행 방법                                  |
| ----------------- | ------------------------------------------ |
| macOS 네이티브 앱 | fQRGen.app 실행 (설정에서 REST API 활성화) |
| Node.js 웹 앱     | `cd lib/qrgen-node && npm start`           |

> 서버가 꺼져 있으면 스킬이 사용자에게 fQRGen.app 실행을 안내합니다.
