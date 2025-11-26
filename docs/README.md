# 금융 데이터 수집 시스템

브라우저에서 실행 가능한 금융 데이터 수집 웹 애플리케이션입니다.

## 🚀 빠른 시작

### Windows 사용자
1. **`run.bat` 파일을 더블클릭**
2. 터미널 창이 열리면 그대로 두기
3. 브라우저에서 `http://localhost:5002` 접속

### macOS/Linux 사용자
1. 터미널에서 `./run.sh` 실행
   (실행 권한이 없으면 자동으로 부여됩니다)
2. 브라우저에서 `http://localhost:5002` 접속

## 필요 사항

- Python 3.7 이상
- pip (Python 패키지 관리자)

## 설치 방법

### 1. Python 설치 확인

```bash
python --version
# 또는
python3 --version
```

### 2. 의존성 패키지 설치

**방법 1: pip 사용**
```bash
pip install -r requirements.txt
```

**방법 2: pip3 사용**
```bash
pip3 install -r requirements.txt
```

**방법 3: python -m pip 사용**
```bash
python -m pip install -r requirements.txt
# 또는
python3 -m pip install -r requirements.txt
```

## 실행 방법

### 자동 실행 (권장)
- Windows: `run.bat` 더블클릭
- macOS/Linux: `./run.sh` 실행

### 수동 실행
```bash
python stock_app.py
# 또는
python3 stock_app.py
```

## 주요 기능

- 📅 **기간 선택**: 시작일과 종료일을 선택하여 데이터 수집 기간 설정
- 📊 **다양한 지표 지원**:
  - 원자재 (금, 은, 구리, 백금, 알루미늄, 유가 등)
  - 주식 (S&P500, NASDAQ, KOSPI, 삼성전자, 엔비디아 등)
  - 환율/금리 (KRW/USD, KRW/JPY, 미국 10년물 등)
- 🧾 **항목 선택**: 가격(Close) 및 거래량(Volume) 선택 가능
- 💾 **CSV 파일 다운로드**: 수집된 데이터를 CSV 파일로 저장
- 🗑️ **파일 관리**: 생성된 파일 삭제 기능

## 사용 방법

1. **기간 선택**: 시작일과 종료일을 선택합니다.
2. **지표 선택**: 원자재, 주식, 환율/금리 중 원하는 지표를 선택합니다.
   - Ctrl(또는 Cmd) + 클릭으로 다중 선택 가능
3. **항목 선택**: 가격 또는 거래량을 선택합니다.
4. **데이터 추출**: "📥 데이터 추출" 버튼을 클릭합니다.
5. **파일 다운로드**: 수집이 완료되면 "💾 파일 다운로드" 버튼을 클릭하여 CSV 파일을 다운로드합니다.

## 포트 변경

기본 포트는 5002입니다. 다른 포트를 사용하려면 환경 변수를 설정하세요:

```bash
PORT=8080 python stock_app.py
```

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

## 문제 해결

### 포트가 이미 사용 중인 경우

다른 포트를 사용하세요:
```bash
PORT=5003 python stock_app.py
```

### 패키지 설치 오류

가상 환경을 사용하는 것을 권장합니다:
```bash
python -m venv venv
source venv/bin/activate  # macOS/Linux
# 또는
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

### 데이터 수집 실패

- 인터넷 연결을 확인하세요.
- yfinance API가 일시적으로 제한될 수 있습니다. 잠시 후 다시 시도하세요.
- 선택한 기간에 데이터가 없을 수 있습니다.

## 참고사항

- 수집된 데이터는 `data/` 폴더에 저장됩니다.
- 파일명 형식: `financial_data_YYYY_MM_DD_YYYY_MM_DD.csv`
- yfinance를 사용하여 Yahoo Finance에서 데이터를 수집합니다.

