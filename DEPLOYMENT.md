# 온라인 배포 가이드

이 문서는 금융 데이터 수집 시스템을 온라인에 배포하는 방법을 안내합니다.

## 🚀 추천 배포 플랫폼

### 1. Railway (추천) ⭐
- **장점**: 설정이 간단하고, 무료 티어 제공
- **URL**: https://railway.app
- **무료 티어**: 월 $5 크레딧 (충분함)

### 2. Render
- **장점**: 무료 티어 제공 (15분 후 슬립 모드)
- **URL**: https://render.com
- **무료 티어**: 무료 (슬립 모드 있음)

### 3. Fly.io
- **장점**: 빠른 속도, 무료 티어 제공
- **URL**: https://fly.io
- **무료 티어**: 월 3개 앱까지 무료

## 📋 배포 전 준비사항

1. **GitHub 저장소 생성** (선택사항이지만 권장)
   - 코드를 GitHub에 업로드하면 배포가 더 쉬워집니다.

2. **필수 파일 확인**
   - ✅ `Procfile` - 배포 플랫폼용 실행 명령
   - ✅ `runtime.txt` - Python 버전 명시
   - ✅ `requirements.txt` - 필요한 패키지 목록
   - ✅ `stock_app.py` - 메인 애플리케이션

## 🚂 Railway로 배포하기 (추천)

### 1단계: Railway 계정 생성
1. https://railway.app 접속
2. GitHub로 로그인 (또는 이메일로 가입)

### 2단계: 새 프로젝트 생성
1. "New Project" 클릭
2. "Deploy from GitHub repo" 선택 (GitHub에 코드가 있는 경우)
   - 또는 "Empty Project" 선택 후 GitHub 연결
3. 저장소 선택

### 3단계: 자동 배포
- Railway가 자동으로 감지하여 배포를 시작합니다
- `Procfile`과 `requirements.txt`를 자동으로 인식합니다

### 4단계: 환경 변수 설정 (선택사항)
- Settings > Variables에서 환경 변수 추가:
  - `FLASK_ENV=production` (프로덕션 모드)
  - `PORT`는 자동으로 설정됨

### 5단계: 도메인 확인
- 배포 완료 후 "Settings" > "Generate Domain" 클릭
- 생성된 URL로 접속 가능

## 🎨 Render로 배포하기

### 1단계: Render 계정 생성
1. https://render.com 접속
2. GitHub로 로그인

### 2단계: 새 Web Service 생성
1. "New +" > "Web Service" 클릭
2. GitHub 저장소 연결
3. 설정:
   - **Name**: stock-data-collector (원하는 이름)
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python stock_app.py`
   - **Plan**: Free (무료)

### 3단계: 환경 변수 설정
- Environment Variables에서:
  - `FLASK_ENV=production`
  - `PORT`는 자동 설정됨

### 4단계: 배포
- "Create Web Service" 클릭
- 배포 완료 후 URL 확인

## ✈️ Fly.io로 배포하기

### 1단계: Fly.io CLI 설치
```bash
# macOS
brew install flyctl

# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

### 2단계: 로그인
```bash
flyctl auth login
```

### 3단계: 앱 생성 및 배포
```bash
cd stock
flyctl launch
```

### 4단계: 배포
```bash
flyctl deploy
```

## 🔧 배포 후 확인사항

1. **애플리케이션 접속**
   - 배포 플랫폼에서 제공하는 URL로 접속
   - 예: `https://your-app.railway.app`

2. **기능 테스트**
   - 지표 선택
   - 데이터 추출
   - 파일 다운로드

3. **로그 확인**
   - 배포 플랫폼의 로그 섹션에서 오류 확인

## ⚠️ 주의사항

1. **데이터 저장**
   - 배포 플랫폼의 파일 시스템은 임시적입니다
   - 생성된 CSV 파일은 다운로드 후 저장하세요
   - 영구 저장이 필요하면 클라우드 스토리지(S3, Google Cloud Storage) 연동 고려

2. **무료 티어 제한**
   - Railway: 월 $5 크레딧 (충분함)
   - Render: 15분 비활성 시 슬립 모드
   - Fly.io: 월 3개 앱까지 무료

3. **성능**
   - yfinance API 호출은 시간이 걸릴 수 있습니다
   - 많은 지표를 선택하면 타임아웃이 발생할 수 있습니다

## 🔄 업데이트 배포

### GitHub 사용 시
- 코드를 GitHub에 푸시하면 자동으로 재배포됩니다

### 수동 배포
- 배포 플랫폼의 "Redeploy" 버튼 클릭

## 📞 문제 해결

### 배포 실패
1. 로그 확인: 배포 플랫폼의 로그 섹션 확인
2. `requirements.txt` 확인: 모든 패키지가 올바른지 확인
3. Python 버전 확인: `runtime.txt`의 버전이 지원되는지 확인

### 애플리케이션 오류
1. 환경 변수 확인: `FLASK_ENV=production` 설정 확인
2. 포트 확인: `PORT` 환경 변수가 자동 설정되는지 확인
3. 로그 확인: 배포 플랫폼의 실시간 로그 확인

## 💡 추가 개선 사항

1. **커스텀 도메인**
   - 배포 플랫폼에서 커스텀 도메인 연결 가능

2. **데이터베이스 연동**
   - PostgreSQL, MySQL 등 연동 가능 (유료 플랜 필요)

3. **모니터링**
   - 배포 플랫폼의 모니터링 도구 활용

## 📚 참고 자료

- Railway 문서: https://docs.railway.app
- Render 문서: https://render.com/docs
- Fly.io 문서: https://fly.io/docs

