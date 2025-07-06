<template>
    <div class="leave-requests-page">
      <div class="page-header">
        <h1 class="page-title">Leave Requests</h1>
        <div class="header-actions">
          <button class="action-btn">
            <i class="fas fa-download mr-2"></i>
            Export
          </button>
          <button class="action-btn primary">
            <i class="fas fa-plus mr-2"></i>
            New Request
          </button>
        </div>
      </div>
      
      <div class="filters-bar">
        <div class="filter-group">
          <label>Status</label>
          <select v-model="selectedStatus">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Leave Type</label>
          <select v-model="selectedType">
            <option value="">All Types</option>
            <option value="vacation">Vacation</option>
            <option value="sick">Sick Leave</option>
            <option value="personal">Personal</option>
            <option value="maternity">Maternity/Paternity</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Date Range</label>
          <input type="date" v-model="selectedDate">
        </div>
        
        <button class="filter-btn" @click="applyFilters">
          <i class="fas fa-filter mr-2"></i>
          Apply
        </button>
      </div>
      
      <div class="requests-table">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>Dates</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in filteredRequests" :key="request.id">
              <td>
                <div class="employee-info">
                  <img :src="request.avatar" :alt="request.name">
                  <span>{{ request.name }}</span>
                </div>
              </td>
              <td>{{ request.type }}</td>
              <td>
                {{ request.startDate }} to {{ request.endDate }}
              </td>
              <td>{{ request.days }}</td>
              <td class="reason">{{ request.reason }}</td>
              <td>
                <span class="status" :class="request.status">{{ request.status }}</span>
              </td>
              <td>
                <div class="request-actions">
                  <button v-if="request.status === 'pending'" class="approve-btn" @click="approveRequest(request)">
                    <i class="fas fa-check"></i>
                  </button>
                  <button v-if="request.status === 'pending'" class="reject-btn" @click="rejectRequest(request)">
                    <i class="fas fa-times"></i>
                  </button>
                  <button class="view-btn" @click="viewRequest(request)">
                    <i class="fas fa-eye"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="pagination">
        <button class="pagination-btn">
          <i class="fas fa-chevron-left"></i>
        </button>
        <button class="pagination-btn active">1</button>
        <button class="pagination-btn">2</button>
        <button class="pagination-btn">3</button>
        <button class="pagination-btn">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  const selectedStatus = ref('')
  const selectedType = ref('')
  const selectedDate = ref('')
  
  const leaveRequests = ref([
    {
      id: 1,
      name: 'amanuel sisay',
      avatar: '/image/19.jpg',
      type: 'Vacation',
      startDate: '2023-06-20',
      endDate: '2023-06-25',
      days: 5,
      reason: 'Family vacation',
      status: 'pending'
    },
    {
      id: 2,
      name: 'samrawit abebe',
      avatar: '/image/12.jpg',
      type: 'Sick Leave',
      startDate: '2023-06-15',
      endDate: '2023-06-16',
      days: 2,
      reason: 'Flu',
      status: 'approved'
    },
    {
      id: 3,
      name: 'alebel fetet',
      avatar: '/image/4.jpg',
      type: 'Personal',
      startDate: '2023-06-18',
      endDate: '2023-06-18',
      days: 1,
      reason: 'Personal matters',
      status: 'rejected'
    },
    {
      id: 4,
      name: 'gudnew Moges',
      avatar: '/image/12.jpg',
      type: 'Maternity/Paternity',
      startDate: '2023-07-01',
      endDate: '2023-09-30',
      days: 92,
      reason: 'Maternity leave',
      status: 'approved'
    }
  ])
  
  const filteredRequests = computed(() => {
    return leaveRequests.value.filter(request => {
      const matchesStatus = !selectedStatus.value || request.status === selectedStatus.value
      const matchesType = !selectedType.value || request.type.toLowerCase().includes(selectedType.value.toLowerCase())
      const matchesDate = !selectedDate.value || 
        (request.startDate <= selectedDate.value && request.endDate >= selectedDate.value)
      return matchesStatus && matchesType && matchesDate
    })
  })
  
  function applyFilters() {
    console.log('Filters applied', { 
      status: selectedStatus.value,
      type: selectedType.value,
      date: selectedDate.value
    })
  }
  
  function approveRequest(request) {
    request.status = 'approved'
  }
  
  function rejectRequest(request) {
    request.status = 'rejected'
  }
  
  function viewRequest(request) {
    console.log('View request', request)
  }
  </script>
  
  <style scoped>
  .leave-requests-page {
    @apply bg-white rounded-xl shadow-sm p-6;
  }
  
  .page-header {
    @apply flex flex-col md:flex-row items-start md:items-center justify-between mb-6;
  }
  
  .page-title {
    @apply text-2xl font-bold text-gray-800 mb-4 md:mb-0;
  }
  
  .header-actions {
    @apply flex space-x-2;
  }
  
  .action-btn {
    @apply flex items-center px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50;
  }
  
  .action-btn.primary {
    @apply bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700;
  }
  
  .filters-bar {
    @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6;
  }
  
  .filter-group {
    @apply mb-4;
  }
  
  .filter-group label {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }
  
  .filter-group select,
  .filter-group input {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300;
  }
  
  .filter-btn {
    @apply flex items-center justify-center px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 mt-6 sm:mt-auto;
  }
  
  .requests-table {
    @apply overflow-x-auto;
  }
  
  .requests-table table {
    @apply w-full;
  }
  
  .requests-table th {
    @apply px-4 py-3 text-left text-sm font-medium text-gray-500 bg-gray-50;
  }
  
  .requests-table td {
    @apply px-4 py-3 border-t border-gray-100;
  }
  
  .employee-info {
    @apply flex items-center;
  }
  
  .employee-info img {
    @apply w-8 h-8 rounded-full mr-3;
  }
  
  .reason {
    @apply max-w-xs truncate;
  }
  
  .status {
    @apply px-2 py-1 text-xs rounded-full;
  }
  
  .status.pending {
    @apply bg-amber-100 text-amber-800;
  }
  
  .status.approved {
    @apply bg-emerald-100 text-emerald-800;
  }
  
  .status.rejected {
    @apply bg-red-100 text-red-800;
  }
  
  .request-actions {
    @apply flex space-x-2;
  }
  
  .approve-btn {
    @apply p-1 text-emerald-600 hover:text-emerald-800;
  }
  
  .reject-btn {
    @apply p-1 text-red-600 hover:text-red-800;
  }
  
  .view-btn {
    @apply p-1 text-blue-600 hover:text-blue-800;
  }
  
  .pagination {
    @apply flex justify-center items-center mt-6 space-x-1;
  }
  
  .pagination-btn {
    @apply w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50;
  }
  
  .pagination-btn.active {
    @apply bg-emerald-600 text-white border-emerald-600;
  }
  </style>