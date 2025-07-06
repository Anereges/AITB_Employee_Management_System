<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

import DefaultLayout from '@/layouts/DefaultLayout.vue'
import KpiCard from '@/components/dashboard/KpiCard.vue'
import LineChart from '@/components/chart/LineChart.vue'
import PieChart from '@/components/chart/PieChart.vue'

const revenueData = ref({
  labels: [],
  datasets: [
    {
      label: 'Revenue',
      data: [],
      borderColor: '#4361ee',
      backgroundColor: 'rgba(67, 97, 238, 0.1)',
      tension: 0.4,
      fill: true
    }
  ]
})

const trafficData = ref({
  labels: [],
  datasets: [
    {
      data: [],
      backgroundColor: ['#4361ee', '#3f37c9', '#4895ef', '#4cc9f0'],
      borderWidth: 0
    }
  ]
})

const kpiStats = ref({
  totalRevenue: 0,
  newCustomers: 0,
  orders: 0,
  conversionRate: 0
})

const fetchDashboardData = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/dashboard/overview', {
      withCredentials: true
    })
    const data = response.data.data

    kpiStats.value.totalRevenue = data.totalRevenue
    kpiStats.value.newCustomers = data.newCustomers
    kpiStats.value.orders = data.orders
    kpiStats.value.conversionRate = data.conversionRate

    revenueData.value.labels = data.revenue.labels
    revenueData.value.datasets[0].data = data.revenue.values

    trafficData.value.labels = data.traffic.labels
    trafficData.value.datasets[0].data = data.traffic.values
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <DefaultLayout>
    <div class="dashboard-grid">
      <div class="kpi-grid">
        <KpiCard
          title="Total Revenue"
          :value="`$${kpiStats.totalRevenue.toLocaleString()}`"
          :change="12.5"
          icon="fas fa-dollar-sign"
          color="primary"
        />
        <KpiCard
          title="New Customers"
          :value="kpiStats.newCustomers.toLocaleString()"
          :change="8.3"
          icon="fas fa-users"
          color="success"
        />
        <KpiCard
          title="Orders"
          :value="kpiStats.orders.toLocaleString()"
          :change="-2.1"
          icon="fas fa-shopping-cart"
          color="warning"
        />
        <KpiCard
          title="Conversion Rate"
          :value="`${kpiStats.conversionRate.toFixed(2)}%`"
          :change="1.2"
          icon="fas fa-percentage"
          color="danger"
        />
      </div>

      <div class="chart-row">
        <div class="chart-container">
          <h3 class="chart-title">Revenue Overview</h3>
          <LineChart :data="revenueData" />
        </div>
        <div class="chart-container">
          <h3 class="chart-title">Traffic Sources</h3>
          <PieChart :data="trafficData" />
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>
