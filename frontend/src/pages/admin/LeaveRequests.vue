<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold text-gray-800">Leave Requests</h1>
      <div class="flex space-x-4">
        <button
          @click="exportToCSV"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <i class="fas fa-file-export mr-2"></i> Export
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Status Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="selectedStatus"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <!-- Type Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
          <select
            v-model="selectedType"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="vacation">Vacation</option>
            <option value="sick">Sick Leave</option>
            <option value="personal">Personal</option>
            <option value="maternity">Maternity/Paternity</option>
          </select>
        </div>

        <!-- Date Range -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            v-model="dateRange.start"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            v-model="dateRange.end"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
      </div>

      <!-- Search and Action Buttons -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 gap-4">
        <div class="w-full md:w-1/2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <div class="relative">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search by name or reason..."
              class="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
          </div>
        </div>

        <div class="flex space-x-2 w-full md:w-auto">
          <button
            @click="applyFilters"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Apply Filters
          </button>
          <button
            @click="resetFilters"
            class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
          >
            Reset
          </button>
        </div>
      </div>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <!-- Leave Requests Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden mb-6">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                @click="sortRequests('name')"
              >
                <div class="flex items-center">
                  Employee
                  <i :class="['fas ml-1', sortIcon('name')]"></i>
                </div>
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                @click="sortRequests('type')"
              >
                <div class="flex items-center">
                  Type
                  <i :class="['fas ml-1', sortIcon('type')]"></i>
                </div>
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                @click="sortRequests('startDate')"
              >
                <div class="flex items-center">
                  Dates
                  <i :class="['fas ml-1', sortIcon('startDate')]"></i>
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Days
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                @click="sortRequests('status')"
              >
                <div class="flex items-center">
                  Status
                  <i :class="['fas ml-1', sortIcon('status')]"></i>
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="filteredRequests.length === 0">
              <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                No leave requests found matching your criteria.
              </td>
            </tr>
            <tr
              v-for="request in paginatedRequests"
              :key="request.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img
                      class="h-10 w-10 rounded-full"
                      :src="request.avatar || defaultAvatar"
                      :alt="request.name"
                      @error="onAvatarError"
                    />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ request.name }}</div>
                    <div class="text-sm text-gray-500">Submitted: {{ formatDateTime(request.createdAt) }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-blue-100 text-blue-800': request.type === 'vacation',
                    'bg-red-100 text-red-800': request.type === 'sick',
                    'bg-purple-100 text-purple-800': request.type === 'personal',
                    'bg-pink-100 text-pink-800': request.type === 'maternity'
                  }"
                >
                  {{ formatLeaveType(request.type) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(request.startDate) }}</div>
                <div class="text-sm text-gray-500">to {{ formatDate(request.endDate) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ request.days }} day{{ request.days !== 1 ? 's' : '' }}
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 max-w-xs truncate">{{ request.reason }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-yellow-100 text-yellow-800': request.status === 'pending',
                    'bg-green-100 text-green-800': request.status === 'approved',
                    'bg-red-100 text-red-800': request.status === 'rejected'
                  }"
                >
                  {{ formatStatus(request.status) }}
                </span>
                <div v-if="request.processedBy" class="text-xs text-gray-500 mt-1">
                  By {{ request.processedBy }}<br>
                  {{ formatDateTime(request.processedAt) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="viewRequest(request)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  <i class="fas fa-eye"></i>
                </button>

                <!-- Approval/Rejection Buttons -->
                <template v-if="canApproveRequests && request.status === 'pending'">
                  <button
                    @click="approveRequest(request)"
                    class="text-green-600 hover:text-green-900 mr-3"
                  >
                    <i class="fas fa-check"></i>
                  </button>
                  <button
                    @click="rejectRequest(request)"
                    class="text-red-600 hover:text-red-900 mr-3"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </template>

                <button
                  v-if="canDeleteRequests"
                  @click="confirmDeleteRequest(request)"
                  class="text-red-600 hover:text-red-900"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredRequests.length > 0" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing <span class="font-medium">{{ paginationStart }}</span> to <span class="font-medium">{{ paginationEnd }}</span> of <span class="font-medium">{{ filteredRequests.length }}</span> results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="prevPage"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Previous</span>
                <i class="fas fa-chevron-left"></i>
              </button>

              <button
                v-for="(page, index) in displayedPages"
                :key="index"
                @click="goToPage(page)"
                :class="{
                  'z-10 bg-blue-50 border-blue-500 text-blue-600': page === currentPage,
                  'bg-white border-gray-300 text-gray-500 hover:bg-gray-50': page !== currentPage && page !== '...',
                  'cursor-default': page === '...'
                }"
                class="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                :disabled="page === '...'"
              >
                {{ page }}
              </button>

              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Next</span>
                <i class="fas fa-chevron-right"></i>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- View Request Modal -->
    <div v-if="selectedRequest" class="fixed inset-0 overflow-y-auto z-50">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg leading-6 font-medium text-gray-900">Leave Request Details</h3>
                  <button @click="selectedRequest = null" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                  </button>
                </div>

                <div class="flex items-center mb-6">
                  <img
                    class="h-12 w-12 rounded-full mr-4"
                    :src="selectedRequest.avatar || defaultAvatar"
                    :alt="selectedRequest.name"
                    @error="onAvatarError"
                  />
                  <div>
                    <h4 class="text-lg font-medium text-gray-900">{{ selectedRequest.name }}</h4>
                    <p class="text-sm text-gray-500">Submitted: {{ formatDateTime(selectedRequest.createdAt) }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p class="text-sm text-gray-500">Leave Type</p>
                    <p class="text-sm font-medium text-gray-900">{{ formatLeaveType(selectedRequest.type) }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Status</p>
                    <span
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="{
                        'bg-yellow-100 text-yellow-800': selectedRequest.status === 'pending',
                        'bg-green-100 text-green-800': selectedRequest.status === 'approved',
                        'bg-red-100 text-red-800': selectedRequest.status === 'rejected'
                      }"
                    >
                      {{ formatStatus(selectedRequest.status) }}
                    </span>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p class="text-sm text-gray-500">Start Date</p>
                    <p class="text-sm font-medium text-gray-900">{{ formatDate(selectedRequest.startDate) }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">End Date</p>
                    <p class="text-sm font-medium text-gray-900">{{ formatDate(selectedRequest.endDate) }}</p>
                  </div>
                </div>

                <div class="mb-4">
                  <p class="text-sm text-gray-500">Duration</p>
                    <p class="text-sm font-medium text-gray-900">{{ selectedRequest.days }} day{{ selectedRequest.days !== 1 ? 's' : '' }}</p>
                </div>

                <div class="mb-4">
                  <p class="text-sm text-gray-500">Reason</p>
                  <p class="text-sm font-medium text-gray-900">{{ selectedRequest.reason }}</p>
                </div>

                <div v-if="selectedRequest.processedBy" class="bg-gray-50 p-4 rounded-md">
                  <p class="text-sm text-gray-500">Processed By</p>
                  <p class="text-sm font-medium text-gray-900 mb-2">{{ selectedRequest.processedBy }}</p>
                  <p class="text-sm text-gray-500">Processed At</p>
                  <p class="text-sm font-medium text-gray-900">{{ formatDateTime(selectedRequest.processedAt) }}</p>
                </div>

                <!-- Approve/Reject Buttons -->
                <div v-if="canApproveRequests && selectedRequest.status === 'pending'" class="mt-6 flex justify-end space-x-3">
                  <button
                    @click="approveRequest(selectedRequest)"
                    class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    @click="rejectRequest(selectedRequest)"
                    class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 overflow-y-auto z-50">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <i class="fas fa-exclamation text-red-600"></i>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Delete Leave Request</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">Are you sure you want to delete this leave request? This action cannot be undone.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="deleteRequest"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Delete
            </button>
            <button
              type="button"
              @click="showDeleteModal = false"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import api from '@/api/axios'; // Adjust path as needed

const toast = useToast();

// Data properties
const selectedStatus = ref('');
const selectedType = ref('');
const dateRange = ref({ start: '', end: '' });
const searchQuery = ref('');
const selectedRequest = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const sortField = ref('startDate');
const sortDirection = ref('desc');
const showDeleteModal = ref(false);
const requestToDelete = ref(null);
const isLoading = ref(false);

// Data from API
const employees = ref([]);
const leaveRequests = ref([]);

// Permission system - in real app, get from auth store
const userRole = ref('admin'); // 'admin', 'hr', or 'employee'
const currentUser = ref('Admin User'); // Current logged in user

// Computed properties
const canApproveRequests = computed(() => ['admin', 'hr'].includes(userRole.value));
const canDeleteRequests = computed(() => ['admin'].includes(userRole.value));

// Filtered and paginated requests
const filteredRequests = computed(() => {
  let filtered = [...leaveRequests.value];

  if (selectedStatus.value) {
    filtered = filtered.filter(request => request.status === selectedStatus.value);
  }

  if (selectedType.value) {
    filtered = filtered.filter(request => request.type === selectedType.value);
  }

  if (dateRange.value.start) {
    filtered = filtered.filter(request => new Date(request.endDate) >= new Date(dateRange.value.start));
  }

  if (dateRange.value.end) {
    filtered = filtered.filter(request => new Date(request.startDate) <= new Date(dateRange.value.end));
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(request =>
      request.name.toLowerCase().includes(query) ||
      request.reason.toLowerCase().includes(query)
    );
  }

  return filtered.sort((a, b) => {
    let fieldA = a[sortField.value];
    let fieldB = b[sortField.value];

    if (sortField.value.includes('Date') || sortField.value.includes('At')) {
      fieldA = new Date(fieldA).getTime();
      fieldB = new Date(fieldB).getTime();
    }

    if (fieldA < fieldB) {
      return sortDirection.value === 'asc' ? -1 : 1;
    }
    if (fieldA > fieldB) {
      return sortDirection.value === 'asc' ? 1 : -1;
    }
    return 0;
  });
});

const paginatedRequests = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredRequests.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredRequests.value.length / itemsPerPage.value));
const paginationStart = computed(() => (currentPage.value - 1) * itemsPerPage.value + 1);
const paginationEnd = computed(() => {
  const end = currentPage.value * itemsPerPage.value;
  return end > filteredRequests.value.length ? filteredRequests.value.length : end;
});

const displayedPages = computed(() => {
  const pages = [];
  const maxVisiblePages = 5;

  if (totalPages.value <= maxVisiblePages) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    let start = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2));
    let end = Math.min(totalPages.value, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = end - maxVisiblePages + 1;
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('...');
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages.value) {
      if (end < totalPages.value - 1) {
        pages.push('...');
      }
      pages.push(totalPages.value);
    }
  }

  return pages;
});

// Helper functions
function formatDate(dateString) {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatDateTime(dateTimeString) {
  if (!dateTimeString) return '';
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateTimeString).toLocaleDateString(undefined, options);
}

function formatLeaveType(type) {
  const types = {
    vacation: 'Vacation',
    sick: 'Sick Leave',
    personal: 'Personal',
    maternity: 'Maternity/Paternity'
  };
  return types[type] || type;
}

function formatStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// API functions
async function fetchLeaveRequests() {
  try {
    isLoading.value = true;
    const response = await api.get('/api/leaves/leave-requests/pending');

    leaveRequests.value = response.data.data.leaves.map(request => ({
      id: request._id,
      employeeId: request.employee._id,
      name: request.employee.fullName,
      avatar: request.employee.avatar || defaultAvatar,
      type: request.leaveType,
      startDate: request.startDate,
      endDate: request.endDate,
      days: request.days,
      reason: request.reason,
      status: request.status.toLowerCase(),
      createdAt: request.createdAt,
      processedBy: request.processedBy,
      processedAt: request.processedAt
    }));
  } catch (error) {
    console.error('Full error:', error);
    console.error('Response data:', error.response?.data);
    console.error('Status code:', error.response?.status);
    toast.error(error.response?.data?.message || 'Failed to fetch leave requests');
  } finally {
    isLoading.value = false;
  }
}

async function fetchEmployees() {
  try {
    const response = await api.get('/api/employees');

    // ✅ Fix: access the actual array inside response.data.data.employees
    employees.value = response.data.data.employees.map(emp => ({
      id: emp._id,
      name: emp.fullName,
      department: emp.department,
      avatar: emp.avatar || defaultAvatar
    }));
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to fetch employees');
    console.error('Error fetching employees:', error);
  }
}


async function approveRequest(request) {
  try {
    isLoading.value = true;
    const response = await api.patch(`/leaves/approve/${request.id}`, {
      comments: 'Approved by admin'
    });

    // Update the request in the list
    const index = leaveRequests.value.findIndex(r => r.id === request.id);
    if (index !== -1) {
      leaveRequests.value[index] = {
        ...leaveRequests.value[index],
        status: 'approved',
        processedBy: currentUser.value,
        processedAt: new Date().toISOString()
      };
    }

    toast.success('Leave request approved!');
    selectedRequest.value = null;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to approve leave request');
    console.error('Error approving leave request:', error);
  } finally {
    isLoading.value = false;
  }
}

async function rejectRequest(request) {
  try {
    isLoading.value = true;
    const response = await api.patch(`/leaves/reject/${request.id}`, {
      comments: 'Rejected by admin'
    });

    // Update the request in the list
    const index = leaveRequests.value.findIndex(r => r.id === request.id);
    if (index !== -1) {
      leaveRequests.value[index] = {
        ...leaveRequests.value[index],
        status: 'rejected',
        processedBy: currentUser.value,
        processedAt: new Date().toISOString()
      };
    }

    toast.warning('Leave request rejected!');
    selectedRequest.value = null;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to reject leave request');
    console.error('Error rejecting leave request:', error);
  } finally {
    isLoading.value = false;
  }
}

async function deleteRequest() {
  if (!requestToDelete.value) return;

  try {
    isLoading.value = true;
    await api.delete(`/leaves/${requestToDelete.value.id}`);

    // Remove from the list
    const index = leaveRequests.value.findIndex(r => r.id === requestToDelete.value.id);
    if (index !== -1) {
      leaveRequests.value.splice(index, 1);
    }

    toast.success('Leave request deleted successfully!');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to delete leave request');
    console.error('Error deleting leave request:', error);
  } finally {
    isLoading.value = false;
    showDeleteModal.value = false;
    requestToDelete.value = null;
  }
}

// UI functions
function applyFilters() {
  currentPage.value = 1;
}

function resetFilters() {
  selectedStatus.value = '';
  selectedType.value = '';
  dateRange.value = { start: '', end: '' };
  searchQuery.value = '';
  sortField.value = 'startDate';
  sortDirection.value = 'desc';
  currentPage.value = 1;
}

function viewRequest(request) {
  selectedRequest.value = { ...request };
}

function confirmDeleteRequest(request) {
  requestToDelete.value = request;
  showDeleteModal.value = true;
}

function sortRequests(field) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortDirection.value = 'asc';
  }
}

function sortIcon(field) {
  if (sortField.value !== field) return 'fa-sort';
  return sortDirection.value === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
}

function goToPage(page) {
  if (page !== '...') {
    currentPage.value = page;
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

function resetPagination() {
  currentPage.value = 1;
}

function exportToCSV() {
  const headers = ['Employee', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Reason', 'Status'];
  const csvContent = [
    headers.join(','),
    ...filteredRequests.value.map(request =>
      [
        `"${request.name}"`,
        `"${formatLeaveType(request.type)}"`,
        `"${formatDate(request.startDate)}"`,
        `"${formatDate(request.endDate)}"`,
        request.days,
        `"${request.reason}"`,
        `"${formatStatus(request.status)}"`
      ].join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `leave_requests_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast.info('Export started!');
}

// Initialize data
onMounted(() => {
  fetchLeaveRequests();
  fetchEmployees();
});

const defaultAvatar = '/images/default-avatar.png';

function onAvatarError(event) {
  event.target.src = defaultAvatar;
}
</script>

<style>
/* You can add custom styles here if needed */
.fa-sort {
  opacity: 0.3;
}
.fa-sort-up, .fa-sort-down {
  opacity: 1;
}
</style>