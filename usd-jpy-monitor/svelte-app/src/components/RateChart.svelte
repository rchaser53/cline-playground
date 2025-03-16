<script>
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';
  
  export let rateData = [];
  export let labels = [];
  
  let chartElement;
  let chart;
  
  onMount(() => {
    const ctx = chartElement.getContext('2d');
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'USD/JPY レート',
          data: rateData,
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
  });
  
  // データが変更されたらチャートを更新
  $: if (chart && rateData.length > 0) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = rateData;
    chart.update();
  }
  
  onDestroy(() => {
    if (chart) {
      chart.destroy();
    }
  });
</script>

<div class="chart-container">
  <canvas bind:this={chartElement}></canvas>
</div>
