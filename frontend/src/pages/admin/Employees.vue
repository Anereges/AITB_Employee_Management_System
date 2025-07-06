<template>
  <div class="employees-page">
    <div class="page-header">
      <h1 class="page-title">Employees</h1>
      <button @click="showAddEmployeeForm = true" class="add-btn">
        <i class="fas fa-plus mr-2"></i>
        Add Employee
      </button>
    </div>
    
    <!-- Add Employee Modal -->
    <ModalDialog
      v-if="showAddEmployeeForm"
      :show="showAddEmployeeForm"
      @close="closeAddEmployeeForm"
      title="Add New Employee"
    >
      <AddEmployeeForm 
        @employee-added="handleEmployeeAdded" 
        @cancel="closeAddEmployeeForm" 
      />
    </ModalDialog>
    
    <div class="filters-bar">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          placeholder="Search employees..."
          v-model="searchQuery"
          @input="applyFilters"
        />
      </div>
      <div class="filter-actions">
        <button class="filter-btn" @click="openFilterModal">
          <i class="fas fa-filter"></i>
          Filters
        </button>
        <button class="export-btn" @click="exportEmployees">
          <i class="fas fa-file-export"></i>
          Export
        </button>
      </div>
    </div>
    
    <div class="employees-table">
      <table>
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Position</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="employee in filteredEmployees" :key="employee._id">
            <td>{{ employee.employeeId }}</td>
            <td>
              <div class="employee-info">
                <img :src="employee.avatar || '/image/default-avatar.png'" :alt="employee.name" />
                <div>
                  <p class="name">{{ employee.name }}</p>
                  <p class="email">{{ employee.email }}</p>
                </div>
              </div>
            </td>
            <td>{{ employee.department }}</td>
            <td>{{ employee.position }}</td>
            <td>
              <span class="status" :class="employee.status">{{ employee.status }}</span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="edit-btn" @click="editEmployee(employee)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" @click="confirmDelete(employee)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredEmployees.length === 0">
            <td colspan="6" class="text-center text-gray-400 py-8">No employees found.</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="pagination">
      <button class="pagination-btn" @click="prevPage" :disabled="page === 1">
        <i class="fas fa-chevron-left"></i>
      </button>
      <button
        v-for="p in totalPages"
        :key="p"
        class="pagination-btn"
        :class="{ active: p === page }"
        @click="goToPage(p)"
      >
        {{ p }}
      </button>
      <button class="pagination-btn" @click="nextPage" :disabled="page === totalPages">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'  // Use your configured Axios instance
import ModalDialog from '@/components/ui/ModalDialog.vue'
import AddEmployeeForm from '@/pages/admin/AddEmployee.vue'

const employees = ref([])
const searchQuery = ref('')
const page = ref(1)
const limit = 10
const totalPages = ref(1)
const showAddEmployeeForm = ref(false)

const fetchEmployees = async () => {
  try {
    const params = {
      page: page.value,
      limit,
      search: searchQuery.value.trim() || undefined
    }
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) delete params[key]
    })

    // Use relative path; api instance adds baseURL and Authorization header
    const res = await api.get('/api/employees', { params });


    employees.value = res.data.data.employees || []
    totalPages.value = res.data.totalPages || 1
  } catch (error) {
    console.error('Failed to fetch employees:', error)
    employees.value = []
  }
}

const filteredEmployees = computed(() => {
  if (!searchQuery.value.trim()) return employees.value
  const q = searchQuery.value.toLowerCase()
  return employees.value.filter(emp =>
    emp.fullName.toLowerCase().includes(q) ||
    (emp.department && emp.department.toLowerCase().includes(q)) ||
    (emp.position && emp.position.toLowerCase().includes(q))
  )
})

const applyFilters = () => {
  page.value = 1
  fetchEmployees()
}

const editEmployee = (employee) => {
  console.log('Edit employee:', employee)
}

const confirmDelete = async (employee) => {
  if (confirm(`Are you sure you want to delete ${employee.fullName}?`)) {
    try {
      await api.delete(`/employees/${employee._id}`)
      fetchEmployees()
    } catch (error) {
      console.error('Failed to delete employee:', error)
    }
  }
}

const openFilterModal = () => {
  alert('Filter modal not implemented yet.')
}

const exportEmployees = () => {
  alert('Export functionality not implemented yet.')
}

const prevPage = () => {
  if (page.value > 1) {
    page.value--
    fetchEmployees()
  }
}

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value++
    fetchEmployees()
  }
}

const goToPage = (p) => {
  if (p !== page.value) {
    page.value = p
    fetchEmployees()
  }
}

const handleEmployeeAdded = () => {
  showAddEmployeeForm.value = false
  fetchEmployees()
}

const closeAddEmployeeForm = () => {
  showAddEmployeeForm.value = false
}

onMounted(() => {
  fetchEmployees()
})
</script>


<style scoped>
.employees-page {
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

.filters-bar {
  @apply flex flex-col md:flex-row items-center justify-between mb-6;
}

.search-box {
  @apply relative mb-4 md:mb-0;
}

.search-box i {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400;
}

.search-box input {
  @apply pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 w-full md:w-64;
}

.filter-actions {
  @apply flex space-x-2;
}

.filter-btn,
.export-btn {
  @apply flex items-center px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50;
}

.filter-btn i,
.export-btn i {
  @apply mr-2;
}

.employees-table {
  @apply overflow-x-auto;
}

.employees-table table {
  @apply w-full;
}

.employees-table th {
  @apply px-4 py-3 text-left text-sm font-medium text-gray-500 bg-gray-50;
}

.employees-table td {
  @apply px-4 py-3 border-t border-gray-100;
}

.employee-info {
  @apply flex items-center;
}

.employee-info img {
  @apply w-8 h-8 rounded-full mr-3;
}

.employee-info .name {
  @apply text-sm font-medium text-gray-800;
}

.employee-info .email {
  @apply text-xs text-gray-500;
}

.status {
  @apply px-2 py-1 text-xs rounded-full;
}

.status.active {
  @apply bg-emerald-100 text-emerald-800;
}

.status.probation {
  @apply bg-yellow-100 text-yellow-800;
}

.status.on-leave {
  @apply bg-blue-100 text-blue-800;
}

.action-buttons {
  @apply flex space-x-2;
}

.edit-btn {
  @apply p-1 text-blue-600 hover:text-blue-800;
}

.delete-btn {
  @apply p-1 text-red-600 hover:text-red-800;
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