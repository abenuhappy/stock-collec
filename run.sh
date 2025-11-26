#!/bin/bash

# 스크립트 파일의 디렉토리로 이동
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 실행 권한 자동 부여 (압축 파일로 공유 시 실행 권한이 없을 수 있음)
chmod +x "$0" 2>/dev/null

echo "========================================"
echo "금융 데이터 수집 시스템 시작"
echo "========================================"
echo ""

# 필수 파일 확인
if [ ! -f "requirements.txt" ]; then
    echo "[오류] requirements.txt 파일을 찾을 수 없습니다."
    echo "현재 디렉토리: $(pwd)"
    echo "올바른 디렉토리에서 실행해주세요."
    exit 1
fi

if [ ! -f "stock_app.py" ]; then
    echo "[오류] stock_app.py 파일을 찾을 수 없습니다."
    echo "현재 디렉토리: $(pwd)"
    echo "올바른 디렉토리에서 실행해주세요."
    exit 1
fi

# Python 설치 확인
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
    PIP_CMD="python3 -m pip"
elif command -v python &> /dev/null; then
    PYTHON_CMD=python
    PIP_CMD="python -m pip"
else
    echo "[오류] Python이 설치되어 있지 않습니다."
    echo "Python 3.7 이상을 설치해주세요."
    echo "macOS: brew install python3"
    echo "Linux: sudo apt install python3 python3-pip"
    exit 1
fi

echo "[1/3] Python 확인 완료: $PYTHON_CMD"
echo ""

# 패키지 설치 확인 및 설치
echo "[2/3] 필요한 패키지 설치 중..."
echo "(처음 실행 시 시간이 걸릴 수 있습니다...)"
$PIP_CMD install -r requirements.txt --quiet --upgrade
if [ $? -ne 0 ]; then
    echo "[경고] 패키지 설치 중 일부 오류가 발생했을 수 있습니다."
    echo "수동으로 설치하려면: $PIP_CMD install -r requirements.txt"
    echo "계속 진행합니다..."
fi
echo "✅ 패키지 설치 완료"
echo ""

# 서버 실행
echo "[3/3] 서버 시작 중..."
echo ""
echo "========================================"
echo "서버가 시작되었습니다!"
echo ""
echo "브라우저가 자동으로 열립니다..."
echo "(자동으로 열리지 않으면 http://localhost:5002 로 접속하세요)"
echo ""
echo "서버를 중지하려면 Ctrl+C를 누르세요"
echo "========================================"
echo ""

$PYTHON_CMD stock_app.py

