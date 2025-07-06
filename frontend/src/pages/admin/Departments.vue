<template>
  <div class="departments-page">
    <div class="page-header">
      <h1 class="page-title">Departments</h1>
      <button class="add-btn" @click="openAddModal">
        <i class="fas fa-plus mr-2"></i>
        Add Department
      </button>
    </div>
    
    <!-- Department Statistics Section -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-building"></i>
        </div>
        <div class="stat-content">
          <h3>Total Departments</h3>
          <p>{{ departmentStats.totalDepartments || 0 }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <h3>Total Employees</h3>
          <p>{{ departmentStats.totalEmployees || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- Department Chart -->
    <div class="chart-container" v-if="departments.length > 0">
      <canvas id="departmentChart"></canvas>
    </div>
    
    <div v-if="loading" class="text-center py-10 text-gray-500">
      Loading departments...
    </div>
    <div v-else-if="departments.length === 0" class="text-center py-10 text-gray-500">
      No departments found.
    </div>
    <div v-else class="departments-list">
      <div v-for="dept in departments" :key="dept._id" class="dept-item">
        <div class="dept-info">
          <div class="dept-icon" :style="{ backgroundColor: dept.color || '#4299e1' }">
            <i :class="dept.icon || 'fas fa-building'"></i>
          </div>
          <div>
            <h3>{{ dept.name }}</h3>
            <p>{{ dept.employeesCount || 0 }} employees • {{ dept.managerName || 'No manager assigned' }}</p>
          </div>
        </div>
        <div class="dept-actions">
          <button class="edit-btn" @click="editDept(dept)">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-btn" @click="confirmDelete(dept)">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Add/Edit Department Modal -->
    <DepartmentModal 
      v-if="showModal"
      :department="currentDept"
      :mode="modalMode"
      @close="closeModal"
      @save="saveDepartment"
    />
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import axios from 'axios'
import Chart from 'chart.js/auto'
import DepartmentModal from '@/components/modals/DepartmentModal.vue'

const departments = ref([])
const loading = ref(false)
const showModal = ref(false)
const modalMode = ref('add') // 'add' or 'edit'
const currentDept = ref(null)
const departmentChart = ref(null)
const departmentStats = ref({
  totalDepartments: 0,
  totalEmployees: 0
})

// Fetch departments and stats from backend
const fetchDepartments = async () => {
  loading.value = true
  try {
    const response = await axios.get('http://localhost:5000/api/departments/stats', {
      withCredentials: true
    })

    const data = response.data.data || {}

    departments.value = data.departments || []
    departmentStats.value.totalDepartments = data.totalDepartments ?? departments.value.length
    departmentStats.value.totalEmployees = data.totalEmployees ?? departments.value.reduce((sum, d) => sum + (d.employeesCount || 0), 0)

    if (departments.value.length > 0) {
      await nextTick()
      initDepartmentChart()
    } else {
      if (departmentChart.value) {
        departmentChart.value.destroy()
        departmentChart.value = null
      }
    }
  } catch (error) {
    console.error('Error fetching departments:', error)
    alert('Failed to load departments. Please check your connection or login status.')
    departments.value = []
    departmentStats.value = { totalDepartments: 0, totalEmployees: 0 }
    if (departmentChart.value) {
      departmentChart.value.destroy()
      departmentChart.value = null
    }
  } finally {
    loading.value = false
  }
}

// Initialize or update Chart.js bar chart
const initDepartmentChart = () => {
  if (departmentChart.value) {
    departmentChart.value.destroy()
  }

  const ctx = document.getElementById('departmentChart')?.getContext('2d')
  if (!ctx) {
    console.warn('Chart canvas element not found')
    return
  }

  departmentChart.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: departments.value.map(dept => dept.name),
      datasets: [{
        label: 'Employees Count',
        data: departments.value.map(dept => dept.employeesCount || 0),
        backgroundColor: departments.value.map((_, i) => {
          const colors = [
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 99, 132, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 205, 86, 0.7)'
          ]
          return colors[i % colors.length]
        }),
        borderColor: departments.value.map((_, i) => {
          const colors = [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 205, 86, 1)'
          ]
          return colors[i % colors.length]
        }),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Employee Distribution by Department' }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Number of Employees' }
        }
      }
    }
  })
}

// Open modal for adding a new department
const openAddModal = () => {
  modalMode.value = 'add'
  currentDept.value = null
  showModal.value = true
}

// Open modal for editing an existing department
const editDept = (dept) => {
  modalMode.value = 'edit'
  currentDept.value = { ...dept }
  showModal.value = true
}

// Confirm and delete a department
const confirmDelete = async (dept) => {
  if (confirm(`Are you sure you want to delete the "${dept.name}" department?`)) {
    try {
      await axios.delete(`http://localhost:5000/api/departments/${dept._id}`, {
        withCredentials: true
      })
      alert(`Department "${dept.name}" deleted successfully.`)
      await fetchDepartments()
    } catch (error) {
      console.error('Error deleting department:', error)
      alert(error.response?.data?.error || 'Failed to delete department')
    }
  }
}

// Close the modal
const closeModal = () => {
  showModal.value = false
}

// Save department (create or update)
const saveDepartment = async (deptData) => {
  try {
    if (modalMode.value === 'add') {
      const response = await axios.post('http://localhost:5000/api/departments', deptData, {
        withCredentials: true
      })
      alert(`Department "${response.data.department.name}" created successfully.`)
    } else {
      const response = await axios.put(`http://localhost:5000/api/departments/${deptData._id}`, deptData, {
        withCredentials: true
      })
      alert(`Department "${response.data.department.name}" updated successfully.`)
    }
    await fetchDepartments()
    closeModal()
  } catch (error) {
    console.error('Error saving department:', error)
    alert(error.response?.data?.error || 'Failed to save department')
  }
}

// Lifecycle hooks
onMounted(() => {
  fetchDepartments()
})

onBeforeUnmount(() => {
  if (departmentChart.value) {
    departmentChart.value.destroy()
  }
})
</script>




<style scoped>
.departments-page {
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

.stats-section {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4 mb-6;
}

.stat-card {
  @apply flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100;
}

.stat-icon {
  @apply w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-4;
}

.stat-icon i {
  @apply text-xl;
}

.stat-content h3 {
  @apply text-sm font-medium text-gray-500;
}

.stat-content p {
  @apply text-2xl font-bold text-gray-800 mt-1;
}

.chart-container {
  @apply bg-white p-4 rounded-lg shadow-sm mb-6;
  height: 400px;
}

.departments-list {
  @apply space-y-3;
}

.dept-item {
  @apply flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow;
}

.dept-info {
  @apply flex items-center space-x-4;
}

.dept-icon {
  @apply w-12 h-12 rounded-lg flex items-center justify-center text-white;
}

.dept-info h3 {
  @apply text-lg font-medium text-gray-800;
}

.dept-info p {
  @apply text-sm text-gray-500;
}

.dept-actions {
  @apply flex space-x-2;
}

.edit-btn {
  @apply p-2 text-blue-600 hover:text-blue-800;
}

.delete-btn {
  @apply p-2 text-red-600 hover:text-red-800;
}
</style>
