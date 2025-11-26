# GitHub 인증 오류 해결 가이드

"Invalid username or token" 오류가 발생한 경우, Personal Access Token을 사용해야 합니다.

## 🔑 방법 1: Personal Access Token 사용 (추천)

### 1단계: Personal Access Token 생성

1. GitHub에 로그인
2. 우측 상단 프로필 아이콘 클릭 > **Settings**
3. 왼쪽 메뉴에서 **Developer settings** 클릭
4. **Personal access tokens** > **Tokens (classic)** 클릭
5. **Generate new token** > **Generate new token (classic)** 클릭
6. 설정:
   - **Note**: "Stock Data Collector" (원하는 이름)
   - **Expiration**: 90 days 또는 No expiration (선택)
   - **Select scopes**: 
     - ✅ **repo** (전체 저장소 권한) 체크
       - 이렇게 하면 하위 항목들도 자동으로 체크됩니다
7. 맨 아래 **Generate token** 클릭
8. ⚠️ **토큰을 복사하세요!** (다시 볼 수 없습니다)
   - 예: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 2단계: 토큰으로 푸시

터미널에서 다시 푸시할 때:

```bash
git push -u origin main
```

**Username**: GitHub 사용자 이름 입력
**Password**: 비밀번호 대신 **생성한 토큰을 붙여넣기**

예시:
```
Username: abenuhappy
Password: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3단계: 토큰 저장 (선택사항)

매번 입력하기 번거롭다면 Git Credential Helper 사용:

```bash
# macOS
git config --global credential.helper osxkeychain

# Windows
git config --global credential.helper wincred

# Linux
git config --global credential.helper cache
```

이후 한 번만 토큰을 입력하면 자동으로 저장됩니다.

## 🔐 방법 2: SSH 키 사용 (더 안전)

### 1단계: SSH 키 생성

```bash
# SSH 키 생성 (이메일을 본인 이메일로 변경)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Enter 키를 3번 누르면 기본 설정으로 생성됩니다
```

### 2단계: 공개 키 복사

```bash
# macOS/Linux
cat ~/.ssh/id_ed25519.pub

# Windows (PowerShell)
cat ~/.ssh/id_ed25519.pub
```

출력된 전체 내용을 복사하세요 (예: `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI...`)

### 3단계: GitHub에 SSH 키 등록

1. GitHub > Settings > **SSH and GPG keys**
2. **New SSH key** 클릭
3. 설정:
   - **Title**: "My Computer" (원하는 이름)
   - **Key**: 위에서 복사한 공개 키 붙여넣기
4. **Add SSH key** 클릭

### 4단계: 저장소 URL을 SSH로 변경

```bash
# 현재 HTTPS URL 제거
git remote remove origin

# SSH URL로 추가
git remote add origin git@github.com:abenuhappy/stock-data-collector.git

# 확인
git remote -v
```

### 5단계: SSH로 푸시

```bash
git push -u origin main
```

이제 비밀번호나 토큰 없이 푸시할 수 있습니다!

## 🛠️ 방법 3: GitHub CLI 사용 (가장 간단)

### 1단계: GitHub CLI 설치

```bash
# macOS
brew install gh

# Windows
# https://cli.github.com/ 에서 다운로드

# Linux
sudo apt install gh
```

### 2단계: 로그인

```bash
gh auth login
```

화면 안내에 따라:
1. GitHub.com 선택
2. HTTPS 선택
3. 브라우저에서 인증
4. 권한 승인

### 3단계: 푸시

```bash
git push -u origin main
```

이제 자동으로 인증됩니다!

## ✅ 빠른 해결 (가장 빠른 방법)

지금 당장 푸시하려면:

1. **Personal Access Token 생성** (위 방법 1의 1단계)
2. **토큰 복사**
3. **다시 푸시**:
   ```bash
   git push -u origin main
   ```
4. Username: `abenuhappy`
5. Password: **복사한 토큰 붙여넣기**

## 🔍 문제 해결

### Q: "Permission denied" 오류
**A**: 
- 토큰에 `repo` 권한이 있는지 확인
- 토큰이 만료되지 않았는지 확인

### Q: 토큰을 잃어버렸어요
**A**: 
- 새 토큰을 생성하세요
- 이전 토큰은 삭제할 수 있습니다 (Settings > Developer settings > Personal access tokens)

### Q: SSH 키가 작동하지 않아요
**A**: 
```bash
# SSH 연결 테스트
ssh -T git@github.com

# "Hi abenuhappy! You've successfully authenticated" 메시지가 나오면 성공
```

## 📝 참고사항

- **Personal Access Token**: 간단하지만 주기적으로 갱신 필요
- **SSH 키**: 한 번 설정하면 계속 사용 가능 (추천)
- **GitHub CLI**: 가장 편리하지만 설치 필요

## 🎯 추천 방법

1. **지금 당장**: Personal Access Token 사용
2. **장기적으로**: SSH 키 설정 (한 번만 설정하면 계속 사용)

