<template>
    <div class="dashboard-home">
      <h1 class="page-title">Dashboard Overview</h1>
      
      <StatsCards />
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <EmployeeChart class="lg:col-span-2" />
        <RecentActivity />
      </div>
      
      <QuickActions class="mt-6" />
    </div>
  </template>
  
  <script setup>
  import StatsCards from '@/components/dashboard/StatCard.vue'
  import EmployeeChart from '@/components/dashboard/EmployeeChart.vue'
  import RecentActivity from '@/components/dashboard/RecentActivity.vue'
  import QuickActions from '@/components/dashboard/QuickActions.vue'
  </script>
  
  <style scoped>
  .page-title {
    @apply text-2xl font-bold text-gray-800 mb-6;
  }
  </style>