<script>
  export let currentRate = '---.--';
  export let change = 0;
  export let changeClass = '';
  export let lastUpdate = '--:--:--';
</script>

<div class="current-rate">
  <h2>現在のレート</h2>
  <div class="rate-value {changeClass}">{currentRate}</div>
  <div class="rate-change">変動: <span class={changeClass}>{change.toFixed(2)}</span></div>
  <div class="update-time">最終更新: {lastUpdate}</div>
</div>
