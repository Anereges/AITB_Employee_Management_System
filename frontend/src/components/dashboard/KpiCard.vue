<script setup>
defineProps({
  title: String,
  value: [String, Number],
  change: Number,
  icon: String,
  color: {
    type: String,
    default: 'primary'
  }
});

const colorClasses = {
  primary: 'bg-blue-100 text-blue-600',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-yellow-100 text-yellow-600',
  danger: 'bg-red-100 text-red-600'
};
</script>

<template>
  <div class="kpi-card">
    <div class="flex justify-between items-start">
      <div>
        <p class="text-sm text-gray-500">{{ title }}</p>
        <h3 class="text-2xl font-bold">{{ value }}</h3>
      </div>
      <div class="icon-container" :class="colorClasses[color]">
        <i :class="icon"></i>
      </div>
    </div>
    <div class="mt-4">
      <span :class="change >= 0 ? 'text-green-600' : 'text-red-600'">
        <i :class="change >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
        {{ Math.abs(change) }}%
      </span>
      <span class="text-gray-500 text-sm ml-2">vs last period</span>
    </div>
  </div>
</template>

<style scoped>
.kpi-card {
  @apply bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow;
}

.icon-container {
  @apply p-3 rounded-lg text-lg;
}
</style>