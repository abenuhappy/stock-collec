// 금융 데이터 수집 시스템 - JavaScript

let latestFilename = null;
let indicators = null;
let chartInstance = null; // Chart.js 인스턴스

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 종료일 기본값 설정 (오늘)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('endDate').value = today;
    
    // 다크 모드 초기화
    initTheme();
    
    // 지표 목록 로드
    loadIndicators();
    
    // 버튼 이벤트 연결
    document.getElementById('downloadBtn').addEventListener('click', downloadData);
    document.getElementById('fileDownloadBtn').addEventListener('click', downloadFile);
    document.getElementById('deleteBtn').addEventListener('click', deleteFiles);
    
    // 다크 모드 토글 버튼
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});

// 다크 모드 초기화
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
}

// 다크 모드 토글
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
}

// 테마 설정
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        themeToggle.title = theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환';
    }
    
    // 차트가 있으면 다크 모드에 맞게 업데이트
    if (chartInstance) {
        updateChartTheme(theme);
    }
}

// 차트 테마 업데이트
function updateChartTheme(theme) {
    if (!chartInstance) return;
    
    const isDark = theme === 'dark';
    const textColor = isDark ? '#e0e0e0' : '#333333';
    const gridColor = isDark ? '#404040' : '#e0e0e0';
    
    chartInstance.options.scales.x.ticks.color = textColor;
    chartInstance.options.scales.x.title.color = textColor;
    chartInstance.options.scales.y.ticks.color = textColor;
    chartInstance.options.scales.y.title.color = textColor;
    chartInstance.options.scales.x.grid.color = gridColor;
    chartInstance.options.scales.y.grid.color = gridColor;
    
    // y1 축(거래량)이 있으면 업데이트
    if (chartInstance.options.scales.y1) {
        chartInstance.options.scales.y1.ticks.color = textColor;
        chartInstance.options.scales.y1.title.color = textColor;
        chartInstance.options.scales.y1.grid.color = gridColor;
    }
    
    chartInstance.options.plugins.legend.labels.color = textColor;
    
    chartInstance.update();
}

// 지표 목록 로드
async function loadIndicators() {
    try {
        const response = await fetch('/api/indicators');
        const data = await response.json();
        
        if (data.success) {
            indicators = data;
            
            // 원자재 옵션 추가
            const commoditiesSelect = document.getElementById('commoditiesSelect');
            data.commodities.forEach(item => {
                const option = document.createElement('option');
                option.value = item;
                option.textContent = item;
                commoditiesSelect.appendChild(option);
            });
            
            // 주식 옵션 추가
            const stocksSelect = document.getElementById('stocksSelect');
            data.stocks.forEach(item => {
                const option = document.createElement('option');
                option.value = item;
                option.textContent = item;
                stocksSelect.appendChild(option);
            });
            
            // 환율/금리 옵션 추가
            const exchangeSelect = document.getElementById('exchangeSelect');
            data.exchange.forEach(item => {
                const option = document.createElement('option');
                option.value = item;
                option.textContent = item;
                exchangeSelect.appendChild(option);
            });
            
            // 자동완성 기능 초기화
            initAutocomplete('commoditiesInput', 'commoditiesAutocomplete', 'commoditiesSelect', data.commodities);
            initAutocomplete('stocksInput', 'stocksAutocomplete', 'stocksSelect', data.stocks);
            initAutocomplete('exchangeInput', 'exchangeAutocomplete', 'exchangeSelect', data.exchange);
            
            // 선택된 항목 표시 기능 초기화
            initSelectedItems('commoditiesSelect', 'commoditiesSelected');
            initSelectedItems('stocksSelect', 'stocksSelected');
            initSelectedItems('exchangeSelect', 'exchangeSelected');
        }
    } catch (error) {
        showError('지표 목록을 불러오는 중 오류가 발생했습니다: ' + error.message);
    }
}

// 자동완성 기능 초기화
function initAutocomplete(inputId, autocompleteId, selectId, items) {
    const input = document.getElementById(inputId);
    const autocomplete = document.getElementById(autocompleteId);
    const select = document.getElementById(selectId);
    let highlightedIndex = -1;
    
    if (!input || !autocomplete || !select) return;
    
    // 입력 이벤트
    input.addEventListener('input', function() {
        const value = this.value.trim();
        
        if (value === '') {
            autocomplete.classList.remove('show');
            return;
        }
        
        // 일치하는 항목 찾기 (대소문자 구분 없음)
        const matches = items.filter(item => 
            item.toLowerCase().includes(value.toLowerCase())
        );
        
        if (matches.length === 0) {
            autocomplete.classList.remove('show');
            return;
        }
        
        // 자동완성 목록 생성
        autocomplete.innerHTML = '';
        matches.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'autocomplete-item';
            div.textContent = item;
            div.dataset.value = item;
            
            // 하이라이트 처리
            const regex = new RegExp(`(${value})`, 'gi');
            div.innerHTML = item.replace(regex, '<strong>$1</strong>');
            
            div.addEventListener('click', function() {
                selectItem(item, select, input, autocomplete, matches);
            });
            
            div.addEventListener('mouseenter', function() {
                highlightedIndex = index;
                updateHighlight(autocomplete, index);
            });
            
            autocomplete.appendChild(div);
        });
        
        autocomplete.classList.add('show');
        highlightedIndex = -1;
    });
    
    // 키보드 이벤트
    input.addEventListener('keydown', function(e) {
        const items = autocomplete.querySelectorAll('.autocomplete-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            highlightedIndex = Math.min(highlightedIndex + 1, items.length - 1);
            updateHighlight(autocomplete, highlightedIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            highlightedIndex = Math.max(highlightedIndex - 1, -1);
            updateHighlight(autocomplete, highlightedIndex);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex >= 0 && items[highlightedIndex]) {
                // 하이라이트된 항목이 있으면 선택
                const item = items[highlightedIndex].dataset.value;
                selectItem(item, select, input, autocomplete, items);
            } else if (items.length === 1) {
                // 항목이 하나만 있으면 자동 선택
                const item = items[0].dataset.value;
                selectItem(item, select, input, autocomplete, items);
            }
        } else if (e.key === 'Escape') {
            autocomplete.classList.remove('show');
            input.blur();
        }
    });
    
    // 외부 클릭 시 자동완성 닫기
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !autocomplete.contains(e.target)) {
            autocomplete.classList.remove('show');
        }
    });
}

// 하이라이트 업데이트
function updateHighlight(autocomplete, index) {
    const items = autocomplete.querySelectorAll('.autocomplete-item');
    items.forEach((item, i) => {
        if (i === index) {
            item.classList.add('highlighted');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('highlighted');
        }
    });
}

// 항목 선택
function selectItem(item, select, input, autocomplete, items) {
    // select에서 해당 옵션 찾기
    const options = Array.from(select.options);
    const option = options.find(opt => opt.value === item);
    
    if (option) {
        // 이미 선택되어 있지 않으면 선택
        if (!option.selected) {
            option.selected = true;
            
            // 선택된 항목이 보이도록 스크롤
            option.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            
            // select 박스에 포커스 (선택된 항목 강조)
            select.focus();
            
            // 잠시 후 포커스 해제 (시각적 피드백)
            setTimeout(() => {
                select.blur();
            }, 300);
        }
    }
    
    // 입력창 초기화 및 자동완성 닫기
    input.value = '';
    autocomplete.classList.remove('show');
    input.focus();
}

// 선택된 항목 표시 기능 초기화
function initSelectedItems(selectId, selectedContainerId) {
    const select = document.getElementById(selectId);
    const container = document.getElementById(selectedContainerId);
    
    if (!select || !container) return;
    
    // 초기 표시
    updateSelectedItems(select, container);
    
    // change 이벤트 리스너 추가
    select.addEventListener('change', function() {
        updateSelectedItems(select, container);
    });
}

// 선택된 항목 업데이트
function updateSelectedItems(select, container) {
    const selectedOptions = Array.from(select.selectedOptions);
    
    if (selectedOptions.length === 0) {
        container.innerHTML = '';
        container.style.display = 'none';
        return;
    }
    
    container.innerHTML = '';
    container.style.display = 'block';
    
    selectedOptions.forEach(option => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'selected-item';
        itemDiv.dataset.value = option.value;
        
        const itemText = document.createElement('span');
        itemText.className = 'selected-item-text';
        itemText.textContent = option.textContent;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'selected-item-remove';
        removeBtn.textContent = '×';
        removeBtn.title = '제거';
        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            removeSelectedItem(select, option.value, container);
        });
        
        itemDiv.appendChild(itemText);
        itemDiv.appendChild(removeBtn);
        container.appendChild(itemDiv);
    });
}

// 선택된 항목 제거
function removeSelectedItem(select, value, container) {
    const option = Array.from(select.options).find(opt => opt.value === value);
    
    if (option) {
        // 선택 해제
        option.selected = false;
        
        // change 이벤트 트리거
        select.dispatchEvent(new Event('change', { bubbles: true }));
        
        // 선택된 항목 목록 업데이트
        updateSelectedItems(select, container);
    }
}

// 데이터 다운로드
async function downloadData() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    // 선택된 지표 가져오기
    const commoditiesSelect = document.getElementById('commoditiesSelect');
    const stocksSelect = document.getElementById('stocksSelect');
    const exchangeSelect = document.getElementById('exchangeSelect');
    
    const selectedCommodities = Array.from(commoditiesSelect.selectedOptions).map(opt => opt.value);
    const selectedStocks = Array.from(stocksSelect.selectedOptions).map(opt => opt.value);
    const selectedExchange = Array.from(exchangeSelect.selectedOptions).map(opt => opt.value);
    
    // 선택된 항목 가져오기
    const selectedFeatures = [];
    if (document.getElementById('priceCheck').checked) {
        selectedFeatures.push('가격');
    }
    if (document.getElementById('volumeCheck').checked) {
        selectedFeatures.push('거래량');
    }
    
    // 로딩 표시
    showLoading(true);
    hideResult();
    
    try {
        const response = await fetch('/api/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                start_date: startDate,
                end_date: endDate,
                commodities: selectedCommodities,
                stocks: selectedStocks,
                exchange: selectedExchange,
                features: selectedFeatures
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            latestFilename = data.filename;
            showResult(data);
            document.getElementById('fileDownloadBtn').disabled = false;
        } else {
            showError(data.error || '데이터 수집 중 오류가 발생했습니다.');
        }
    } catch (error) {
        showError('요청 중 오류가 발생했습니다: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// 결과 표시
function showResult(data) {
    const resultSection = document.getElementById('resultSection');
    const resultContent = document.getElementById('resultContent');
    
    let html = `
        <div class="result-summary">
            <h3>✅ 데이터 수집 완료</h3>
            <p><strong>파일명:</strong> ${data.filename}</p>
            <p><strong>총 행 수:</strong> ${data.total_rows.toLocaleString()}건</p>
            <p><strong>총 컬럼 수:</strong> ${data.total_columns}개</p>
        </div>
    `;
    
    // 성공한 항목
    if (data.results && data.results.length > 0) {
        html += '<div class="result-list"><h4>✅ 수집 성공</h4><ul>';
        data.results.forEach(item => {
            html += `<li>${item.name} (${item.code}): ${item.count.toLocaleString()}건</li>`;
        });
        html += '</ul></div>';
    }
    
    // 실패한 항목
    if (data.errors && data.errors.length > 0) {
        html += '<div class="result-list error-list"><h4>⚠️ 수집 실패</h4><ul>';
        data.errors.forEach(item => {
            html += `<li>${item.name} (${item.code}): ${item.message}</li>`;
        });
        html += '</ul></div>';
    }
    
    // 미리보기
    if (data.preview && data.preview.length > 0) {
        html += '<div class="result-preview"><h4>📊 데이터 미리보기 (마지막 5행)</h4>';
        html += '<div class="table-container"><table class="preview-table"><thead><tr><th>날짜</th>';
        
        // 컬럼 헤더
        if (data.preview[0]) {
            Object.keys(data.preview[0]).forEach(col => {
                html += `<th>${col}</th>`;
            });
        }
        html += '</tr></thead><tbody>';
        
        // 데이터 행
        data.preview.forEach((row, idx) => {
            html += `<tr><td>${data.preview_dates[idx]}</td>`;
            Object.values(row).forEach(val => {
                const displayVal = val !== null && val !== undefined ? 
                    (typeof val === 'number' ? val.toLocaleString() : val) : '-';
                html += `<td>${displayVal}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table></div></div>';
    }
    
    resultContent.innerHTML = html;
    resultSection.style.display = 'block';
    
    // 그래프 그리기
    if (data.chart_data && data.chart_dates && Object.keys(data.chart_data).length > 0) {
        drawChart(data.chart_dates, data.chart_data);
    }
    
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

// 그래프 그리기 함수
function drawChart(dates, chartData) {
    const chartSection = document.getElementById('chartSection');
    const chartCanvas = document.getElementById('dataChart');
    
    if (!chartCanvas) {
        return;
    }
    
    // 기존 차트가 있으면 제거
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    // 색상 팔레트
    const colors = [
        'rgb(54, 162, 235)',   // 파란색
        'rgb(255, 99, 132)',   // 빨간색
        'rgb(75, 192, 192)',   // 청록색
        'rgb(255, 159, 64)',   // 주황색
        'rgb(153, 102, 255)',  // 보라색
        'rgb(255, 205, 86)',   // 노란색
        'rgb(201, 203, 207)',  // 회색
        'rgb(255, 99, 255)',   // 분홍색
        'rgb(99, 255, 132)',   // 연두색
        'rgb(99, 132, 255)',   // 남색
    ];
    
    // 데이터셋 생성 (거래량과 가격 구분)
    const datasets = [];
    let colorIndex = 0;
    let hasVolume = false;
    let hasPrice = false;
    
    Object.keys(chartData).forEach((key, index) => {
        // 거래량인지 확인 (컬럼명에 "Volume" 또는 "거래량" 포함)
        // 백엔드에서 "{name} (Volume)" 형식으로 생성됨
        const isVolume = key.includes('(Volume)') || key.includes('Volume') || key.includes('거래량');
        
        if (isVolume) {
            hasVolume = true;
        } else {
            hasPrice = true;
        }
        
        const baseColor = colors[colorIndex % colors.length];
        
        datasets.push({
            type: 'line', // 모든 데이터를 선 그래프로 표시
            label: key,
            data: chartData[key],
            borderColor: baseColor,
            backgroundColor: baseColor.replace('rgb', 'rgba').replace(')', ', 0.1)'),
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            yAxisID: isVolume ? 'y1' : 'y', // 거래량은 오른쪽 축(y1), 가격은 왼쪽 축(y)
            pointRadius: isVolume ? 0 : 0 // 거래량과 가격 모두 점 없음
        });
        colorIndex++;
    });
    
    // 현재 테마 확인
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const isDark = currentTheme === 'dark';
    const textColor = isDark ? '#e0e0e0' : '#333333';
    const gridColor = isDark ? '#404040' : '#e0e0e0';
    
    // Chart.js 생성
    const ctx = chartCanvas.getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: textColor
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: isDark ? 'rgba(45, 45, 68, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: isDark ? '#404040' : '#dee2e6',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                const value = context.parsed.y;
                                // 숫자 포맷팅
                                if (value >= 1000000) {
                                    label += (value / 1000000).toFixed(2) + 'M';
                                } else if (value >= 1000) {
                                    label += (value / 1000).toFixed(2) + 'K';
                                } else {
                                    label += value.toLocaleString();
                                }
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: '날짜',
                        color: textColor
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        maxTicksLimit: 20,
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: hasPrice,
                        text: '가격 (Price)',
                        color: textColor
                    },
                    ticks: {
                        color: textColor,
                        callback: function(value) {
                            if (value >= 1000000) {
                                return (value / 1000000).toFixed(1) + 'M';
                            } else if (value >= 1000) {
                                return (value / 1000).toFixed(1) + 'K';
                            }
                            return value.toLocaleString();
                        }
                    },
                    grid: {
                        color: gridColor,
                        drawOnChartArea: !hasVolume // 거래량이 있으면 격자선 겹침 방지
                    }
                },
                y1: {
                    type: 'linear',
                    display: hasVolume,
                    position: 'right',
                    title: {
                        display: hasVolume,
                        text: '거래량',
                        color: textColor
                    },
                    ticks: {
                        color: textColor,
                        callback: function(value) {
                            if (value >= 1000000000) {
                                return (value / 1000000000).toFixed(1) + 'B';
                            } else if (value >= 1000000) {
                                return (value / 1000000).toFixed(1) + 'M';
                            } else if (value >= 1000) {
                                return (value / 1000).toFixed(1) + 'K';
                            }
                            return value.toLocaleString();
                        }
                    },
                    grid: {
                        drawOnChartArea: false, // 오른쪽 축은 격자선 표시 안 함
                        color: gridColor
                    }
                }
            }
        }
    });
    
    // 그래프 섹션 표시
    chartSection.style.display = 'block';
}

// 파일 다운로드
function downloadFile() {
    if (!latestFilename) {
        showError('다운로드할 파일이 없습니다. 먼저 데이터를 추출하세요.');
        return;
    }
    
    window.location.href = `/api/download-file/${latestFilename}`;
}

// 파일 삭제
async function deleteFiles() {
    if (!confirm('생성된 모든 파일을 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        const response = await fetch('/api/delete-files', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(`✅ 총 ${data.deleted_count}개 파일이 삭제되었습니다.`);
            latestFilename = null;
            document.getElementById('fileDownloadBtn').disabled = true;
            hideResult();
        } else {
            showError(data.error || '파일 삭제 중 오류가 발생했습니다.');
        }
    } catch (error) {
        showError('요청 중 오류가 발생했습니다: ' + error.message);
    }
}

// 로딩 표시
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

// 결과 숨기기
function hideResult() {
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('chartSection').style.display = 'none';
    // 차트 인스턴스 제거
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
}

// 에러 표시
function showError(message) {
    alert('❌ ' + message);
}

