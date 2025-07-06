<template>
  <div class="attendance-page">
    <!-- Manual Add Attendance Form -->
    <section class="manual-add-section mb-8">
      <h2 class="section-title">Add Attendance Record Manually</h2>
      <form @submit.prevent="submitManualAttendance" class="manual-add-form">
        <div class="form-row">
          <label for="employee">Employee <span class="required">*</span></label>
          <select id="employee" v-model="manualForm.employee" required>
            <option value="" disabled>Select Employee</option>
            <option v-for="emp in employees" :key="emp._id" :value="emp._id">
              {{ emp.fullName }}
            </option>
          </select>
        </div>

        <div class="form-row">
          <label for="date">Date <span class="required">*</span></label>
          <input type="date" id="date" v-model="manualForm.date" required />
        </div>

        <div class="form-row">
          <label for="checkIn">Check In <span class="required">*</span></label>
          <input type="datetime-local" id="checkIn" v-model="manualForm.checkIn" required />
        </div>

        <div class="form-row">
          <label for="checkOut">Check Out</label>
          <input type="datetime-local" id="checkOut" v-model="manualForm.checkOut" />
        </div>

        <div class="form-row">
          <label for="status">Status <span class="required">*</span></label>
          <select id="status" v-model="manualForm.status" required>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="on-leave">On Leave</option>
            <option value="half-day">Half Day</option>
          </select>
        </div>

        <div class="form-row">
          <label for="notes">Notes</label>
          <textarea
            id="notes"
            v-model="manualForm.notes"
            maxlength="200"
            placeholder="Optional notes (max 200 characters)"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-submit" :disabled="loadingManual">
            <i class="fas fa-plus mr-2"></i>
            Add Record
          </button>
        </div>
      </form>
    </section>

    <!-- Existing Page Header -->
    <div class="page-header">
      <h1 class="page-title">Attendance Management</h1>
      <div class="header-actions">
        <button class="action-btn" @click="exportData" :disabled="loading">
          <i class="fas fa-download mr-2"></i>
          Export
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="attendance-filters">
      <div class="filter-group">
        <label>Date Range</label>
        <div class="date-range">
          <input type="date" v-model="filters.startDate" />
          <span>to</span>
          <input type="date" v-model="filters.endDate" />
        </div>
      </div>

      <div class="filter-group">
        <label>Employee</label>
        <select v-model="filters.employee">
          <option value="">All Employees</option>
          <option v-for="emp in employees" :key="emp._id" :value="emp._id">
            {{ emp.fullName }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>Status</label>
        <select v-model="filters.status">
          <option value="">All Status</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
          <option value="on-leave">On Leave</option>
          <option value="half-day">Half Day</option>
        </select>
      </div>

      <button class="filter-btn" @click="applyFilters" :disabled="loading">
        <i class="fas fa-filter mr-2"></i> Apply Filters
      </button>
      <button class="filter-btn secondary" @click="resetFilters" :disabled="loading">
        <i class="fas fa-undo mr-2"></i> Reset
      </button>
    </div>

    <!-- Loading Spinner -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <span>Loading attendance records...</span>
    </div>

    <!-- Attendance Table -->
    <div v-else class="attendance-table-container">
      <div class="table-summary">
        Showing {{ attendanceRecords.length }} records
        <span v-if="summaryData" class="ml-4">
          Present: {{ getSummaryCount('present') }} |
          Absent: {{ getSummaryCount('absent') }} |
          Late: {{ getSummaryCount('late') }} |
          On Leave: {{ getSummaryCount('on-leave') }} |
          Half Day: {{ getSummaryCount('half-day') }}
        </span>
      </div>

      <div class="attendance-table">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Hours</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in attendanceRecords" :key="record._id">
              <td>
                <div class="employee-info" v-if="record.employee">
                  <img
                    :src="record.employee.profileImage || defaultAvatar"
                    :alt="record.employee.fullName"
                  />
                  <div>
                    <p class="name">{{ record.employee.fullName }}</p>
                    <p class="dept">{{ record.employee.department || 'N/A' }}</p>
                  </div>
                </div>
                <div v-else>
                  Unknown
                </div>
              </td>

              <td>{{ formatDate(record.date) }}</td>
              <td>{{ formatTime(record.checkIn) }}</td>
              <td>{{ formatTime(record.checkOut) }}</td>
              <td>{{ calculateHours(record.checkIn, record.checkOut) }}</td>
              <td>
                <span class="status-badge" :class="record.status">
                  {{ formatStatus(record.status) }}
                </span>
              </td>
              <td class="notes-cell">{{ record.notes || '-' }}</td>
            </tr>

            <tr v-if="attendanceRecords.length === 0">
              <td colspan="7" class="no-records">
                <i class="fas fa-database"></i>
                <p>No attendance records found</p>
                <button class="btn-refresh" @click="fetchAttendance">
                  <i class="fas fa-sync-alt"></i> Refresh
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/api/axios' // Your secured Axios instance

const toast = useToast()
const defaultAvatar = '/images/default-avatar.png'

const attendanceRecords = ref([])
const employees = ref([])
const loading = ref(false)
const summaryData = ref(null)

const filters = ref({
  startDate: '',
  endDate: '',
  employee: '',
  status: ''
})

// Manual Add Attendance Form State
const manualForm = ref({
  employee: '',
  date: '',
  checkIn: '',
  checkOut: '',
  status: 'present',
  notes: ''
})

const loadingManual = ref(false)

// Fetch employees list for dropdowns
const fetchEmployees = async () => {
  try {
    const response = await api.get('/api/employees')
    employees.value = response.data.data?.employees || []
  } catch (error) {
    toast.error('Failed to load employees')
  }
}

// Fetch attendance records and summary with filters
const fetchAttendance = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.value.startDate) params.startDate = filters.value.startDate
    if (filters.value.endDate) params.endDate = filters.value.endDate
    if (filters.value.employee) params.employee = filters.value.employee
    if (filters.value.status) params.status = filters.value.status

    const [attendanceRes, summaryRes] = await Promise.all([
      api.get('/api/attendance', { params }),
      api.get('/api/attendance/summary', { params })
    ])

    attendanceRecords.value = attendanceRes.data.data.records || []
    summaryData.value = summaryRes.data.data || null
  } catch (error) {
    toast.error('Failed to load attendance records')
    attendanceRecords.value = []
    summaryData.value = null
  } finally {
    loading.value = false
  }
}

// Manual Add Attendance submit handler
const submitManualAttendance = async () => {
  // Basic validation
  if (
    !manualForm.value.employee ||
    !manualForm.value.date ||
    !manualForm.value.checkIn ||
    !manualForm.value.status
  ) {
    toast.error('Please fill in all required fields')
    return
  }

  loadingManual.value = true
  try {
    // Prepare payload with ISO strings for dates
    const payload = {
      employee: manualForm.value.employee,
      date: manualForm.value.date,
      checkIn: new Date(manualForm.value.checkIn).toISOString(),
      checkOut: manualForm.value.checkOut ? new Date(manualForm.value.checkOut).toISOString() : undefined,
      status: manualForm.value.status,
      notes: manualForm.value.notes
    }

    await api.post('/api/attendance/admin', payload)

    toast.success('Attendance record added successfully')
    // Refresh attendance list
    fetchAttendance()
    // Reset manual form
    manualForm.value = {
      employee: '',
      date: '',
      checkIn: '',
      checkOut: '',
      status: 'present',
      notes: ''
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to add attendance record')
  } finally {
    loadingManual.value = false
  }
}

const applyFilters = () => {
  fetchAttendance()
}

const resetFilters = () => {
  filters.value = {
    startDate: '',
    endDate: '',
    employee: '',
    status: ''
  }
  fetchAttendance()
}

// Format date as "Jun 29, 2025"
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Format time as "10:21 AM"
const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  return new Date(timeStr).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Calculate working hours difference in decimal (e.g., 7.50)
const calculateHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return '-'
  const diffMs = new Date(checkOut) - new Date(checkIn)
  if (diffMs <= 0) return '-'
  const hours = diffMs / (1000 * 60 * 60)
  return hours.toFixed(2)
}

// Map status codes to display text
const formatStatus = (status) => {
  const statusMap = {
    'present': 'Present',
    'absent': 'Absent',
    'late': 'Late',
    'on-leave': 'On Leave',
    'half-day': 'Half Day'
  }
  return statusMap[status] || status
}

// Get count from summary data for a specific status
const getSummaryCount = (status) => {
  if (!summaryData.value) return 0
  const item = summaryData.value.find(item => item._id === status)
  return item ? item.count : 0
}

// Export attendance data with current filters
const exportData = async () => {
  try {
    const params = {}
    if (filters.value.startDate) params.startDate = filters.value.startDate
    if (filters.value.endDate) params.endDate = filters.value.endDate
    if (filters.value.employee) params.employee = filters.value.employee
    if (filters.value.status) params.status = filters.value.status

    const response = await api.get('/api/attendance/export', {
      params,
      responseType: 'blob'
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `attendance_export_${new Date().toISOString().split('T')[0]}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()

    toast.success('Export started successfully')
  } catch (error) {
    toast.error('Failed to export attendance data')
  }
}

onMounted(() => {
  fetchEmployees()
  fetchAttendance()
})
</script>

<style scoped>
.attendance-page {
  @apply bg-white rounded-xl shadow-sm p-6;
  position: relative;
  min-height: 500px;
}

/* Manual Add Attendance Form */
.manual-add-section {
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
  border-radius: 0.75rem;
  background-color: #f9fafb;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #111827;
}

.manual-add-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.form-row {
  display: flex;
  flex-direction: column;
}

.form-row label {
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: #374151;
}

.required {
  color: #ef4444;
}

.form-row input,
.form-row select,
.form-row textarea {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  color: #111827;
  outline-offset: 2px;
}

.form-row textarea {
  resize: vertical;
  min-height: 3.5rem;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-start;
  margin-top: 0.5rem;
}

.btn-submit {
  background-color: #10b981;
  color: #fff;
  padding: 0.5rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  transition: background-color 0.2s ease-in-out;
}

.btn-submit:disabled {
  background-color: #6ee7b7;
  cursor: not-allowed;
}

.btn-submit:hover:not(:disabled) {
  background-color: #059669;
}

/* Existing Styles */

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
  @apply flex items-center px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors;
}

.action-btn:disabled {
  @apply opacity-50 cursor-not-allowed;
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
  @apply flex items-center justify-center px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors mt-6 sm:mt-auto;
}

.filter-btn.secondary {
  @apply bg-gray-200 text-gray-700 hover:bg-gray-300;
}

.loading-overlay {
  @apply absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-10;
}

.loading-overlay span {
  @apply mt-4 text-gray-600;
}

.spinner {
  @apply w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin;
}

.attendance-table-container {
  @apply relative;
}

.table-summary {
  @apply text-sm text-gray-500 mb-2;
}

.attendance-table {
  @apply overflow-x-auto rounded-lg border border-gray-200;
}

.attendance-table table {
  @apply w-full;
}

.attendance-table th {
  @apply px-4 py-3 text-left text-sm font-medium text-gray-500 bg-gray-50;
  white-space: nowrap;
}

.attendance-table td {
  @apply px-4 py-3 border-t border-gray-100;
}

.employee-info {
  @apply flex items-center;
}

.employee-info img {
  @apply w-8 h-8 rounded-full mr-3 object-cover;
}

.employee-info .name {
  @apply text-sm font-medium text-gray-800;
}

.employee-info .dept {
  @apply text-xs text-gray-500;
}

.status-badge {
  @apply px-2 py-1 text-xs rounded-full font-medium;
}

.status-badge.present {
  @apply bg-emerald-100 text-emerald-800;
}

.status-badge.late {
  @apply bg-amber-100 text-amber-800;
}

.status-badge.absent {
  @apply bg-red-100 text-red-800;
}

.status-badge.on-leave {
  @apply bg-blue-100 text-blue-800;
}

.status-badge.half-day {
  @apply bg-purple-100 text-purple-800;
}

.notes-cell {
  @apply max-w-xs truncate;
}

.no-records {
  @apply text-center py-12;
}

.no-records i {
  @apply text-4xl text-gray-300 mb-2;
}

.no-records p {
  @apply text-gray-500 mb-4;
}

.btn-refresh {
  @apply px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors;
}
</style>
