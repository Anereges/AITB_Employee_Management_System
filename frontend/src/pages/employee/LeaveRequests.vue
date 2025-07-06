<template>
  <div class="leave-requests-page">
    <div class="page-header">
      <h1 class="page-title">Leave Requests</h1>
      <div class="header-actions">
        <button class="action-btn" @click="exportRequests" :disabled="loading">
          <i class="fas fa-download mr-2"></i>
          Export
        </button>
        <button class="action-btn primary" @click="openNewRequestModal">
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
        <input type="date" v-model="selectedDate" />
      </div>

      <button class="filter-btn" @click="applyFilters" :disabled="loading">
        <i class="fas fa-filter mr-2"></i>
        Apply
      </button>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="loading" class="loading-message">Loading leave requests...</div>

    <div v-if="!loading && leaveRequests.length === 0" class="no-data-message">
      No leave requests found.
    </div>

    <div v-if="!loading && leaveRequests.length > 0" class="requests-table">
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
          <tr v-for="request in filteredRequests" :key="request._id">
            <td>
              <div class="employee-info">
                <img :src="request.employee.avatar || defaultAvatar" :alt="request.employee.name" />
                <span>{{ request.employee.name }}</span>
              </div>
            </td>
            <td>{{ request.type }}</td>
            <td>{{ formatDate(request.startDate) }} to {{ formatDate(request.endDate) }}</td>
            <td>{{ request.days }}</td>
            <td class="reason">{{ request.reason }}</td>
            <td>
              <span class="status" :class="request.status">{{ request.status }}</span>
            </td>
            <td>
              <div class="request-actions">
                <button v-if="request.status === 'Pending'" class="approve-btn" @click="approveRequest(request._id)">
                  <i class="fas fa-check"></i>
                </button>
                <button v-if="request.status === 'Pending'" class="reject-btn" @click="rejectRequest(request._id)">
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

    <!-- New Leave Request Modal -->
    <transition name="fade">
      <div v-if="showNewRequestModal" class="modal-overlay" @click.self="closeNewRequestModal">
        <div class="modal-content">
          <h2>New Leave Request</h2>
          <form @submit.prevent="submitNewRequest" novalidate>
            <div class="form-group">
              <label for="newLeaveType">Leave Type</label>
              <select v-model="newRequest.leaveType" id="newLeaveType" required>
                <option disabled value="">Select leave type</option>
                <option v-for="type in leaveTypes" :key="type" :value="type">{{ type }}</option>
              </select>
              <span v-if="newRequestErrors.leaveType" class="error">{{ newRequestErrors.leaveType }}</span>
            </div>

            <div class="form-group">
              <label for="newStartDate">Start Date</label>
              <input type="date" v-model="newRequest.startDate" id="newStartDate" required />
              <span v-if="newRequestErrors.startDate" class="error">{{ newRequestErrors.startDate }}</span>
            </div>

            <div class="form-group">
              <label for="newEndDate">End Date</label>
              <input type="date" v-model="newRequest.endDate" id="newEndDate" required :min="newRequest.startDate" />
              <span v-if="newRequestErrors.endDate" class="error">{{ newRequestErrors.endDate }}</span>
            </div>

            <div class="form-group">
              <label for="newReason">Reason</label>
              <textarea v-model="newRequest.reason" id="newReason" rows="3" placeholder="Optional"></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeNewRequestModal" :disabled="newRequestLoading">Cancel</button>
              <button type="submit" :disabled="newRequestLoading">
                <span v-if="newRequestLoading">Submitting...</span>
                <span v-else>Submit</span>
              </button>
            </div>

            <div v-if="newRequestError" class="error-message mt-2">{{ newRequestError }}</div>
            <div v-if="newRequestSuccess" class="success-message mt-2">{{ newRequestSuccess }}</div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

// State for leave requests and filters
const leaveRequests = ref([]);
const selectedStatus = ref('');
const selectedType = ref('');
const selectedDate = ref('');
const loading = ref(false);
const error = ref(null);
const defaultAvatar = '/images/default-avatar.png';

// Format date helper
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString();
};

// Filtered leave requests based on filters
const filteredRequests = computed(() => {
  return leaveRequests.value.filter(request => {
    const matchesStatus = !selectedStatus.value || request.status === selectedStatus.value;
    const matchesType = !selectedType.value || request.type.toLowerCase().includes(selectedType.value.toLowerCase());
    const matchesDate = !selectedDate.value ||
      (new Date(request.startDate) <= new Date(selectedDate.value) && new Date(request.endDate) >= new Date(selectedDate.value));
    return matchesStatus && matchesType && matchesDate;
  });
});

// Fetch leave requests from backend
const fetchLeaveRequests = async () => {
  loading.value = true;
  error.value = null;
  try {
    const params = {
      status: selectedStatus.value || undefined,
      leaveType: selectedType.value || undefined,
      date: selectedDate.value || undefined
    };
    const response = await axios.get('/api/leaves/my-requests', { params });
    leaveRequests.value = response.data.data.leaves || [];
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load leave requests';
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  fetchLeaveRequests();
};

// Approve a leave request
const approveRequest = async (id) => {
  try {
    await axios.patch(`/api/leaves/${id}/approve`);
    await fetchLeaveRequests();
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to approve request');
  }
};

const rejectRequest = async (id) => {
  try {
    await axios.post(`/api/leaves/${id}/reject`);
    await fetchLeaveRequests();
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to reject request');
  }
};

const viewRequest = (request) => {
  alert(`Viewing request for ${request.employee.name}`);
};

const exportRequests = () => {
  alert('Export functionality is not implemented yet.');
};

// New Request Modal State
const showNewRequestModal = ref(false);
const leaveTypes = ['Vacation', 'Sick', 'Personal', 'Maternity/Paternity'];

const newRequest = ref({
  leaveType: '',
  startDate: '',
  endDate: '',
  reason: ''
});

const newRequestErrors = ref({
  leaveType: '',
  startDate: '',
  endDate: ''
});

const newRequestLoading = ref(false);
const newRequestError = ref('');
const newRequestSuccess = ref('');

// Open/close modal handlers
const openNewRequestModal = () => {
  resetNewRequestForm();
  showNewRequestModal.value = true;
};

const closeNewRequestModal = () => {
  showNewRequestModal.value = false;
};

// Validate new request form
const validateNewRequest = () => {
  newRequestErrors.value.leaveType = newRequest.value.leaveType ? '' : 'Leave type is required.';
  newRequestErrors.value.startDate = newRequest.value.startDate ? '' : 'Start date is required.';
  newRequestErrors.value.endDate = newRequest.value.endDate ? '' : 'End date is required.';

  if (newRequest.value.startDate && newRequest.value.endDate && newRequest.value.endDate < newRequest.value.startDate) {
    newRequestErrors.value.endDate = 'End date cannot be before start date.';
  }

  return !newRequestErrors.value.leaveType && !newRequestErrors.value.startDate && !newRequestErrors.value.endDate;
};

// Reset form data
const resetNewRequestForm = () => {
  newRequest.value = {
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  };
  newRequestErrors.value = {
    leaveType: '',
    startDate: '',
    endDate: ''
  };
  newRequestError.value = '';
  newRequestSuccess.value = '';
};

// Submit new leave request to backend
const submitNewRequest = async () => {
  if (!validateNewRequest()) return;

  newRequestLoading.value = true;
  newRequestError.value = '';
  newRequestSuccess.value = '';

  try {
    await axios.post('/api/leaves/request', {
      leaveType: newRequest.value.leaveType,
      startDate: newRequest.value.startDate,
      endDate: newRequest.value.endDate,
      reason: newRequest.value.reason
    });

    newRequestSuccess.value = 'Leave request submitted successfully!';
    await fetchLeaveRequests();
    resetNewRequestForm();
    setTimeout(() => {
      closeNewRequestModal();
    }, 1500);
  } catch (err) {
    newRequestError.value = err.response?.data?.message || 'Failed to submit leave request.';
  } finally {
    newRequestLoading.value = false;
  }
};

// Fetch initial leave requests on mount
onMounted(() => {
  fetchLeaveRequests();
});
</script>


<style scoped>
.leave-requests-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
  font-family: Arial, sans-serif;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.page-title {
  margin: 0;
}
.header-actions button {
  margin-left: 0.5rem;
}
.action-btn {
  background-color: #eee;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
  font-size: 1rem;
}
.action-btn.primary {
  background-color: #28a745;
  color: white;
}
.filters-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.filter-group {
  display: flex;
  flex-direction: column;
}
.filter-group label {
  font-weight: bold;
  margin-bottom: 0.25rem;
}
.filter-btn {
  align-self: flex-end;
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
}
.requests-table table {
  width: 100%;
  border-collapse: collapse;
}
.requests-table th,
.requests-table td {
  border: 1px solid #ddd;
  padding: 0.5rem;
  text-align: left;
}
.employee-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.employee-info img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
.status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: capitalize;
  font-weight: bold;
}
.status.pending {
  background-color: #ffc107;
  color: #212529;
}
.status.approved {
  background-color: #28a745;
  color: white;
}
.status.rejected {
  background-color: #dc3545;
  color: white;
}
.request-actions button {
  background: none;
  border: none;
  cursor: pointer;
  margin-right: 0.25rem;
  font-size: 1.1rem;
}
.request-actions button.approve-btn {
  color: #28a745;
}
.request-actions button.reject-btn {
  color: #dc3545;
}
.request-actions button.view-btn {
  color: #007bff;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
}
.modal-content h2 {
  margin-top: 0;
}
.form-group {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: bold;
}
input[type='date'],
select,
textarea {
  width: 100%;
  padding: 0.4rem;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
}
textarea {
  resize: vertical;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.modal-actions button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}
.modal-actions button[type="submit"] {
  background-color: #28a745;
  color: white;
}
.modal-actions button[type="button"] {
  background-color: #ccc;
}
.error {
  color: #dc3545;
  font-size: 0.875rem;
}
.error-message {
  color: #dc3545;
  margin-top: 0.5rem;
}
.success-message {
  color: #28a745;
  margin-top: 0.5rem;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>


  
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