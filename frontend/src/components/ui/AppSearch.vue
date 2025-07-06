<script setup>
import { ref } from 'vue'

const searchQuery = ref('')
</script>

<template>
  <div class="app-search">
    <div class="search-input-container">
      <i class="fas fa-search search-icon"></i>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search..."
        class="search-input"
      />
      <button v-if="searchQuery" @click="searchQuery = ''" class="clear-btn">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.app-search {
  @apply w-full;
}

.search-input-container {
  @apply relative flex items-center;
}

.search-icon {
  @apply absolute left-3 text-gray-400;
}

.search-input {
  @apply w-full pl-10 pr-8 py-2 rounded-full border border-gray-300;
  @apply focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent;
  @apply dark:bg-gray-700 dark:border-gray-600 dark:text-white;
}

.clear-btn {
  @apply absolute right-3 text-gray-400 hover:text-gray-600;
  @apply dark:hover:text-gray-300;
}

.dark .search-input {
  @apply placeholder-gray-400;
}
</style>
