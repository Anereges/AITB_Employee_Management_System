<template>
  <div class="chart-card">
    <h3 class="chart-title">{{ title }}</h3>
    <DoughnutChart :chartData="data" :chartOptions="options" />
  </div>
</template>

<script>
import DoughnutChart from '../chart/DoughnutChart.vue'

export default {
  name: 'ChartCard',
  components: {
    DoughnutChart
  },
  props: {
    title: {
      type: String,
      default: 'Doughnut Chart'
    }
  },
  data() {
    return {
      data: {
        labels: ['Sleep', 'Gym', 'Code', 'Nap', 'Hike'],
        datasets: [
          {
            label: 'My Daily Activity',
            data: [7, 2.5, 8, 1.5, 1],
            backgroundColor: [
              'purple',
              'gold',
              'teal',
              'skyblue',
              'grey'
            ],
            borderWidth: 1,
            hoverOffset: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%' // To create doughnut hole size
      }
    }
  }
}
</script>

<style scoped>
.chart-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  width: 300px;
  height: 300px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.chart-title {
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 1.2rem;
  text-align: center;
}
</style>
