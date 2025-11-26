# GitHub 저장소 생성 가이드

이 문서는 GitHub에 코드를 업로드하는 방법을 단계별로 안내합니다.

## 📋 1단계: GitHub 계정 생성

1. https://github.com 접속
2. "Sign up" 클릭
3. 이메일, 비밀번호, 사용자 이름 입력
4. 이메일 인증 완료

## 🆕 2단계: 새 저장소 생성

### 방법 1: 웹 브라우저에서 생성

1. GitHub에 로그인
2. 우측 상단의 **"+"** 아이콘 클릭 > **"New repository"** 선택
3. 저장소 설정:
   - **Repository name**: `stock-data-collector` (원하는 이름)
   - **Description**: "금융 데이터 수집 시스템" (선택사항)
   - **Public** 또는 **Private** 선택
     - Public: 누구나 볼 수 있음 (무료)
     - Private: 본인만 볼 수 있음 (무료)
   - **Add a README file**: 체크 해제 (이미 README.md가 있음)
   - **Add .gitignore**: 체크 해제 (이미 .gitignore가 있음)
   - **Choose a license**: 선택사항
4. **"Create repository"** 클릭

### 방법 2: GitHub Desktop 사용 (GUI)

1. https://desktop.github.com 에서 GitHub Desktop 다운로드
2. 설치 후 GitHub 계정 로그인
3. "File" > "New Repository"
4. 저장소 이름과 위치 설정
5. "Create repository" 클릭

## 📤 3단계: 로컬 코드를 GitHub에 업로드

### 방법 1: 터미널/명령 프롬프트 사용 (추천)

#### macOS/Linux (터미널)

```bash
# 1. stock 폴더로 이동
cd /Users/abenu/Downloads/Forecast/LearningData/stock

# 2. Git 초기화 (처음 한 번만)
git init

# 3. 모든 파일 추가
git add .

# 4. 첫 커밋 생성
git commit -m "Initial commit: 금융 데이터 수집 시스템"

# 5. GitHub 저장소 연결
# 아래 URL을 2단계에서 생성한 저장소 URL로 변경하세요
git remote add origin https://github.com/사용자이름/저장소이름.git

# 예시:
# git remote add origin https://github.com/abenu/stock-data-collector.git

# 6. GitHub에 업로드
git branch -M main
git push -u origin main
```

#### Windows (명령 프롬프트 또는 PowerShell)

```cmd
# 1. stock 폴더로 이동
cd C:\Users\abenu\Downloads\Forecast\LearningData\stock

# 2. Git 초기화 (처음 한 번만)
git init

# 3. 모든 파일 추가
git add .

# 4. 첫 커밋 생성
git commit -m "Initial commit: 금융 데이터 수집 시스템"

# 5. GitHub 저장소 연결
git remote add origin https://github.com/사용자이름/저장소이름.git

# 6. GitHub에 업로드
git branch -M main
git push -u origin main
```

### 방법 2: GitHub Desktop 사용

1. GitHub Desktop 열기
2. "File" > "Add Local Repository"
3. stock 폴더 선택
4. "Publish repository" 클릭
5. 저장소 이름 입력 후 "Publish repository" 클릭

## 🔐 4단계: 인증 (필요한 경우)

### Personal Access Token 사용 (2021년 8월 이후)

GitHub는 비밀번호 대신 Personal Access Token을 사용합니다.

1. GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)
2. "Generate new token" 클릭
3. 권한 선택:
   - `repo` (전체 저장소 권한) 체크
4. "Generate token" 클릭
5. 생성된 토큰 복사 (다시 볼 수 없으니 저장!)
6. 푸시할 때 비밀번호 대신 토큰 입력

### 또는 SSH 키 사용 (더 안전)

```bash
# SSH 키 생성 (한 번만)
ssh-keygen -t ed25519 -C "your_email@example.com"

# 공개 키 복사
cat ~/.ssh/id_ed25519.pub

# GitHub > Settings > SSH and GPG keys > New SSH key
# 위에서 복사한 키 붙여넣기

# 저장소 URL을 SSH 형식으로 변경
git remote set-url origin git@github.com:사용자이름/저장소이름.git
```

## 📝 저장소 URL 형식

### HTTPS 형식
```
https://github.com/사용자이름/저장소이름.git
```

예시:
```
https://github.com/abenu/stock-data-collector.git
```

### SSH 형식
```
git@github.com:사용자이름/저장소이름.git
```

예시:
```
git@github.com:abenu/stock-data-collector.git
```

## ✅ 5단계: 업로드 확인

1. GitHub 웹사이트에서 저장소 페이지 열기
2. 파일 목록이 보이면 성공!
3. 저장소 URL 확인:
   - 예: `https://github.com/사용자이름/저장소이름`

## 🔄 이후 업데이트 방법

코드를 수정한 후 다시 업로드:

```bash
# 1. 변경사항 확인
git status

# 2. 변경된 파일 추가
git add .

# 3. 커밋 생성
git commit -m "업데이트 내용 설명"

# 4. GitHub에 업로드
git push
```

## ❓ 자주 묻는 질문

### Q: Git이 설치되어 있지 않아요
**A**: 
- macOS: Xcode Command Line Tools 설치 (`xcode-select --install`)
- Windows: https://git-scm.com/download/win 에서 다운로드
- Linux: `sudo apt install git` (Ubuntu/Debian)

### Q: "remote origin already exists" 오류
**A**: 
```bash
# 기존 원격 저장소 제거
git remote remove origin

# 새로 추가
git remote add origin https://github.com/사용자이름/저장소이름.git
```

### Q: "Permission denied" 오류
**A**: 
- Personal Access Token 사용 확인
- 또는 SSH 키 설정 확인

### Q: 저장소 URL을 어디서 찾나요?
**A**: 
1. GitHub 저장소 페이지 접속
2. 초록색 "Code" 버튼 클릭
3. HTTPS 또는 SSH URL 복사

## 🎯 다음 단계

GitHub에 코드가 업로드되면:
1. Railway, Render 등 배포 플랫폼에서 GitHub 저장소 연결
2. 자동 배포 시작
3. `DEPLOYMENT.md` 참고하여 배포 완료

