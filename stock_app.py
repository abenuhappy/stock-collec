# -*- coding: utf-8 -*-
"""
Flask Backend for Stock Data Collection System
브라우저에서 실행 가능한 금융 데이터 수집 웹 애플리케이션
"""
from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
import os
import glob
import pandas as pd
from datetime import datetime
import yfinance as yf

app = Flask(__name__, 
            template_folder='templates',
            static_folder='static')
CORS(app)

# 개발 모드에서 템플릿과 정적 파일 자동 리로드 활성화
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# 데이터 저장 폴더
DATA_FOLDER = 'data'
if not os.path.exists(DATA_FOLDER):
    os.makedirs(DATA_FOLDER)

app.config['DATA_FOLDER'] = DATA_FOLDER

# ---------------------------------------------------------
# 금융 지표 딕셔너리
# ---------------------------------------------------------
COMMODITIES_DICT = {
    # 귀금속
    "금": "GC=F",
    "은": "SI=F",
    "백금": "PL=F",
    # 산업용 금속
    "구리": "HG=F",
    "알루미늄": "ALI=F",
    # 에너지
    "원유(미국)": "CL=F",
    "원유(브렌트)": "BZ=F",
    "천연가스": "NG=F",
    # 농산물
    "옥수수": "C=F",
    "대두": "S=F",
    "밀": "W=F",
    "커피": "KC=F",
    "설탕": "SB=F",
}

STOCKS_FX_DICT = {
    # 주요 지수
    "S&P500": "^GSPC",
    "NASDAQ": "^IXIC",
    "KOSPI": "^KS11",
    "VIX": "^VIX",
    # 해외 주식
    "엔비디아": "NVDA",
    "Sandisk": "SNDK",
    "TSMC": "TSM",
    "애플": "AAPL",
    "알파벳": "GOOGL",
    # 국내 주식
    "삼성전자": "005930.KS",
    "하이닉스": "000660.KS",
    "카카오": "035720.KS",
    "NAVER": "035420.KS",
    "하나투어": "039130.KS",
    "현대차": "005380.KS",
    "기아차": "000270.KS"
}

EXCHANGE_FX_DICT = {
    # 환율
    "KRW/USD": "USDKRW=X",
    "KRW/JPY": "JPYKRW=X",
    "KRW/GBP": "GBPKRW=X",
    "KRW/EUR": "EURKRW=X",
    # 미국 국채 수익률
    "미국 2년물": "^IRX",
    "미국 5년물": "^FVX",
    "미국 10년물": "^TNX",
    "미국 30년물": "^TYX",
    # 기타
    "달러 인덱스": "DX-Y.NYB"
}

@app.route('/')
def index():
    """메인 페이지"""
    return render_template('stock_index.html')

@app.route('/api/health', methods=['GET'])
def health_check():
    """헬스 체크"""
    return jsonify({'status': 'ok', 'message': 'Stock Data API is running'})

@app.route('/api/indicators', methods=['GET'])
def get_indicators():
    """사용 가능한 지표 목록 반환"""
    return jsonify({
        'success': True,
        'commodities': list(COMMODITIES_DICT.keys()),
        'stocks': list(STOCKS_FX_DICT.keys()),
        'exchange': list(EXCHANGE_FX_DICT.keys())
    })

@app.route('/api/download', methods=['POST'])
def download_data():
    """데이터 다운로드 및 처리"""
    try:
        data = request.json
        start = data.get('start_date')
        end = data.get('end_date')
        selected_commodities = data.get('commodities', [])
        selected_stocks = data.get('stocks', [])
        selected_exchange = data.get('exchange', [])
        selected_features = data.get('features', ['가격'])

        # 날짜 검증
        try:
            start_date = datetime.strptime(start, '%Y-%m-%d')
            end_date = datetime.strptime(end, '%Y-%m-%d')
            if start_date > end_date:
                return jsonify({
                    'success': False,
                    'error': '시작일이 종료일보다 늦습니다. 날짜를 확인하세요.'
                }), 400
            if end_date > datetime.today():
                return jsonify({
                    'success': False,
                    'error': '종료일은 오늘 이후일 수 없습니다.'
                }), 400
        except ValueError:
            return jsonify({
                'success': False,
                'error': '날짜 형식이 올바르지 않습니다. (YYYY-MM-DD 형식 사용)'
            }), 400

        # 선택된 지표 확인
        all_selected = selected_commodities + selected_stocks + selected_exchange
        if not all_selected:
            return jsonify({
                'success': False,
                'error': '최소 1개 이상 지표를 선택하세요.'
            }), 400

        if not selected_features:
            return jsonify({
                'success': False,
                'error': '최소 1개 이상 항목(가격/거래량)을 선택하세요.'
            }), 400

        # 심볼 매핑 (딕셔너리에 있는 항목만 사용)
        symbols = {}
        for k in selected_commodities:
            if k in COMMODITIES_DICT:
                symbols[k] = COMMODITIES_DICT[k]
        for k in selected_stocks:
            if k in STOCKS_FX_DICT:
                symbols[k] = STOCKS_FX_DICT[k]
        for k in selected_exchange:
            if k in EXCHANGE_FX_DICT:
                symbols[k] = EXCHANGE_FX_DICT[k]
        
        # 선택된 지표가 모두 딕셔너리에 없으면 오류
        if not symbols:
            return jsonify({
                'success': False,
                'error': '선택한 지표가 유효하지 않습니다. 미리 정의된 지표만 사용할 수 있습니다.'
            }), 400

        # 데이터 수집
        dfs = []
        results = []
        errors = []

        for name, code in symbols.items():
            try:
                df_temp = yf.download(code, start=start, end=end, progress=False, auto_adjust=True)
                if df_temp is not None and not df_temp.empty:
                    cols = []
                    if '가격' in selected_features:
                        cols.append('Close')
                    if '거래량' in selected_features:
                        cols.append('Volume')

                    df_temp = df_temp[cols].copy()
                    # 컬럼명 생성 시 Close를 Price로 변경
                    column_names = []
                    for col in cols:
                        display_col = 'Price' if col == 'Close' else col
                        column_names.append(f"{name} ({display_col})")
                    df_temp.columns = column_names
                    dfs.append(df_temp)
                    results.append({
                        'name': name,
                        'code': code,
                        'count': len(df_temp),
                        'status': 'success'
                    })
                else:
                    errors.append({
                        'name': name,
                        'code': code,
                        'message': '데이터 없음'
                    })
            except Exception as e:
                errors.append({
                    'name': name,
                    'code': code,
                    'message': str(e)
                })

        if not dfs:
            return jsonify({
                'success': False,
                'error': '추출된 데이터가 없습니다.',
                'errors': errors
            }), 400

        # 데이터 병합
        df = pd.concat(dfs, axis=1).dropna(how='all')
        
        # CSV 저장
        safe_start = start.replace('-', '_')
        safe_end = end.replace('-', '_')
        filename = f"financial_data_{safe_start}_{safe_end}.csv"
        filepath = os.path.join(app.config['DATA_FOLDER'], filename)
        df.to_csv(filepath, index=True, encoding='utf-8-sig')

        # 데이터 미리보기 (마지막 5행)
        preview = df.tail(5).to_dict('records')
        # 날짜 인덱스를 yy-mm-dd 형식으로 변환
        preview_dates = []
        for idx in df.tail(5).index:
            if isinstance(idx, pd.Timestamp):
                preview_dates.append(idx.strftime('%y-%m-%d'))
            else:
                # 문자열인 경우 파싱 후 포맷팅
                try:
                    dt = pd.to_datetime(idx)
                    preview_dates.append(dt.strftime('%y-%m-%d'))
                except:
                    preview_dates.append(str(idx))
        
        # 그래프용 데이터 준비 (전체 데이터, 최대 1000개 샘플)
        chart_data = {}
        chart_dates = []
        
        # 날짜 인덱스를 yy-mm-dd 형식으로 변환
        if isinstance(df.index, pd.DatetimeIndex):
            date_index = [idx.strftime('%y-%m-%d') for idx in df.index]
        else:
            # 문자열인 경우 파싱 후 포맷팅
            date_index = []
            for idx in df.index:
                try:
                    dt = pd.to_datetime(idx)
                    date_index.append(dt.strftime('%y-%m-%d'))
                except:
                    # 파싱 실패 시 원본 사용
                    date_str = str(idx).split(' ')[0] if ' ' in str(idx) else str(idx)
                    date_index.append(date_str)
        
        # 데이터가 많으면 샘플링 (최대 1000개)
        if len(df) > 1000:
            step = max(1, len(df) // 1000)
            sampled_df = df.iloc[::step].copy()
            sampled_dates = [date_index[i] for i in range(0, len(date_index), step)]
        else:
            sampled_df = df.copy()
            sampled_dates = date_index
        
        # 각 컬럼별 데이터 준비 (NaN을 0으로 변환)
        for col in sampled_df.columns:
            chart_data[col] = sampled_df[col].fillna(0).tolist()
        
        chart_dates = sampled_dates
        
        return jsonify({
            'success': True,
            'filename': filename,
            'filepath': filepath,
            'total_rows': len(df),
            'total_columns': len(df.columns),
            'preview_dates': preview_dates,
            'preview': preview,
            'chart_dates': chart_dates,
            'chart_data': chart_data,
            'results': results,
            'errors': errors
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'데이터 처리 중 오류 발생: {str(e)}'
        }), 500

@app.route('/api/download-file/<filename>', methods=['GET'])
def download_file(filename):
    """생성된 파일 다운로드"""
    try:
        filepath = os.path.join(app.config['DATA_FOLDER'], filename)
        if not os.path.exists(filepath):
            return jsonify({'error': '파일을 찾을 수 없습니다.'}), 404
        
        return send_file(
            filepath,
            as_attachment=True,
            download_name=filename,
            mimetype='text/csv'
        )
    except Exception as e:
        return jsonify({'error': f'파일 다운로드 중 오류: {str(e)}'}), 500

@app.route('/api/list-files', methods=['GET'])
def list_files():
    """생성된 파일 목록 조회"""
    try:
        files = glob.glob(os.path.join(app.config['DATA_FOLDER'], "financial_data_*.csv"))
        file_list = []
        for filepath in files:
            filename = os.path.basename(filepath)
            file_size = os.path.getsize(filepath)
            file_time = datetime.fromtimestamp(os.path.getmtime(filepath))
            file_list.append({
                'filename': filename,
                'size': file_size,
                'modified': file_time.strftime('%Y-%m-%d %H:%M:%S')
            })
        return jsonify({
            'success': True,
            'files': file_list
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'파일 목록 조회 중 오류: {str(e)}'
        }), 500

@app.route('/api/delete-files', methods=['POST'])
def delete_files():
    """생성된 파일 삭제"""
    try:
        files = glob.glob(os.path.join(app.config['DATA_FOLDER'], "financial_data_*.csv"))
        deleted_count = 0
        errors = []
        
        for filepath in files:
            try:
                os.remove(filepath)
                deleted_count += 1
            except Exception as e:
                errors.append({
                    'filename': os.path.basename(filepath),
                    'error': str(e)
                })
        
        return jsonify({
            'success': True,
            'deleted_count': deleted_count,
            'errors': errors
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'파일 삭제 중 오류: {str(e)}'
        }), 500

if __name__ == '__main__':
    import webbrowser
    import threading
    import time
    
    port = int(os.environ.get('PORT', 5002))
    
    # 프로덕션 모드 확인 (환경 변수로 제어)
    is_production = os.environ.get('FLASK_ENV') == 'production' or os.environ.get('ENVIRONMENT') == 'production'
    debug_mode = not is_production
    
    # 프로덕션 모드가 아닐 때만 브라우저 자동 열기
    if not is_production:
        def open_browser():
            time.sleep(1.5)
            webbrowser.open(f'http://localhost:{port}')
        
        # 브라우저 자동 열기 (메인 프로세스에서만)
        if os.environ.get('WERKZEUG_RUN_MAIN') == 'true' or os.environ.get('WERKZEUG_RUN_MAIN') is None:
            browser_flag_file = os.path.join(os.path.dirname(__file__), '.browser_opened')
            if not os.path.exists(browser_flag_file):
                try:
                    with open(browser_flag_file, 'x') as f:
                        pass
                    threading.Thread(target=open_browser, daemon=True).start()
                except FileExistsError:
                    pass
    
    if is_production:
        print(f"🚀 금융 데이터 수집 시스템이 프로덕션 모드로 시작되었습니다.")
    else:
        print(f"🚀 금융 데이터 수집 시스템이 시작되었습니다.")
        print(f"📊 브라우저에서 http://localhost:{port} 접속하세요.")
    
    app.run(host='0.0.0.0', port=port, debug=debug_mode, use_reloader=debug_mode)

