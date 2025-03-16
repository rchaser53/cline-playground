<script>
  export let threshold = 0.5;
  export let interval = 10;
  export let isMonitoring = false;
  
  // イベントディスパッチャー
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  function startMonitoring() {
    dispatch('start', { interval });
  }
  
  function stopMonitoring() {
    dispatch('stop');
  }
</script>

<div class="alert-settings">
  <h2>急変アラート設定</h2>
  
  <div class="setting-group">
    <label for="threshold">変動閾値 (円):</label>
    <input 
      type="number" 
      id="threshold" 
      min="0.01" 
      step="0.01" 
      bind:value={threshold}
      disabled={isMonitoring}
    >
  </div>
  
  <div class="setting-group">
    <label for="interval">更新間隔 (秒):</label>
    <input 
      type="number" 
      id="interval" 
      min="5" 
      step="1" 
      bind:value={interval}
      disabled={isMonitoring}
    >
  </div>
  
  {#if !isMonitoring}
    <button on:click={startMonitoring}>モニタリング開始</button>
  {:else}
    <button on:click={stopMonitoring}>モニタリング停止</button>
  {/if}
</div>
