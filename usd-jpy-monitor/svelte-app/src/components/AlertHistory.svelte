<script>
  export let alerts = [];
  
  // アラートがない場合のメッセージ
  $: hasAlerts = alerts.length > 0;
</script>

<div class="alert-container">
  <h2>急変アラート履歴</h2>
  
  <div class="alerts">
    {#if hasAlerts}
      {#each alerts as alert}
        <div class="alert-item">
          <div class="alert-time">{alert.time} - 急変検知</div>
          <div class="alert-details">
            {@html alert.details}
          </div>
        </div>
      {/each}
    {:else}
      <div class="no-alerts">アラートはありません</div>
    {/if}
  </div>
</div>
