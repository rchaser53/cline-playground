<script>
  import RateChart from './RateChart.svelte';
  
  export let rateHistory = [];
  export let threshold = 0.5;
  
  // チャート用のデータを準備
  $: chartData = rateHistory.map(item => item.rate);
  $: chartLabels = rateHistory.map(item => item.timeString);
  
  // 変動クラスを取得する関数
  function getChangeClass(change) {
    if (change > 0) {
      return Math.abs(change) >= threshold ? 'significant-increase' : 'increase';
    } else if (change < 0) {
      return Math.abs(change) >= threshold ? 'significant-decrease' : 'decrease';
    }
    return '';
  }
  
  // 状態テキストを取得する関数
  function getStatusText(change) {
    return Math.abs(change) >= threshold ? '急変' : '通常';
  }
</script>

<div class="history-container">
  <h2>レート履歴</h2>
  
  <RateChart rateData={chartData} labels={chartLabels} />
  
  <div class="history-table-container">
    <table>
      <thead>
        <tr>
          <th>時間</th>
          <th>レート</th>
          <th>変動</th>
          <th>状態</th>
        </tr>
      </thead>
      <tbody>
        {#each rateHistory as item}
          <tr>
            <td>{item.timeString}</td>
            <td>{item.rate.toFixed(2)}</td>
            <td class={getChangeClass(item.change)}>{item.change.toFixed(2)}</td>
            <td class={getChangeClass(item.change)}>{getStatusText(item.change)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
