import yfinance as yf
import pandas as pd
from IPython.display import display, FileLink
import ipywidgets as widgets
from datetime import datetime
import os
import glob

# ---------------------------------------------------------
# 1 주요 금융 지표 목록
# ---------------------------------------------------------
COMMODITIES_DICT = {
    "금 시세": "GC=F",
    "은 시세": "SI=F",
    "구리 시세": "HG=F",
    "백금 시세": "PL=F",
    "알루미늄 시세": "ALI=F",
    "미국 기준 유가": "CL=F",
    "국제 기준 유가": "BZ=F",
}

STOCKS_FX_DICT = {
    "S&P500": "^GSPC",
    "NASDAQ": "^IXIC",
    "KOSPI": "^KS11",
    "엔비디아": "NVDA",
    "Sandisk": "SNDK",
    "TSMC": "TSM",
    "삼성전자": "005930.KS",
    "하이닉스": "000660.KS",
    "카카오": "035720.KS",
    "NAVER": "035420.KS",
    "HANATOUR": "039130.KS"
}

EXCHANGE_FX_DICT = {
    "KRW/USD 환율": "USDKRW=X",
    "KRW/JPY 환율": "JPYKRW=X",
    "KRW/GBP 환율": "GBPKRW=X",
    "KRW/EUR 환율": "EURKRW=X",
    "미국 10년물": "^TNX"
}

# ---------------------------------------------------------
# 2 사용자 인터페이스 (날짜 + 지표 + 항목 선택)
# ---------------------------------------------------------
start_picker = widgets.Text(value='2018-01-01', description='시작일:', layout=widgets.Layout(width='20%',margin='10px 0px 5px 0px'))
end_picker = widgets.Text(value=str(datetime.today().date()), description='종료일:', layout=widgets.Layout(width='20%',margin='5px 0px 15px 0px'))

asset_selector1 = widgets.SelectMultiple(
    options=list(COMMODITIES_DICT.keys()),
    value=[], # 빈 리스트로 시작
    description='원자재:',
    layout=widgets.Layout(width='20%', height='125px', margin='10px 0px')
)

asset_selector2 = widgets.SelectMultiple(
    options=list(STOCKS_FX_DICT.keys()),
    value=[], # 빈 리스트로 시작 
    description='주식:',
    layout=widgets.Layout(width='20%', height='157px', margin='10px 0px')
)

asset_selector3 = widgets.SelectMultiple(
    options=list(EXCHANGE_FX_DICT.keys()),
    value=[], # 빈 리스트로 시작 
    description='환율/금리:',
    layout=widgets.Layout(width='20%', height='95px', margin='10px 0px')
)

feature_selector = widgets.SelectMultiple(
    options=['가격', '거래량'],
    value=['가격'],
    description='항목 선택:',
    layout=widgets.Layout(width='20%', height='80px',margin='15px 0px 10px 0px')
)

download_btn = widgets.Button(description='데이터 추출', button_style='success')
file_download_btn = widgets.Button(description='파일 다운로드', button_style='info', disabled=True)
delete_btn = widgets.Button(description='생성 파일 삭제', button_style='danger')

# Create a button box to hold the buttons
button_box = widgets.HBox([download_btn, file_download_btn, delete_btn])

output = widgets.Output()

info_label = widgets.HTML(
    value="<b>💡 사용 팁:</b> Ctrl(또는 Cmd) + 클릭으로 선택 해제 가능",
    layout=widgets.Layout(margin='0px 0px 10px 0px')
)

display(start_picker, end_picker, asset_selector1, asset_selector2, asset_selector3, feature_selector, button_box, output)

# ---------------------------------------------------------
# 3 데이터 다운로드 함수
# ---------------------------------------------------------
# 전역 변수로 최근 생성된 파일명 저장
latest_filename = None

def download_data(b):
    global latest_filename
    output.clear_output()
    with output:
        start = start_picker.value
        end = end_picker.value
        selected_assets1 = asset_selector1.value
        selected_assets2 = asset_selector2.value
        selected_assets3 = asset_selector3.value
        selected_assets = list(selected_assets1) + list(selected_assets2) + list(selected_assets3)
        selected_features = feature_selector.value

        # 날짜 형식 검증
        try:
            start_date = datetime.strptime(start, '%Y-%m-%d')
            end_date = datetime.strptime(end, '%Y-%m-%d')
            if start_date > end_date:
                print("⚠️ 시작일이 종료일보다 늦습니다. 날짜를 확인하세요.")
                return
            if end_date > datetime.today():
                print("⚠️ 종료일은 오늘 이후일 수 없습니다.")
                return
        except ValueError:
            print("⚠️ 날짜 형식이 올바르지 않습니다. (YYYY-MM-DD 형식 사용)")
            return

        if not selected_assets:
            print("⚠️ 최소 1개 이상 지표를 선택하세요.")
            return
        if not selected_features:
            print("⚠️ 최소 1개 이상 항목(Close/Volume)을 선택하세요.")
            return

        symbols = {}
        for k in selected_assets1:
          symbols[k] = COMMODITIES_DICT[k]
        for k in selected_assets2:
          symbols[k] = STOCKS_FX_DICT[k]
        for k in selected_assets3:
          symbols[k] = EXCHANGE_FX_DICT[k]


        print(f"📅 기간: {start} ~ {end}")
        print(f"📈 선택한 지표: {list(symbols.keys())}")
        print(f"🧾 선택한 항목: {list(selected_features)}\n")

        dfs = []
        for name, code in symbols.items():
            try:
                df_temp = yf.download(code, start=start, end=end, progress=False)
                if df_temp is not None and not df_temp.empty:
                    cols = []
                    if '가격' in selected_features:
                        cols.append('Close')
                    if '거래량' in selected_features:
                        cols.append('Volume')

                    df_temp = df_temp[cols].copy()
                    df_temp.columns = [f"{name} ({col})" for col in cols]
                    dfs.append(df_temp)
                    print(f"✅ {name} ({code}) 데이터 {len(df_temp)}건 수집 완료")
                else:
                    print(f"⚠️ {name} 데이터 없음 (심볼: {code})")
            except Exception as e:
                print(f"❌ {name} 수집 실패: {e}")


        if not dfs:
            print("\n❌ 추출된 데이터가 없습니다.")
            return

        # 날짜 기준 병합
        df = pd.concat(dfs, axis=1).dropna(how='all')


        print("\n📊 데이터 미리보기:")
        display(df.tail())

        # CSV 저장 (파일명에서 특수문자 제거)
        safe_start = start.replace('-', '_')
        safe_end = end.replace('-', '_')
        filename = f"financial_data_{safe_start}_{safe_end}.csv"
        df.to_csv(filename, index=True, encoding='utf-8-sig')
        latest_filename = filename
        print(f"\n💾 CSV 저장 완료: {filename}")
        print("💡 위의 '💾 파일 다운로드' 버튼을 클릭하여 다운로드하세요.")


        # 다운로드 버튼 활성화
        file_download_btn.disabled = False


# ---------------------------------------------------------
# 4 파일 다운로드 함수
# ---------------------------------------------------------
def download_file(b):
    global latest_filename
    if latest_filename and os.path.exists(latest_filename):
        try:
            # Google Colab 환경
            from google.colab import files
            files.download(latest_filename)
        except ImportError:
            # 로컬 Jupyter 환경
            file_path = os.path.abspath(latest_filename)
            with output:
                output.clear_output()
                print(f"✅ 파일 저장 위치: {file_path}")
                print("💡 파일 탐색기에서 파일을 확인하세요.")
                # Jupyter에서 파일 링크 생성 시도
                try:
                    display(FileLink(latest_filename))
                except:
                    pass
    else:
        with output:
            output.clear_output()
            print("❌ 다운로드할 파일이 없습니다. 먼저 '📥 데이터 추출' 버튼을 클릭하세요.")


# ---------------------------------------------------------
# 5 파일 삭제 함수
# ---------------------------------------------------------
def delete_files(b):
    output.clear_output()
    with output:
        # financial_data로 시작하는 모든 CSV 파일 찾기
        files = glob.glob("financial_data_*.csv")


        if not files:
            print("❌ 삭제할 파일이 없습니다.")
            return

        print(f"🗑️ 발견된 파일: {len(files)}개\n")
        deleted_count = 0

        for file in files:
            try:
                os.remove(file)
                print(f"✅ 삭제 완료: {file}")
                deleted_count += 1
            except Exception as e:
                print(f"❌ 삭제 실패: {file} - {e}")

        print(f"\n✨ 총 {deleted_count}개 파일이 삭제되었습니다.")


# ---------------------------------------------------------
# 6 버튼 이벤트 연결
# ---------------------------------------------------------
download_btn.on_click(download_data)
file_download_btn.on_click(download_file)
delete_btn.on_click(delete_files)