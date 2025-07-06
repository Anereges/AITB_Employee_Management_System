<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const stats = ref([])

const fetchStats = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/dashboard/stats', {
      withCredentials: true
    })
    // Assume API returns array of stats with fields matching your stat object structure
    stats.value = response.data.data || []
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <div class="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <div v-for="stat in stats" :key="stat.title" class="stat-card">
      <div class="stat-icon" :class="stat.bgColor">
        <i :class="stat.icon"></i>
      </div>
      <div class="stat-content">
        <h3 class="stat-title">{{ stat.title }}</h3>
        <p class="stat-value">{{ stat.value }}</p>
        <p class="stat-change" :class="stat.changeType">
          <i :class="stat.changeIcon"></i>
          {{ stat.change }}
        </p>
      </div>
    </div>
  </div>
</template>
