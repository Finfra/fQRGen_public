#!/bin/bash
#
# fQRGen REST API 테스트 스크립트
#
# Usage:
#   bash _public/api/test-api.sh [--server=서버주소]
#
# Arguments:
#   --server=<url> : (옵션) fQRGen 서버 주소 (기본값: http://localhost:3014)
#
# Examples:
#   bash _public/api/test-api.sh
#   bash _public/api/test-api.sh --server=http://192.168.0.10:3014

SERVER="http://localhost:3014"
OUT_DIR="/tmp/fqrgen-rest-test"
PASS=0
FAIL=0

for arg in "$@"; do
  case "$arg" in
    --server=*) SERVER="${arg#*=}" ;;
  esac
done

# --- 이전 결과 정리 ---
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

# --- 유틸 함수 ---
run_test() {
  local name="$1"
  local expect_code="$2"
  shift 2
  local actual_code
  actual_code=$(curl -s -o /dev/null -w "%{http_code}" "$@")
  if [ "$actual_code" = "$expect_code" ]; then
    echo "  PASS  $name (HTTP $actual_code)"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $name (expected $expect_code, got $actual_code)"
    FAIL=$((FAIL + 1))
  fi
}

echo "========================================"
echo " fQRGen REST API Test"
echo " Server: $SERVER"
echo " Output: $OUT_DIR"
echo "========================================"
echo ""

# --- 0. 서버 연결 확인 (실패 시 즉시 종료) ---
echo "[0] 서버 연결 확인..."
if ! curl -s --connect-timeout 3 -o /dev/null "$SERVER/" 2>/dev/null; then
  echo "  FAIL  서버에 연결할 수 없습니다: $SERVER"
  echo ""
  echo "  서버를 먼저 실행하세요:"
  echo "    npm start"
  echo ""
  exit 1
fi
echo "  OK"
echo ""

# --- 1. 서버 상태 확인 ---
echo "[1/6] GET / (웹 UI 접근)"
run_test "메인 페이지" "200" "$SERVER/"

# --- 2. PNG 생성 (API) ---
echo "[2/6] POST /api/generate (PNG)"
curl -s -X POST "$SERVER/api/generate" \
  -H 'Content-Type: application/json' \
  -d '{"data":"https://finfra.kr","format":"png"}' \
  --output "$OUT_DIR/test.png"
if [ -f "$OUT_DIR/test.png" ] && file "$OUT_DIR/test.png" | grep -q "PNG"; then
  echo "  PASS  PNG 파일 생성 ($(wc -c < "$OUT_DIR/test.png" | tr -d ' ') bytes)"
  PASS=$((PASS + 1))
else
  echo "  FAIL  PNG 파일 생성 실패"
  FAIL=$((FAIL + 1))
fi

# --- 3. SVG 생성 (API) ---
echo "[3/6] POST /api/generate (SVG)"
curl -s -X POST "$SERVER/api/generate" \
  -H 'Content-Type: application/json' \
  -d '{"data":"https://finfra.kr","format":"svg"}' \
  --output "$OUT_DIR/test.svg"
if [ -f "$OUT_DIR/test.svg" ] && grep -q "<svg" "$OUT_DIR/test.svg"; then
  echo "  PASS  SVG 파일 생성 ($(wc -c < "$OUT_DIR/test.svg" | tr -d ' ') bytes)"
  PASS=$((PASS + 1))
else
  echo "  FAIL  SVG 파일 생성 실패"
  FAIL=$((FAIL + 1))
fi

# --- 4. SVG 내용 검증 (rect 포함 여부) ---
echo "[4/6] SVG 콘텐츠 검증 (QR 패턴 존재)"
if grep -q "<rect x=" "$OUT_DIR/test.svg"; then
  RECTS=$(grep -o '<rect x=' "$OUT_DIR/test.svg" | wc -l | tr -d ' ')
  echo "  PASS  SVG에 QR 패턴 rect $RECTS개 포함"
  PASS=$((PASS + 1))
else
  echo "  FAIL  SVG에 QR 패턴이 없음 (빈 이미지)"
  FAIL=$((FAIL + 1))
fi

# --- 5. 빈 데이터 (기본값 적용 확인) ---
echo "[5/6] POST /api/generate (빈 데이터 → 기본값)"
curl -s -X POST "$SERVER/api/generate" \
  -H 'Content-Type: application/json' \
  -d '{"format":"png"}' \
  --output "$OUT_DIR/test-default.png"
if [ -f "$OUT_DIR/test-default.png" ] && file "$OUT_DIR/test-default.png" | grep -q "PNG"; then
  echo "  PASS  기본값 PNG 생성"
  PASS=$((PASS + 1))
else
  echo "  FAIL  기본값 PNG 생성 실패"
  FAIL=$((FAIL + 1))
fi

# --- 6. 존재하지 않는 경로 (404) ---
echo "[6/6] GET /nonexistent (404 확인)"
run_test "404 응답" "404" "$SERVER/nonexistent"

# --- 결과 요약 ---
echo ""
echo "========================================"
echo " 결과: $PASS passed, $FAIL failed"
echo " 생성 파일: $OUT_DIR/"
ls -lh "$OUT_DIR"/test* 2>/dev/null | awk '{print "   "$NF, $5}'
echo "========================================"

[ "$FAIL" -eq 0 ] && exit 0 || exit 1
