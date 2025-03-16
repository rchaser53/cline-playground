<script>
  import { onMount, onDestroy } from 'svelte';
  import CurrentRate from './components/CurrentRate.svelte';
  import AlertSettings from './components/AlertSettings.svelte';
  import RateHistory from './components/RateHistory.svelte';
  import AlertHistory from './components/AlertHistory.svelte';
  
  // 状態変数
  let currentRate = '---.--';
  let change = 0;
  let changeClass = '';
  let lastUpdate = '--:--:--';
  let threshold = 0.5;
  let interval = 10;
  let isMonitoring = false;
  let monitoringInterval;
  let lastRate = null;
  let rateHistory = [];
  let alerts = [];
  
  // 為替レートの取得
  async function fetchExchangeRate() {
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await response.json();
      
      if (data && data.rates && data.rates.JPY) {
        const newRate = data.rates.JPY;
        updateRateDisplay(newRate);
      } else {
        throw new Error('レートデータが見つかりません');
      }
    } catch (error) {
      console.error('為替レートの取得に失敗しました:', error);
      currentRate = 'エラー';
      changeClass = 'error';
    }
  }
  
  // レート表示の更新
  function updateRateDisplay(newRate) {
    // 前回のレートとの差分を計算
    let newChange = 0;
    let newChangeClass = '';
    
    if (lastRate !== null) {
      newChange = newRate - lastRate;
      
      // 変動の大きさに応じてクラスを設定
      if (newChange > 0) {
        newChangeClass = Math.abs(newChange) >= threshold ? 'significant-increase' : 'increase';
      } else if (newChange < 0) {
        newChangeClass = Math.abs(newChange) >= threshold ? 'significant-decrease' : 'decrease';
      }
      
      // 急変アラートの処理
      if (Math.abs(newChange) >= threshold) {
        addAlert(newRate, lastRate, newChange);
      }
    }
    
    // 状態を更新
    currentRate = newRate.toFixed(2);
    change = newChange;
    changeClass = newChangeClass;
    
    // 更新時間を表示
    const now = new Date();
    lastUpdate = formatTime(now);
    
    // 履歴に追加
    addToHistory(newRate, newChange, now);
    
    // 現在のレートを保存
    lastRate = newRate;
  }
  
  // 履歴に追加
  function addToHistory(rate, change, time) {
    const timeString = formatTime(time);
    
    // 履歴データを保存
    rateHistory = [{
      time,
      timeString,
      rate,
      change
    }, ...rateHistory].slice(0, 100); // 最大100件まで
  }
  
  // アラートの追加
  function addAlert(currentRate, previousRate, change) {
    const now = new Date();
    const timeString = formatTime(now);
    const direction = change > 0 ? '上昇' : '下落';
    const changeClass = change > 0 ? 'significant-increase' : 'significant-decrease';
    
    const alertDetails = `
      USD/JPYが<span class="${changeClass}">${Math.abs(change).toFixed(2)}円 ${direction}</span>しました。
      <br>前回: ${previousRate.toFixed(2)} → 現在: ${currentRate.toFixed(2)}
    `;
    
    // アラートを追加
    alerts = [{
      time: timeString,
      details: alertDetails
    }, ...alerts];
    
    // アラート音を再生
    playAlertSound();
  }
  
  // アラート音の再生
  function playAlertSound() {
    // ブラウザの通知APIを使用（許可が必要）
    if (Notification.permission === 'granted') {
      new Notification('USD/JPY 急変アラート', {
        body: '為替レートに急激な変動が検出されました。'
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
  function startMonitoring(event) {
    // 既存のインターバルがあれば停止
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
    }
    
    // 入力値の取得
    interval = event.detail.interval;
    const intervalMs = Math.max(5, interval) * 1000;
    
    // 状態を更新
    isMonitoring = true;
    
    // 定期的にレートを取得
    fetchExchangeRate(); // 即時実行
    monitoringInterval = setInterval(fetchExchangeRate, intervalMs);
    
    console.log(`モニタリングを開始しました（間隔: ${interval}秒）`);
  }
  
  // モニタリングの停止
  function stopMonitoring() {
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      monitoringInterval = null;
      
      // 状態を更新
      isMonitoring = false;
      
      console.log('モニタリングを停止しました');
    }
  }
  
  // コンポーネントのマウント時に初回のレート取得
  onMount(() => {
    fetchExchangeRate();
  });
  
  // コンポーネントの破棄時にインターバルをクリア
  onDestroy(() => {
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
    }
  });
</script>

<main>
  <div class="container">
    <h1>ドル円為替相場モニター</h1>
    
    <div class="rate-container">
      <CurrentRate 
        {currentRate} 
        {change} 
        {changeClass} 
        lastUpdate={lastUpdate} 
      />
      
      <AlertSettings 
        bind:threshold 
        bind:interval 
        {isMonitoring}
        on:start={startMonitoring}
        on:stop={stopMonitoring}
      />
    </div>
    
    <RateHistory 
      rateHistory={rateHistory} 
      {threshold} 
    />
    
    <AlertHistory 
      alerts={alerts} 
    />
  </div>
</main>
