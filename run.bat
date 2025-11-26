@echo off
chcp 65001 >nul

REM 현재 디렉토리로 이동
cd /d "%~dp0"

echo ========================================
echo 금융 데이터 수집 시스템 시작
echo ========================================
echo.

REM 필수 파일 확인
if not exist "requirements.txt" (
    echo [오류] requirements.txt 파일을 찾을 수 없습니다.
    echo 현재 디렉토리: %CD%
    echo 올바른 디렉토리에서 실행해주세요.
    pause
    exit /b 1
)

if not exist "stock_app.py" (
    echo [오류] stock_app.py 파일을 찾을 수 없습니다.
    echo 현재 디렉토리: %CD%
    echo 올바른 디렉토리에서 실행해주세요.
    pause
    exit /b 1
)

REM Python 경로 찾기
where python >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_CMD=python
    set PIP_CMD=python -m pip
    goto :found_python
)

where python3 >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_CMD=python3
    set PIP_CMD=python3 -m pip
    goto :found_python
)

where py >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_CMD=py
    set PIP_CMD=py -m pip
    goto :found_python
)

echo [오류] Python이 설치되어 있지 않습니다.
echo Python 3.7 이상을 설치해주세요.
echo https://www.python.org/downloads/
pause
exit /b 1

:found_python
echo [1/3] Python 확인 완료: %PYTHON_CMD%
echo.

REM 패키지 설치 확인 및 설치
echo [2/3] 필요한 패키지 설치 중...
echo (처음 실행 시 시간이 걸릴 수 있습니다...)
%PIP_CMD% install -r requirements.txt --quiet --upgrade
if %errorlevel% neq 0 (
    echo [경고] 패키지 설치 중 일부 오류가 발생했을 수 있습니다.
    echo 수동으로 설치하려면: %PIP_CMD% install -r requirements.txt
    echo 계속 진행합니다...
)
echo ✅ 패키지 설치 완료
echo.

REM 서버 실행
echo [3/3] 서버 시작 중...
echo.
echo ========================================
echo 서버가 시작되었습니다!
echo.
echo 브라우저가 자동으로 열립니다...
echo (자동으로 열리지 않으면 http://localhost:5002 로 접속하세요)
echo.
echo 서버를 중지하려면 Ctrl+C를 누르세요
echo ========================================
echo.

%PYTHON_CMD% stock_app.py

pause

