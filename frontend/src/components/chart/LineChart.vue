<script setup>
import { ref, onMounted, watch } from 'vue';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';

Chart.register(...registerables);

const props = defineProps({
  area: {
    type: Boolean,
    default: false
  }
});

const chartRef = ref(null);
const chartInstance = ref(null);
const chartData = ref({
  labels: [],
  datasets: []
});
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: false,
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
  },
  elements: {
    line: {
      tension: 0.4
    }
  }
});

const initChart = () => {
  if (chartRef.value) {
    const data = props.area 
      ? {
          ...chartData.value,
          datasets: chartData.value.datasets.map(dataset => ({
            ...dataset,
            fill: true,
            backgroundColor: dataset.backgroundColor || `${dataset.borderColor}20`
          }))
        }
      : chartData.value;

    if (chartInstance.value) {
      chartInstance.value.destroy();
    }

    chartInstance.value = new Chart(chartRef.value, {
      type: 'line',
      data,
      options: chartOptions.value
    });
  }
};

const fetchEmployeeGrowth = async () => {
  try {
    const response = await axios.get('/api/admin/analytics/employee-growth');
    const data = response.data.data;
    chartData.value = {
      labels: data.labels,
      datasets: [{
        label: 'Total Employees',
        data: data.counts,
        borderColor: '#4299e1',
        backgroundColor: 'rgba(66, 153, 225, 0.1)',
        tension: 0.4,
        fill: props.area
      }]
    };
    initChart();
  } catch (error) {
    console.error('Failed to fetch employee growth data:', error);
  }
};

onMounted(() => {
  fetchEmployeeGrowth();
});

watch(() => props.area, () => {
  initChart();
});
</script>

<template>
  <div class="line-chart-container">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<style scoped>
.line-chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}

@media (max-width: 768px) {
  .line-chart-container {
    height: 250px;
  }
}
</style>
