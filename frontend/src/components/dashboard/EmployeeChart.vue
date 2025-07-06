<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3>Employee Distribution</h3>
      <div class="chart-actions">
        <button class="action-btn active">Month</button>
        <button class="action-btn">Quarter</button>
        <button class="action-btn">Year</button>
      </div>
    </div>
    <div class="chart-container">
      <canvas ref="chart"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios' 
import Chart from 'chart.js/auto'

const chart = ref(null)
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

function getMonthIndex(dateStr) {
  if (!dateStr) return null
  const date = new Date(dateStr)
  return date.getMonth() // 0 = Jan
}

onMounted(async () => {
  try {
    const response = await api.get('/api/employees') // ✅ Authenticated request
    const employees = response.data.data || []

    const newHires = Array(months.length).fill(0)
    const terminations = Array(months.length).fill(0)

    employees.forEach(emp => {
      const hireMonth = getMonthIndex(emp.hireDate)
      if (hireMonth !== null && hireMonth < months.length) {
        newHires[hireMonth] += 1
      }

      const termMonth = getMonthIndex(emp.terminationDate)
      if (termMonth !== null && termMonth < months.length) {
        terminations[termMonth] += 1
      }
    })

    new Chart(chart.value, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            label: 'New Hires',
            data: newHires,
            backgroundColor: '#38a169'
          },
          {
            label: 'Terminations',
            data: terminations,
            backgroundColor: '#e53e3e'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { drawBorder: false }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    })
  } catch (error) {
    console.error('Error fetching employee data:', error)
  }
})
</script>


<style scoped>
.chart-card {
  @apply bg-white rounded-xl shadow-sm p-6;
}
.chart-header {
  @apply flex items-center justify-between mb-6;
}
.chart-header h3 {
  @apply text-lg font-semibold text-gray-800;
}
.chart-actions {
  @apply flex space-x-2;
}
.action-btn {
  @apply px-3 py-1 text-sm rounded-lg border border-gray-200 text-gray-600;
}
.action-btn.active {
  @apply bg-emerald-100 text-emerald-600 border-emerald-100;
}
.chart-container {
  @apply h-80;
}
</style>
