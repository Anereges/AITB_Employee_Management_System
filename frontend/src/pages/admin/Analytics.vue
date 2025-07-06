<template>
  <div class="analytics-page">
    <div class="page-header">
      <h1 class="page-title">Analytics Dashboard</h1>
      <div class="time-filters">
        <button
          v-for="filter in timeFilters"
          :key="filter.value"
          @click="changeFilter(filter.value)"
          :class="{ active: activeFilter === filter.value }"
          class="time-filter"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <div class="analytics-grid">
      <div class="metric-card" v-if="metrics">
        <h3>Total Employees</h3>
        <div class="metric-value">{{ metrics.totalEmployees }}</div>
        <div :class="['metric-change', metrics.totalEmployeesChange >= 0 ? 'positive' : 'negative']">
          <i :class="metrics.totalEmployeesChange >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
          {{ Math.abs(metrics.totalEmployeesChange) }}% from last period
        </div>
      </div>

      <div class="metric-card" v-if="metrics">
        <h3>Active Employees</h3>
        <div class="metric-value">{{ metrics.activeEmployees }}</div>
        <div :class="['metric-change', metrics.activeEmployeesChange >= 0 ? 'positive' : 'negative']">
          <i :class="metrics.activeEmployeesChange >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
          {{ Math.abs(metrics.activeEmployeesChange) }}% from last period
        </div>
      </div>

      <div class="metric-card" v-if="metrics">
        <h3>New Hires</h3>
        <div class="metric-value">{{ metrics.newHires }}</div>
        <div :class="['metric-change', metrics.newHiresChange >= 0 ? 'positive' : 'negative']">
          <i :class="metrics.newHiresChange >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
          {{ Math.abs(metrics.newHiresChange) }}% from last period
        </div>
      </div>

      <div class="metric-card" v-if="metrics">
        <h3>Turnover Rate</h3>
        <div class="metric-value">{{ metrics.turnoverRate }}%</div>
        <div :class="['metric-change', metrics.turnoverRateChange >= 0 ? 'positive' : 'negative']">
          <i :class="metrics.turnoverRateChange >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
          {{ Math.abs(metrics.turnoverRateChange) }}% from last period
        </div>
      </div>

      <div class="chart-card">
        <h3>Employee Growth</h3>
        <div class="chart-container">
          <canvas ref="growthChart"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <h3>Department Distribution</h3>
        <div class="chart-container">
          <canvas ref="departmentChart"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <h3>Gender Ratio</h3>
        <div class="chart-container">
          <canvas ref="genderChart"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <h3>Age Distribution</h3>
        <div class="chart-container">
          <canvas ref="ageChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'
import axios from 'axios'

const timeFilters = [
  { label: 'Daily', value: 'day' },
  { label: 'Weekly', value: 'week' },
  { label: 'Monthly', value: 'month' },
  { label: 'Quarterly', value: 'quarter' },
  { label: 'Yearly', value: 'year' }
]

const activeFilter = ref('month')

const growthChart = ref(null)
const departmentChart = ref(null)
const genderChart = ref(null)
const ageChart = ref(null)

let growthChartInstance = null
let departmentChartInstance = null
let genderChartInstance = null
let ageChartInstance = null

const metrics = ref(null)

async function fetchMetrics() {
  try {
    const response = await axios.get(`/api/admin/analytics/summary?period=${activeFilter.value}`)
    metrics.value = response.data.data
  } catch (err) {
    console.error('Failed to fetch metrics:', err)
  }
}

async function fetchEmployeeGrowth() {
  try {
    const response = await axios.get(`/api/admin/analytics/employee-growth?period=${activeFilter.value}`)
    const data = response.data.data
    if (growthChartInstance) growthChartInstance.destroy()

    growthChartInstance = new Chart(growthChart.value, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Total Employees',
          data: data.counts,
          borderColor: '#4299e1',
          backgroundColor: 'rgba(66, 153, 225, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    })
  } catch (err) {
    console.error('Failed to fetch employee growth data:', err)
  }
}

async function fetchDepartmentDistribution() {
  try {
    const response = await axios.get(`/api/admin/analytics/department-distribution`)
    const data = response.data.data || []

    // Robust processing for department names
    const processedData = data.map(d => ({
      department: (typeof d.department === 'object' && d.department !== null && d.department.name)
        ? d.department.name
        : (typeof d.department === 'string' && d.department.trim() !== '')
          ? d.department
          : 'No Department',
      count: d.count || 0
    }))

    if (departmentChartInstance) departmentChartInstance.destroy()

    departmentChartInstance = new Chart(departmentChart.value, {
      type: 'doughnut',
      data: {
        labels: processedData.map(d => d.department),
        datasets: [{
          data: processedData.map(d => d.count),
          backgroundColor: [
            '#4299e1', '#9f7aea', '#f56565', '#48bb78', '#ed8936',
            '#667eea', '#a0aec0', '#f687b3', '#4fd1c5', '#f6ad55'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || ''
                const value = context.raw || 0
                const total = context.dataset.data.reduce((a, b) => a + b, 0)
                const percentage = total ? Math.round((value / total) * 100) : 0
                return `${label}: ${value} (${percentage}%)`
              }
            }
          }
        }
      }
    })
  } catch (err) {
    console.error('Failed to fetch department distribution:', err)
  }
}

async function fetchGenderDistribution() {
  try {
    const response = await axios.get(`/api/admin/analytics/gender-distribution`)
    const data = response.data.data
    if (genderChartInstance) genderChartInstance.destroy()

    genderChartInstance = new Chart(genderChart.value, {
      type: 'pie',
      data: {
        labels: data.map(d => d.gender),
        datasets: [{
          data: data.map(d => d.count),
          backgroundColor: ['#3182ce', '#b779e1', '#f6ad55'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    })
  } catch (err) {
    console.error('Failed to fetch gender distribution:', err)
  }
}

async function fetchAgeDistribution() {
  try {
    const response = await axios.get(`/api/admin/analytics/age-distribution`)
    const data = response.data.data
    if (ageChartInstance) ageChartInstance.destroy()

    ageChartInstance = new Chart(ageChart.value, {
      type: 'bar',
      data: {
        labels: data.map(d => d.ageRange),
        datasets: [{
          label: 'Employees',
          data: data.map(d => d.count),
          backgroundColor: '#4299e1'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    })
  } catch (err) {
    console.error('Failed to fetch age distribution:', err)
  }
}

async function loadAllData() {
  await fetchMetrics()
  await fetchEmployeeGrowth()
  await fetchDepartmentDistribution()
  await fetchGenderDistribution()
  await fetchAgeDistribution()
}

function changeFilter(filter) {
  activeFilter.value = filter
}

onMounted(() => {
  loadAllData()
})

watch(activeFilter, () => {
  loadAllData()
})
</script>

<style scoped>
.analytics-page {
  @apply bg-white rounded-xl shadow-sm p-6;
}

.page-header {
  @apply flex flex-col md:flex-row items-start md:items-center justify-between mb-6;
}

.page-title {
  @apply text-2xl font-bold text-gray-800 mb-4 md:mb-0;
}

.time-filters {
  @apply flex space-x-1 bg-gray-100 p-1 rounded-lg;
}

.time-filter {
  @apply px-3 py-1 rounded-md text-sm text-gray-600 cursor-pointer;
}

.time-filter.active {
  @apply bg-white text-emerald-600 shadow-sm;
}

.analytics-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6;
}

.metric-card {
  @apply p-4 border border-gray-200 rounded-lg;
}

.metric-card h3 {
  @apply text-sm font-medium text-gray-500 mb-1;
}

.metric-value {
  @apply text-2xl font-bold text-gray-800 mb-1;
}

.metric-change {
  @apply text-xs flex items-center;
}

.metric-change.positive {
  @apply text-emerald-600;
}

.metric-change.negative {
  @apply text-red-600;
}

.metric-change i {
  @apply mr-1;
}

.chart-card {
  @apply p-4 border border-gray-200 rounded-lg lg:col-span-2;
}

.chart-card h3 {
  @apply text-lg font-semibold text-gray-800 mb-4;
}

.chart-container {
  @apply h-64;
}
</style>
