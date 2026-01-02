/**
 * Stock Data Collector Logic
 * Connects to Google Apps Script Backend
 */

const app = {
    config: {
        gasUrl: localStorage.getItem('gas_app_url') || '',
        chartInstance: null
    },

    init: function () {
        // Set default dates (Today and 1 month ago)
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);

        document.getElementById('end-date').valueAsDate = today;
        document.getElementById('start-date').valueAsDate = oneMonthAgo;

        // Load saved URL logic
        if (this.config.gasUrl) {
            document.getElementById('gas-url').value = this.config.gasUrl;
            document.getElementById('config-panel').style.display = 'none'; // Hide if already set
        }
    },

    saveConfig: function () {
        const url = document.getElementById('gas-url').value.trim();
        if (!url) return alert('URL을 입력해주세요.');

        this.setStatus('loading', '연결 테스트 중...');

        // Test Connection
        fetch(`${url}?action=test`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'ok') {
                    localStorage.setItem('gas_app_url', url);
                    this.config.gasUrl = url;
                    this.setStatus('success', '연결 성공! 설정이 저장되었습니다.');
                    setTimeout(() => {
                        document.getElementById('config-panel').style.display = 'none';
                        this.setStatus('', ''); // Clear status
                    }, 1000);
                } else {
                    throw new Error('Invalid response');
                }
            })
            .catch(err => {
                this.setStatus('error', '연결 실패. URL을 확인해주세요. (CORS 문제일 수 있으니 배포 시 "Anyone" 접근 권한 확인)');
                console.error(err);
            });
    },

    fetchData: function () {
        if (!this.config.gasUrl) {
            document.getElementById('config-panel').style.display = 'block';
            return alert('먼저 GAS Web App URL을 설정해주세요.');
        }

        const ticker = document.getElementById('ticker-select').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        if (ticker === 'Select') return alert('종목을 선택해주세요.');
        if (!startDate || !endDate) return alert('날짜를 입력해주세요.');

        this.setStatus('loading', `${ticker} 데이터 가져오는 중...`);
        document.getElementById('fetch-btn').disabled = true;

        const url = `${this.config.gasUrl}?action=fetch_stock&ticker=${encodeURIComponent(ticker)}&start_date=${startDate}&end_date=${endDate}`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                document.getElementById('fetch-btn').disabled = false;

                if (data.error) throw new Error(data.error);
                if (!data.data || data.data.length === 0) throw new Error('데이터가 없습니다.');

                this.lastData = data.data; // Save for CSV export
                this.lastTicker = ticker;

                this.renderResults(data.data);
                this.setStatus('success', `성공! ${data.data.length}개의 데이터를 가져왔습니다.`);
            })
            .catch(err => {
                document.getElementById('fetch-btn').disabled = false;
                this.setStatus('error', `오류 발생: ${err.message}`);
            });
    },

    renderResults: function (data) {
        document.getElementById('result-section').style.display = 'block';

        // 1. Render Table
        const tbody = document.getElementById('table-body');
        tbody.innerHTML = '';
        // Show only last 100 rows if too many to prevent DOM lag, or implement pagination. 
        // For simplicity, showing all but stored in memory.
        data.slice().reverse().forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${row.date}</td><td>${Number(row.price).toLocaleString()}</td>`;
            tbody.appendChild(tr);
        });

        // 2. Render Chart
        this.renderChart(data);
    },

    renderChart: function (data) {
        const ctx = document.getElementById('stockChart').getContext('2d');

        if (this.config.chartInstance) {
            this.config.chartInstance.destroy();
        }

        this.config.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.date),
                datasets: [{
                    label: 'Price',
                    data: data.map(d => d.price),
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    },

    downloadCSV: function () {
        if (!this.lastData) return;

        const header = ['Date', 'Price'];
        const rows = this.lastData.map(d => `${d.date},${d.price}`);
        const csvContent = [header.join(','), ...rows].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${this.lastTicker}_data.csv`);
        link.click();
    },

    setStatus: function (type, msg) {
        const box = document.getElementById('status-box');
        box.className = `status-box ${type}`;
        box.innerText = msg;
    }
};

window.onload = function () {
    app.init();
};
