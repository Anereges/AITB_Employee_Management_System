<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const activities = ref([])

const fetchActivities = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/activity/recent', {
      withCredentials: true
    })
    // Assume API returns array of activities with fields: text, time, icon, bgColor
    activities.value = response.data.data || []
  } catch (error) {
    console.error('Failed to fetch recent activities:', error)
  }
}

onMounted(() => {
  fetchActivities()
})
</script>

<template>
  <div class="activity-card">
    <div class="card-header">
      <h3>Recent Activity</h3>
      <button class="view-all">View All</button>
    </div>
    <ul class="activity-list">
      <li v-for="(activity, index) in activities" :key="index" class="activity-item">
        <div class="activity-icon" :class="activity.bgColor">
          <i :class="activity.icon"></i>
        </div>
        <div class="activity-content">
          <p class="activity-text">{{ activity.text }}</p>
          <p class="activity-time">{{ activity.time }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>
