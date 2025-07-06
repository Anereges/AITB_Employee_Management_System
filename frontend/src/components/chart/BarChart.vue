<script setup>
import { onMounted, ref, watch } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({
      labels: [],
      datasets: []
    })
  },
  options: {
    type: Object,
    default: () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            drawBorder: false
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) label += ': ';
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency: 'USD' 
                }).format(context.parsed.y);
              }
              return label;
            }
          }
        }
      }
    })
  },
  horizontal: {
    type: Boolean,
    default: false
  }
});

const chartRef = ref(null);
const chartInstance = ref(null);

const initChart = () => {
  if (chartRef.value) {
    const chartType = props.horizontal ? 'bar' : 'bar';
    
    chartInstance.value = new Chart(chartRef.value, {
      type: chartType,
      data: props.data,
      options: props.options
    });
  }
};

onMounted(initChart);

watch(
  () => props.data,
  (newData) => {
    if (chartInstance.value) {
      chartInstance.value.data = newData;
      chartInstance.value.update();
    }
  },
  { deep: true }
);

watch(
  () => props.horizontal,
  () => {
    if (chartInstance.value) {
      chartInstance.value.destroy();
      initChart();
    }
  }
);
</script>

<template>
  <div class="bar-chart-container">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<style scoped>
.bar-chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}

@media (max-width: 768px) {
  .bar-chart-container {
    height: 250px;
  }
}
</style>