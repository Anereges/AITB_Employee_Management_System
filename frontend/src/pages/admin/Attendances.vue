<template>
  <div class="attendance-page">
    <div class="page-header">
      <h1 class="page-title">Attendance</h1>
      <div class="header-actions">
        <button class="action-btn" @click="exportData">
          <i class="fas fa-download mr-2"></i>
          Export
        </button>
        <button class="action-btn primary" @click="addRecord">
          <i class="fas fa-plus mr-2"></i>
          Add Record
        </button>
      </div>
    </div>
    
    <div class="attendance-filters">
      <div class="filter-group">
        <label>Date Range</label>
        <div class="date-range">
          <input type="date" v-model="startDate" />
          <span>to</span>
          <input type="date" v-model="endDate" />
        </div>
      </div>
      
      <div class="filter-group">
        <label>Department</label>
        <select v-model="selectedDepartment">
          <option value="">All Departments</option>
          <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Status</label>
        <select v-model="selectedStatus">
          <option value="">All Status</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
          <option value="on-leave">On Leave</option>
        </select>
      </div>
      
      <button class="filter-btn" @click="applyFilters" :disabled="loading">
        <i class="fas fa-filter mr-2"></i>
        Apply
      </button>
    </div>
    
    <div v-if="loading" class="text-center py-10 text-gray-500">Loading attendance records...</div>
    
    <div v-else class="attendance-table">
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Date</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Total Hours</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in attendanceRecords" :key="record._id">
            <td>
              <div class="employee-info">
                <img :src="record.avatar || '/image/default-avatar.png'" :alt="record.name" />
                <div>
                  <p class="name">{{ record.name }}</p>
                  <p class="dept">{{ record.department }}</p>
                </div>
              </div>
            </td>
            <td>{{ formatDate(record.date) }}</td>
            <td>{{ record.checkIn || '-' }}</td>
            <td>{{ record.checkOut || '-' }}</td>
            <td>{{ record.hours || '0' }}</td>
            <td>
              <span class="status" :class="record.status">{{ record.status }}</span>
            </td>
            <td>
              <button class="edit-btn" @click="editRecord(record)">
                <i class="fas fa-edit"></i>
              </button>
            </td>
          </tr>
          <tr v-if="attendanceRecords.length === 0">
            <td colspan="7" class="text-center text-gray-400 py-8">No records found.</td>
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
import { ref, onMounted } from 'vue'
import axios from 'axios'

const startDate = ref('')
const endDate = ref('')
const selectedDepartment = ref('')
const selectedStatus = ref('')

const departments = ref([])
const attendanceRecords = ref([])
const loading = ref(false)

const page = ref(1)
const limit = 10
const totalPages = ref(1)

const fetchDepartments = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/departments', {
      withCredentials: true
    })
    // Assuming backend returns array of department names or objects
    departments.value = res.data.data?.map(d => d.name) || []
  } catch (error) {
    console.error('Failed to fetch departments:', error)
  }
}

const fetchAttendance = async () => {
  loading.value = true
  try {
    const params = {
      startDate: startDate.value || undefined,
      endDate: endDate.value || undefined,
      department: selectedDepartment.value || undefined,
      status: selectedStatus.value || undefined,
      page: page.value,
      limit
    }
    // Remove undefined params
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key])

    const res = await axios.get('http://localhost:5000/api/attendance', {
      params,
      withCredentials: true
    })
    attendanceRecords.value = res.data.data.records || []
    totalPages.value = res.data.data.totalPages || 1
  } catch (error) {
    console.error('Failed to fetch attendance:', error)
    attendanceRecords.value = []
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  page.value = 1
  fetchAttendance()
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString()
}

const editRecord = (record) => {
  // Implement your edit logic or modal here
  console.log('Edit record:', record)
}

const prevPage = () => {
  if (page.value > 1) {
    page.value--
    fetchAttendance()
  }
}

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value++
    fetchAttendance()
  }
}

const goToPage = (p) => {
  if (p !== page.value) {
    page.value = p
    fetchAttendance()
  }
}

onMounted(() => {
  fetchDepartments()
  fetchAttendance()
})
</script>

<style scoped>
/* Your existing styles here */
.attendance-page {
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

.attendance-filters {
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

.date-range {
  @apply flex items-center space-x-2;
}

.date-range input {
  @apply flex-1;
}

.filter-btn {
  @apply flex items-center justify-center px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 mt-6 sm:mt-auto;
}

.attendance-table {
  @apply overflow-x-auto;
}

.attendance-table table {
  @apply w-full;
}

.attendance-table th {
  @apply px-4 py-3 text-left text-sm font-medium text-gray-500 bg-gray-50;
}

.attendance-table td {
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

.employee-info .dept {
  @apply text-xs text-gray-500;
}

.status {
  @apply px-2 py-1 text-xs rounded-full;
}

.status.present {
  @apply bg-emerald-100 text-emerald-800;
}

.status.late {
  @apply bg-amber-100 text-amber-800;
}

.status.absent {
  @apply bg-red-100 text-red-800;
}

.status.on-leave {
  @apply bg-blue-100 text-blue-800;
}

.edit-btn {
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
