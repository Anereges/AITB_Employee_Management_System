<template>
  <div class="productivity-chart">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';

export default {
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const chartCanvas = ref(null);
    let chartInstance = null;

    const initChart = () => {
      if (chartInstance) {
        chartInstance.destroy();
      }

      if (chartCanvas.value) {
        chartInstance = new Chart(chartCanvas.value, {
          type: 'line',
          data: {
            labels: props.data.labels,
            datasets: [{
              label: 'Productivity %',
              data: props.data.data,
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              borderColor: '#4f46e5',
              borderWidth: 2,
              tension: 0.3,
              fill: true,
              pointBackgroundColor: '#4f46e5',
              pointRadius: 4,
              pointHoverRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: (context) => `${context.parsed.y}% productivity`
                }
              }
            },
            scales: {
              y: {
                beginAtZero: false,
                min: 50,
                max: 100,
                ticks: {
                  callback: (value) => `${value}%`
                }
              }
            }
          }
        });
      }
    };

    onMounted(initChart);
    watch(() => props.data, initChart, { deep: true });

    return { chartCanvas };
  }
};
</script>

<style scoped>
.productivity-chart {
  width: 100%;
  height: 100%;
}
</style>