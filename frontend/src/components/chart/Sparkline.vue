<template>
  <canvas ref="canvas"></canvas>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';

export default {
  props: {
    data: {
      type: Array,
      required: true
    },
    color: {
      type: String,
      default: '#4f46e5'
    }
  },
  setup(props) {
    const canvas = ref(null);
    let chart = null;

    const renderChart = () => {
      if (chart) {
        chart.destroy();
      }

      if (canvas.value) {
        chart = new Chart(canvas.value, {
          type: 'line',
          data: {
            labels: props.data.map((_, i) => i),
            datasets: [{
              data: props.data,
              borderColor: props.color,
              borderWidth: 2,
              tension: 0.4,
              fill: false,
              pointRadius: 0
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
                enabled: false
              }
            },
            scales: {
              x: {
                display: false
              },
              y: {
                display: false,
                min: Math.min(...props.data) - 5,
                max: Math.max(...props.data) + 5
              }
            }
          }
        });
      }
    };

    onMounted(renderChart);
    watch(() => props.data, renderChart);

    return { canvas };
  }
};
</script>

<style scoped>
canvas {
  width: 100%;
  height: 100%;
}
</style>