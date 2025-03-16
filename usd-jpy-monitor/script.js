// グローバル変数
let monitoringInterval;
let rateHistory = [];
let chart;
let lastRate = null;

// DOM要素
const currentRateElement = document.getElementById('current-rate-value');
const changeValueElement = document.getElementById('change-value');
const updateTimeElement = document.getElementById('update-time');
const thresholdInput = document.getElementById('threshold');
const intervalInput = document.getElementById('interval');
const startButton = document.getElementById('start-monitoring');
const stopButton = document.getElementById('stop-monitoring');
const historyTableBody = document.getElementById('history-body');
const alertsContainer = document.getElementById('alerts');

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    // イベントリスナーの設定
    startButton.addEventListener('click', startMonitoring);
    stopButton.addEventListener('click', stopMonitoring);
    
    // チャートの初期化
    initChart();
    
    // 初回のレート取得
    fetchExchangeRate();
});

// チャートの初期化
function initChart() {
    const ctx = document.getElementById('rate-chart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'USD/JPY レート',
                data: [],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

// 為替レートの取得
async function fetchExchangeRate() {
    try {
        // Free APIを使用して為替レートを取得
        // 注意: 実際の使用では、APIキーが必要な場合があります
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        
        if (data && data.rates && data.rates.JPY) {
            const currentRate = data.rates.JPY;
            updateRateDisplay(currentRate);
        } else {
            throw new Error('レートデータが見つかりません');
        }
    } catch (error) {
        console.error('為替レートの取得に失敗しました:', error);
        // エラーメッセージを表示
        currentRateElement.textContent = 'エラー';
        currentRateElement.style.color = '#e74c3c';
    }
}

// レート表示の更新
function updateRateDisplay(currentRate) {
    // 前回のレートとの差分を計算
    let change = 0;
    let changeClass = '';
    
    if (lastRate !== null) {
        change = currentRate - lastRate;
        
        // 変動の大きさに応じてクラスを設定
        const threshold = parseFloat(thresholdInput.value);
        
        if (change > 0) {
            changeClass = Math.abs(change) >= threshold ? 'significant-increase' : 'increase';
        } else if (change < 0) {
            changeClass = Math.abs(change) >= threshold ? 'significant-decrease' : 'decrease';
        }
        
        // 急変アラートの処理
        if (Math.abs(change) >= threshold) {
            addAlert(currentRate, lastRate, change);
        }
    }
    
    // 現在のレートを表示
    currentRateElement.textContent = currentRate.toFixed(2);
    currentRateElement.className = 'rate-value ' + changeClass;
    
    // 変動値を表示
    changeValueElement.textContent = change.toFixed(2);
    changeValueElement.className = changeClass;
    
    // 更新時間を表示
    const now = new Date();
    updateTimeElement.textContent = `最終更新: ${formatTime(now)}`;
    
    // 履歴に追加
    addToHistory(currentRate, change, changeClass);
    
    // チャートを更新
    updateChart(currentRate);
    
    // 現在のレートを保存
    lastRate = currentRate;
}

// 履歴テーブルに追加
function addToHistory(rate, change, changeClass) {
    const now = new Date();
    const timeString = formatTime(now);
    
    // 履歴データを保存
    rateHistory.push({
        time: now,
        rate: rate,
        change: change
    });
    
    // テーブルに行を追加
    const row = document.createElement('tr');
    
    const timeCell = document.createElement('td');
    timeCell.textContent = timeString;
    row.appendChild(timeCell);
    
    const rateCell = document.createElement('td');
    rateCell.textContent = rate.toFixed(2);
    row.appendChild(rateCell);
    
    const changeCell = document.createElement('td');
    changeCell.textContent = change.toFixed(2);
    changeCell.className = changeClass;
    row.appendChild(changeCell);
    
    const statusCell = document.createElement('td');
    if (Math.abs(change) >= parseFloat(thresholdInput.value)) {
        statusCell.textContent = '急変';
        statusCell.className = changeClass;
    } else {
        statusCell.textContent = '通常';
    }
    row.appendChild(statusCell);
    
    // テーブルの先頭に追加
    historyTableBody.insertBefore(row, historyTableBody.firstChild);
    
    // 履歴が多すぎる場合は古いものを削除
    if (historyTableBody.children.length > 100) {
        historyTableBody.removeChild(historyTableBody.lastChild);
    }
}

// チャートの更新
function updateChart(rate) {
    const now = new Date();
    const timeString = formatTime(now);
    
    // データセットにデータを追加
    chart.data.labels.push(timeString);
    chart.data.datasets[0].data.push(rate);
    
    // データが多すぎる場合は古いものを削除
    if (chart.data.labels.length > 20) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }
    
    // チャートを更新
    chart.update();
}

// アラートの追加
function addAlert(currentRate, previousRate, change) {
    // 「アラートはありません」メッセージを削除
    const noAlertsElement = alertsContainer.querySelector('.no-alerts');
    if (noAlertsElement) {
        alertsContainer.removeChild(noAlertsElement);
    }
    
    // 新しいアラート要素を作成
    const alertElement = document.createElement('div');
    alertElement.className = 'alert-item';
    
    const direction = change > 0 ? '上昇' : '下落';
    const changeClass = change > 0 ? 'significant-increase' : 'significant-decrease';
    
    const alertTimeElement = document.createElement('div');
    alertTimeElement.className = 'alert-time';
    alertTimeElement.textContent = `${formatTime(new Date())} - 急変検知`;
    
    const alertDetailsElement = document.createElement('div');
    alertDetailsElement.className = 'alert-details';
    alertDetailsElement.innerHTML = `
        USD/JPYが<span class="${changeClass}">${Math.abs(change).toFixed(2)}円 ${direction}</span>しました。
        <br>前回: ${previousRate.toFixed(2)} → 現在: ${currentRate.toFixed(2)}
    `;
    
    alertElement.appendChild(alertTimeElement);
    alertElement.appendChild(alertDetailsElement);
    
    // アラートコンテナの先頭に追加
    alertsContainer.insertBefore(alertElement, alertsContainer.firstChild);
    
    // アラート音を再生（オプション）
    playAlertSound();
}

// アラート音の再生
function playAlertSound() {
    // ブラウザの通知APIを使用（許可が必要）
    if (Notification.permission === 'granted') {
        new Notification('USD/JPY 急変アラート', {
            body: '為替レートに急激な変動が検出されました。',
            icon: 'https://example.com/icon.png' // 適切なアイコンに変更してください
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
    
    // 簡易的なビープ音
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.5;
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
        }, 300);
    } catch (e) {
        console.error('アラート音の再生に失敗しました:', e);
    }
}

// 時間のフォーマット
function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// モニタリングの開始
function startMonitoring() {
    // 既存のインターバルがあれば停止
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
    }
    
    // 入力値の取得
    const interval = Math.max(5, parseInt(intervalInput.value)) * 1000;
    
    // ボタンの状態を更新
    startButton.disabled = true;
    stopButton.disabled = false;
    
    // 定期的にレートを取得
    fetchExchangeRate(); // 即時実行
    monitoringInterval = setInterval(fetchExchangeRate, interval);
    
    console.log(`モニタリングを開始しました（間隔: ${interval / 1000}秒）`);
}

// モニタリングの停止
function stopMonitoring() {
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
        
        // ボタンの状態を更新
        startButton.disabled = false;
        stopButton.disabled = true;
        
        console.log('モニタリングを停止しました');
    }
}
