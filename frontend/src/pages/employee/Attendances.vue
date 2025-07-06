<template>
  <div class="attendance-page">
    <div class="page-header">
      <h1 class="page-title">My Attendance</h1>
      <div class="header-actions">
        <button class="action-btn" @click="exportAttendance">
          <i class="fas fa-download mr-2"></i>
          Export
        </button>
      </div>
    </div>
    
    <div class="notification-area">
      <div v-if="loading" class="notification loading">
        <i class="fas fa-spinner fa-spin mr-2"></i> Loading attendance data...
      </div>
      <div v-if="error" class="notification error">
        <i class="fas fa-exclamation-circle mr-2"></i> {{ error }}
      </div>
      <div v-if="success" class="notification success">
        <i class="fas fa-check-circle mr-2"></i> {{ success }}
      </div>
    </div>
    
    <div class="attendance-filters">
      <div class="filter-group">
        <label>Date Range</label>
        <div class="date-range">
          <input type="date" v-model="startDate">
          <span>to</span>
          <input type="date" v-model="endDate">
        </div>
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
      
      <button class="filter-btn" @click="fetchAttendance">
        <i class="fas fa-filter mr-2"></i>
        Apply
      </button>
    </div>
    
    <div class="attendance-summary">
      <div class="summary-card">
        <div class="summary-icon present">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="summary-content">
          <h3>{{ summary.present }}</h3>
          <p>Present Days</p>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon absent">
          <i class="fas fa-times-circle"></i>
        </div>
        <div class="summary-content">
          <h3>{{ summary.absent }}</h3>
          <p>Absent Days</p>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon late">
          <i class="fas fa-clock"></i>
        </div>
        <div class="summary-content">
          <h3>{{ summary.late }}</h3>
          <p>Late Days</p>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon leave">
          <i class="fas fa-umbrella-beach"></i>
        </div>
        <div class="summary-content">
          <h3>{{ summary.leave }}</h3>
          <p>Leave Days</p>
        </div>
      </div>
    </div>
    
    <div class="attendance-table">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Total Hours</th>
            <th>Status</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody v-if="filteredRecords.length > 0">
          <tr v-for="record in filteredRecords" :key="record.id">
            <td>{{ formatDate(record.date) }}</td>
            <td>
              <span v-if="record.checkIn">{{ formatTime(record.checkIn) }}</span>
              <span v-else class="text-muted">-</span>
            </td>
            <td>
              <span v-if="record.checkOut">{{ formatTime(record.checkOut) }}</span>
              <span v-else class="text-muted">-</span>
            </td>
            <td>{{ calculateHours(record.checkIn, record.checkOut) }}</td>
            <td>
              <span class="status" :class="record.status">{{ formatStatus(record.status) }}</span>
            </td>
            <td>
              <button v-if="record.notes" class="notes-btn" @click="showNotes(record.notes)">
                <i class="fas fa-sticky-note"></i>
              </button>
              <span v-else class="text-muted">-</span>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="6" class="no-records">
              No attendance records found
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="pagination" v-if="totalPages > 1">
      <button class="pagination-btn" :disabled="currentPage === 1" @click="prevPage">
        <i class="fas fa-chevron-left"></i>
      </button>
      <button 
        v-for="page in totalPages" 
        :key="page" 
        class="pagination-btn" 
        :class="{ active: page === currentPage }"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>
      <button class="pagination-btn" :disabled="currentPage === totalPages" @click="nextPage">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
    
    <!-- Check In/Out Modal -->
    <div v-if="showCheckModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ currentAction === 'checkin' ? 'Check In' : 'Check Out' }}</h3>
          <button class="modal-close" @click="showCheckModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="current-time">
            <i class="fas fa-clock"></i>
            {{ currentTime }}
          </div>
          <div class="form-group">
            <label>Notes (Optional)</label>
            <textarea v-model="checkNotes" class="notes-input" placeholder="Add any notes..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showCheckModal = false">Cancel</button>
          <button class="btn-save" @click="performCheckInOut">
            {{ currentAction === 'checkin' ? 'Check In' : 'Check Out' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Notes Modal -->
    <div v-if="showNotesModal" class="modal-overlay">
      <div class="modal-content notes-modal">
        <div class="modal-header">
          <h3>Attendance Notes</h3>
          <button class="modal-close" @click="showNotesModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>{{ currentNotes }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showNotesModal = false">Close</button>
        </div>
      </div>
    </div>
    
    <!-- Current Day Status -->
    <div class="current-day-status" v-if="todayStatus">
      <div class="status-content">
        <span class="status-label">Today:</span>
        <span class="status-value" :class="todayStatus.status">{{ formatStatus(todayStatus.status) }}</span>
        <span class="status-time" v-if="todayStatus.checkIn">
          (Checked in at {{ formatTime(todayStatus.checkIn) }})
        </span>
      </div>
      <div class="status-actions">
        <button 
          v-if="!todayStatus.checkIn" 
          class="action-btn primary checkin-btn"
          @click="openCheckModal('checkin')"
        >
          <i class="fas fa-sign-in-alt mr-2"></i>
          Check In
        </button>
        <button 
          v-if="todayStatus.checkIn && !todayStatus.checkOut" 
          class="action-btn primary checkout-btn"
          @click="openCheckModal('checkout')"
        >
          <i class="fas fa-sign-out-alt mr-2"></i>
          Check Out
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// API configuration
const API_BASE_URL = 'https://api.example.com'
const ATTENDANCE_ENDPOINT = `${API_BASE_URL}/attendance/employee`

// Reactive state
const startDate = ref('')
const endDate = ref('')
const selectedStatus = ref('')
const attendanceRecords = ref([])
const loading = ref(false)
const error = ref('')
const success = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalRecords = ref(0)
const showCheckModal = ref(false)
const showNotesModal = ref(false)
const currentAction = ref('checkin')
const checkNotes = ref('')
const currentNotes = ref('')
const currentTime = ref('')
const todayStatus = ref(null)

// Summary data
const summary = ref({
  present: 0,
  absent: 0,
  late: 0,
  leave: 0
})

// Methods
const fetchAttendance = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const params = {
      page: currentPage.value,
      limit: itemsPerPage.value,
      status: selectedStatus.value,
      startDate: startDate.value,
      endDate: endDate.value
    }
    
    // In a real app:
    // const response = await axios.get(ATTENDANCE_ENDPOINT, { params })
    // attendanceRecords.value = response.data.records
    // totalRecords.value = response.data.total
    // summary.value = response.data.summary
    // todayStatus.value = response.data.todayStatus
    
    // Mock data for demonstration
    const today = new Date().toISOString().split('T')[0]
    const mockResponse = {
      records: [
        {
          id: 1,
          date: today,
          checkIn: '08:45:00',
          checkOut: null,
          status: 'present',
          notes: ''
        },
        {
          id: 2,
          date: '2023-06-15',
          checkIn: '08:45:00',
          checkOut: '17:30:00',
          status: 'present',
          notes: 'Worked from home in the afternoon'
        },
        {
          id: 3,
          date: '2023-06-14',
          checkIn: '09:15:00',
          checkOut: '17:45:00',
          status: 'late',
          notes: 'Traffic delay'
        },
        {
          id: 4,
          date: '2023-06-13',
          checkIn: null,
          checkOut: null,
          status: 'on-leave',
          notes: 'Annual leave'
        },
        {
          id: 5,
          date: '2023-06-12',
          checkIn: '08:30:00',
          checkOut: '16:45:00',
          status: 'present',
          notes: ''
        }
      ],
      total: 5,
      summary: {
        present: 3,
        absent: 0,
        late: 1,
        leave: 1
      },
      todayStatus: {
        date: today,
        checkIn: '08:45:00',
        checkOut: null,
        status: 'present'
      }
    }
    
    attendanceRecords.value = mockResponse.records
    totalRecords.value = mockResponse.total
    summary.value = mockResponse.summary
    todayStatus.value = mockResponse.todayStatus
    
  } catch (err) {
    error.value = 'Failed to fetch attendance data. ' + (err.response?.data?.message || err.message)
    console.error('Error fetching attendance:', err)
  } finally {
    loading.value = false
  }
}

const performCheckInOut = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const data = {
      action: currentAction.value,
      notes: checkNotes.value,
      time: new Date().toISOString()
    }
    
    // In a real app:
    // await axios.post(`${ATTENDANCE_ENDPOINT}/check`, data)
    
    success.value = `Successfully ${currentAction.value === 'checkin' ? 'checked in' : 'checked out'}`
    showCheckModal.value = false
    checkNotes.value = ''
    fetchAttendance()
    
  } catch (err) {
    error.value = `Failed to ${currentAction.value}. ` + (err.response?.data?.message || err.message)
    console.error(`Error during ${currentAction.value}:`, err)
  } finally {
    loading.value = false
  }
}

const exportAttendance = () => {
  // Implement export functionality
  success.value = 'Export functionality would download your attendance records'
}

const openCheckModal = (action) => {
  currentAction.value = action
  updateCurrentTime()
  showCheckModal.value = true
}

const showNotes = (notes) => {
  currentNotes.value = notes
  showNotesModal.value = true
}

const updateCurrentTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchAttendance()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchAttendance()
  }
}

const goToPage = (page) => {
  currentPage.value = page
  fetchAttendance()
}

// Formatting helpers
const formatDate = (dateString) => {
  if (!dateString) return ''
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

const formatTime = (timeString) => {
  if (!timeString) return ''
  const [hours, minutes] = timeString.split(':')
  const date = new Date()
  date.setHours(hours)
  date.setMinutes(minutes)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatStatus = (status) => {
  const statusMap = {
    'present': 'Present',
    'absent': 'Absent',
    'late': 'Late',
    'on-leave': 'On Leave'
  }
  return statusMap[status] || status
}

const calculateHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return '-'
  
  try {
    const [inHours, inMinutes] = checkIn.split(':').map(Number)
    const [outHours, outMinutes] = checkOut.split(':').map(Number)
    
    const totalInMinutes = inHours * 60 + inMinutes
    const totalOutMinutes = outHours * 60 + outMinutes
    
    if (totalOutMinutes <= totalInMinutes) return '0h'
    
    const diffMinutes = totalOutMinutes - totalInMinutes
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60
    
    return `${hours}h ${minutes}m`
  } catch {
    return '-'
  }
}

// Computed properties
const filteredRecords = computed(() => {
  return attendanceRecords.value.filter(record => {
    const matchesStatus = !selectedStatus.value || record.status === selectedStatus.value
    const matchesDate = (!startDate.value || record.date >= startDate.value) && 
                       (!endDate.value || record.date <= endDate.value)
    return matchesStatus && matchesDate
  })
})

const totalPages = computed(() => {
  return Math.ceil(totalRecords.value / itemsPerPage.value)
})

// Lifecycle hooks
onMounted(() => {
  // Set default date range to current month
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  
  startDate.value = firstDay.toISOString().split('T')[0]
  endDate.value = lastDay.toISOString().split('T')[0]
  
  fetchAttendance()
  
  // Update current time every second when modal is open
  setInterval(() => {
    if (showCheckModal.value) {
      updateCurrentTime()
    }
  }, 1000)
})
</script>

<style scoped>
.attendance-page {
  @apply bg-white rounded-xl shadow-sm p-6;
  position: relative;
  padding-bottom: 80px; /* Space for current day status */
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

.checkin-btn {
  @apply bg-blue-600 border-blue-600 hover:bg-blue-700;
}

.checkout-btn {
  @apply bg-purple-600 border-purple-600 hover:bg-purple-700;
}

.notification-area {
  @apply mb-4;
}

.notification {
  @apply p-3 rounded-lg mb-2 flex items-center;
}

.notification.loading {
  @apply bg-blue-100 text-blue-800;
}

.notification.error {
  @apply bg-red-100 text-red-800;
}

.notification.success {
  @apply bg-green-100 text-green-800;
}

.attendance-filters {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6;
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

.attendance-summary {
  @apply grid grid-cols-2 md:grid-cols-4 gap-4 mb-6;
}

.summary-card {
  @apply bg-white rounded-lg shadow-sm p-4 flex items-center;
  border-left: 4px solid;
}

.summary-icon {
  @apply w-12 h-12 rounded-full flex items-center justify-center text-white mr-4;
}

.summary-icon.present {
  @apply bg-emerald-500;
  border-color: #10b981;
}

.summary-icon.absent {
  @apply bg-red-500;
  border-color: #ef4444;
}

.summary-icon.late {
  @apply bg-amber-500;
  border-color: #f59e0b;
}

.summary-icon.leave {
  @apply bg-blue-500;
  border-color: #3b82f6;
}

.summary-content h3 {
  @apply text-xl font-bold text-gray-800 mb-1;
}

.summary-content p {
  @apply text-sm text-gray-500;
}

.attendance-table {
  @apply overflow-x-auto mb-6;
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

.notes-btn {
  @apply p-1 text-gray-600 hover:text-emerald-600;
}

.text-muted {
  @apply text-gray-400;
}

.no-records {
  @apply text-center py-4 text-gray-500;
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

.pagination-btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

/* Current Day Status */
.current-day-status {
  @apply fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-6;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 50;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-content {
  @apply flex items-center;
}

.status-label {
  @apply font-medium text-gray-700 mr-2;
}

.status-value {
  @apply px-2 py-1 text-xs rounded-full font-medium mr-2;
}

.status-value.present {
  @apply bg-emerald-100 text-emerald-800;
}

.status-value.late {
  @apply bg-amber-100 text-amber-800;
}

.status-value.absent {
  @apply bg-red-100 text-red-800;
}

.status-value.on-leave {
  @apply bg-blue-100 text-blue-800;
}

.status-time {
  @apply text-sm text-gray-500;
}

.status-actions {
  @apply flex space-x-2;
}

/* Modal styles */
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl w-full max-w-md;
}

.notes-modal {
  @apply max-w-sm;
}

.modal-header {
  @apply px-6 py-4 border-b border-gray-200 flex justify-between items-center;
}

.modal-header h3 {
  @apply text-lg font-semibold text-gray-800;
}

.modal-close {
  @apply text-gray-500 hover:text-gray-700;
}

.modal-body {
  @apply px-6 py-4;
}

.current-time {
  @apply text-2xl font-bold text-center mb-6 text-emerald-600;
}

.notes-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300;
  min-height: 100px;
}

.modal-footer {
  @apply px-6 py-4 border-t border-gray-200 flex justify-end space-x-3;
}

.btn-cancel {
  @apply px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50;
}

.btn-save {
  @apply px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700;
}
</style>