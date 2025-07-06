<template>
    <div class="branches-page">
      <div class="page-header">
        <h1 class="page-title">Branches</h1>
        <button class="add-btn" @click="openAddModal">
          <i class="fas fa-plus mr-2"></i>
          Add Branch
        </button>
      </div>
      
      <div class="branches-grid">
        <div v-for="branch in branches" :key="branch.id" class="branch-card">
          <div class="branch-header">
            <h3>{{ branch.name }}</h3>
            <span class="status" :class="branch.status">{{ branch.status }}</span>
          </div>
          <div class="branch-info">
            <div class="info-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ branch.address }}</span>
            </div>
            <div class="info-item">
              <i class="fas fa-phone"></i>
              <span>{{ branch.phone }}</span>
            </div>
            <div class="info-item">
              <i class="fas fa-users"></i>
              <span>{{ branch.employees }} employees</span>
            </div>
          </div>
          <div class="branch-actions">
            <button class="edit-btn" @click="editBranch(branch)">
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button class="delete-btn" @click="confirmDelete(branch)">
              <i class="fas fa-trash"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
      
      <!-- Add/Edit Branch Modal -->
      <BranchModal 
        v-if="showModal"
        :branch="currentBranch"
        :mode="modalMode"
        @close="closeModal"
        @save="saveBranch"
      />
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import BranchModal from '@/components/modals/BranchModal.vue'
  
  const branches = ref([
    {
      id: 1,
      name: 'Head Office',
      address: '123 Business Park, New York, NY 10001',
      phone: '(212) 555-1234',
      employees: 45,
      status: 'active'
    },
    {
      id: 2,
      name: 'West Coast Branch',
      address: '456 Tech Street, San Francisco, CA 94107',
      phone: '(415) 555-5678',
      employees: 28,
      status: 'active'
    },
    {
      id: 3,
      name: 'Europe Office',
      address: '789 International Blvd, London, UK',
      phone: '+44 20 7946 0958',
      employees: 15,
      status: 'active'
    },
    {
      id: 4,
      name: 'Asia Branch',
      address: '321 Global Lane, Singapore 018953',
      phone: '+65 6123 4567',
      employees: 22,
      status: 'inactive'
    }
  ])
  
  const showModal = ref(false)
  const modalMode = ref('add')
  const currentBranch = ref(null)
  
  function openAddModal() {
    modalMode.value = 'add'
    currentBranch.value = null
    showModal.value = true
  }
  
  function editBranch(branch) {
    modalMode.value = 'edit'
    currentBranch.value = { ...branch }
    showModal.value = true
  }
  
  function confirmDelete(branch) {
    if(confirm(`Are you sure you want to delete ${branch.name}?`)) {
      branches.value = branches.value.filter(b => b.id !== branch.id)
    }
  }
  
  function closeModal() {
    showModal.value = false
  }
  
  function saveBranch(branchData) {
    if(modalMode.value === 'add') {
      branches.value.push({ ...branchData, id: branches.value.length + 1 })
    } else {
      const index = branches.value.findIndex(b => b.id === branchData.id)
      if(index !== -1) {
        branches.value[index] = branchData
      }
    }
    closeModal()
  }
  </script>
  
  <style scoped>
  .branches-page {
    @apply bg-white rounded-xl shadow-sm p-6;
  }
  
  .page-header {
    @apply flex items-center justify-between mb-6;
  }
  
  .page-title {
    @apply text-2xl font-bold text-gray-800;
  }
  
  .add-btn {
    @apply flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors;
  }
  
  .branches-grid {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
  }
  
  .branch-card {
    @apply border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow;
  }
  
  .branch-header {
    @apply flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200;
  }
  
  .branch-header h3 {
    @apply text-lg font-semibold text-gray-800;
  }
  
  .status {
    @apply px-2 py-1 text-xs rounded-full;
  }
  
  .status.active {
    @apply bg-emerald-100 text-emerald-800;
  }
  
  .status.inactive {
    @apply bg-gray-100 text-gray-800;
  }
  
  .branch-info {
    @apply p-4 space-y-3;
  }
  
  .info-item {
    @apply flex items-start space-x-3;
  }
  
  .info-item i {
    @apply text-emerald-500 mt-1;
  }
  
  .branch-actions {
    @apply flex border-t border-gray-200;
  }
  
  .branch-actions button {
    @apply flex-1 flex items-center justify-center py-2 hover:bg-gray-50 transition-colors;
  }
  
  .branch-actions .edit-btn {
    @apply text-blue-600 border-r border-gray-200;
  }
  
  .branch-actions .delete-btn {
    @apply text-red-600;
  }
  </style>