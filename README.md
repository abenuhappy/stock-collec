# 금융 데이터 수집 시스템

브라우저에서 실행 가능한 금융 데이터 수집 웹 애플리케이션입니다.

## 🚀 빠른 시작

### Windows 사용자
1. **`run.bat` 파일을 더블클릭**
2. 터미널 창이 열리면 그대로 두기
   - 필요한 패키지가 자동으로 설치됩니다
   - 처음 실행 시 시간이 걸릴 수 있습니다
3. 브라우저가 자동으로 열립니다
   - 자동으로 열리지 않으면 `http://localhost:5002` 접속

### macOS/Linux 사용자
1. 터미널을 열고 이 폴더로 이동
2. `./run.sh` 실행
   - 실행 권한이 없으면 자동으로 부여됩니다
   - 필요한 패키지가 자동으로 설치됩니다
   - 처음 실행 시 시간이 걸릴 수 있습니다
3. 브라우저가 자동으로 열립니다
   - 자동으로 열리지 않으면 `http://localhost:5002` 접속

## 필요 사항

- Python 3.7 이상
- pip (Python 패키지 관리자)

## 주요 기능

- 📅 **기간 선택**: 시작일과 종료일을 선택하여 데이터 수집 기간 설정
- 📊 **다양한 지표 지원**:
  - 원자재 (금, 은, 구리, 백금, 알루미늄, 유가 등)
  - 주식 (S&P500, NASDAQ, KOSPI, 삼성전자, 엔비디아 등)
  - 환율/금리 (KRW/USD, KRW/JPY, 미국 10년물 등)
- 🧾 **항목 선택**: 가격(Price) 및 거래량(Volume) 선택 가능
- 💾 **CSV 파일 다운로드**: 수집된 데이터를 CSV 파일로 저장
- 🗑️ **파일 관리**: 생성된 파일 삭제 기능

## 폴더 구조

```
stock/
├── stock_app.py              # Flask 애플리케이션 메인 파일
├── requirements.txt          # 필요한 패키지 목록
├── run.bat                   # Windows 실행 스크립트
├── run.sh                    # macOS/Linux 실행 스크립트
├── templates/
│   └── stock_index.html      # HTML 템플릿
├── static/
│   ├── css/
│   │   └── stock_style.css   # CSS 스타일
│   └── js/
│       └── stock_app.js      # JavaScript
├── scripts/
│   └── multi_stock.py        # 유틸리티 스크립트
├── docs/
│   ├── README.md             # 상세 문서
│   └── multi_stock_REVIEW.md # 코드 리뷰 문서
└── data/                     # 생성된 CSV 파일 저장 폴더 (자동 생성)
```

## 🌐 온라인 배포

이 애플리케이션을 온라인에 배포하려면:
1. **GitHub 저장소 생성**: `GITHUB_SETUP.md` 파일 참고
2. **배포 플랫폼 선택**: `DEPLOYMENT.md` 파일 참고

주요 배포 플랫폼:
- **Railway** (추천): https://railway.app
- **Render**: https://render.com
- **Fly.io**: https://fly.io

## 더 자세한 정보

상세한 사용 방법과 문제 해결 방법은 `docs/README.md`를 참고하세요.

