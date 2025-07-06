<template>
    <header class="dashboard-header">
      <button class="toggle-btn" @click="$emit('toggle-sidebar')">
        <i class="fas fa-bars"></i>
      </button>
      <div class="header-right">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="Search...">
        </div>
        <div class="header-actions">
          <button class="action-btn">
            <i class="fas fa-bell"></i>
            <span class="badge">3</span>
          </button>
          <button class="action-btn">
            <i class="fas fa-envelope"></i>
            <span class="badge">5</span>
          </button>
          <div class="user-profile">
            <img src="/image/19.jpg" alt="User" />
            <span class="user-name">Aman sisay</span>
            <i class="fas fa-chevron-down"></i>
          </div>
        </div>
      </div>
    </header>
  </template>
  
  <style scoped>
  .dashboard-header {
    @apply flex items-center justify-between h-16 px-6 bg-white border-b border-gray-100;
  }
  
  .toggle-btn {
    @apply text-gray-500 hover:text-emerald-600 text-xl;
  }
  
  .header-right {
    @apply flex items-center space-x-6;
  }
  
  .search-box {
    @apply relative;
  }
  
  .search-box i {
    @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400;
  }
  
  .search-box input {
    @apply pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300;
  }
  
  .header-actions {
    @apply flex items-center space-x-4;
  }
  
  .action-btn {
    @apply relative text-gray-500 hover:text-emerald-600;
  }
  
  .action-btn .badge {
    @apply absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center;
  }
  
  .user-profile {
    @apply flex items-center space-x-2 cursor-pointer;
  }
  
  .user-profile img {
    @apply h-8 w-8 rounded-full;
  }
  
  .user-name {
    @apply text-sm font-medium;
  }
  </style>