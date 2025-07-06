<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import api from '@/api/axios';
import ModalDialog from '@/components/ui/ModalDialog.vue';
import AddEmployeeForm from '@/pages/admin/AddEmployee.vue';
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowPathIcon as RefreshIcon,
  UserIcon,
  UsersIcon as UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  PlusIcon,
  BellIcon
} from '@heroicons/vue/24/outline';

const toast = useToast();

const user = ref({
  role: 'admin',
  id: null,
  name: '',
  email: ''
});

const showAddEmployeeForm = ref(false);
const showRejectModal = ref(false);
const showUserDetailsModal = ref(false);
const showApproveModal = ref(false);

const approvalData = ref({
  department: '',
  position: '',
  role: 'employee',
  salary: '',
  sex: '',
  employmentType: 'full-time'
});

const departments = ref([]);

const pendingRegistrations = ref([]);
const notifications = ref([]);
const recentActivities = ref([]);
const stats = ref({
  totalUsers: 0,
  activeToday: 0,
  pendingApprovals: 0,
  adminUsers: 0,
  totalEmployees: 0,
  activeEmployees: 0,
  unreadNotifications: 0
});
const lastUpdated = ref(new Date());
const activeApprovalTab = ref('pending');
const selectedUser = ref(null);
const rejectionReason = ref('');
const loadingStates = ref({});
const isAddingEmployee = ref(false);
const currentPage = ref(1);
const itemsPerPage = 10;

const approvalTabs = computed(() => [
  {
    label: 'Pending',
    value: 'pending',
    count: stats.value.pendingApprovals || 0
  },
  {
    label: 'Approved',
    value: 'approved',
    count: (pendingRegistrations.value || []).filter(u => u.isActive).length
  },
  {
    label: 'Rejected',
    value: 'rejected',
    count: (pendingRegistrations.value || []).filter(u => u.isRejected).length
  }
]);

const filteredUsers = computed(() => {
  const users = pendingRegistrations.value || [];
  let filtered = [];
  
  switch (activeApprovalTab.value) {
    case 'pending': 
      filtered = users.filter(u => !u.isActive && !u.isRejected);
      break;
    case 'approved': 
      filtered = users.filter(u => u.isActive);
      break;
    case 'rejected': 
      filtered = users.filter(u => u.isRejected);
      break;
    default: 
      filtered = users;
  }
  
  const start = (currentPage.value - 1) * itemsPerPage;
  return filtered.slice(start, start + itemsPerPage);
});

const totalPages = computed(() => {
  const users = pendingRegistrations.value || [];
  let filtered = [];
  
  switch (activeApprovalTab.value) {
    case 'pending': 
      filtered = users.filter(u => !u.isActive && !u.isRejected);
      break;
    case 'approved': 
      filtered = users.filter(u => u.isActive);
      break;
    case 'rejected': 
      filtered = users.filter(u => u.isRejected);
      break;
    default: 
      filtered = users;
  }
  
  return Math.ceil(filtered.length / itemsPerPage) || 1;
});

const formatRole = (role) => {
  const roles = {
    employee: 'Employee',
    hr: 'HR Manager',
    admin: 'Administrator'
  };
  return roles[role] || role;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};

const formatDateTime = (date) => {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Invalid Date';
  }
};

const getStatusText = (user) => {
  if (!user) return 'Unknown';
  return user.isRejected ? 'Rejected' : (user.isActive ? 'Approved' : 'Pending');
};

const getStatusClass = (user) => {
  if (!user) return 'unknown';
  return user.isRejected ? 'rejected' : (user.isActive ? 'approved' : 'pending');
};

const showNotification = ({ type, message }) => {
  toast[type](message);
};

const fetchDepartments = async () => {
  try {
    const response = await api.get('/api/departments', { withCredentials: true });
    if (response.data && Array.isArray(response.data)) {
      departments.value = response.data;
    } else {
      departments.value = [];
    }
  } catch (error) {
    console.error('Failed to fetch departments:', error);
    showNotification({ type: 'error', message: 'Failed to load departments' });
    departments.value = [];
  }
};

const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(id);

const fetchDashboardStats = async () => {
  try {
    const response = await api.get('/api/admin/dashboard-stats');
    if (response.data && response.data.data) {
      stats.value = {
        ...stats.value,
        ...response.data.data.stats
      };
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    showNotification({ type: 'error', message: 'Failed to load dashboard stats' });
  }
};

const fetchPendingRegistrations = async () => {
  try {
    const response = await api.get('/api/admin/pending-registrations');
    if (response.data && response.data.data) {
      pendingRegistrations.value = Array.isArray(response.data.data) ? response.data.data : [];
      stats.value.pendingApprovals = response.data.count || 0;
      lastUpdated.value = new Date();
    }
  } catch (error) {
    console.error('Error fetching pending registrations:', error);
    showNotification({ type: 'error', message: 'Failed to load pending registrations' });
  }
};

const fetchNotifications = async () => {
  try {
    const response = await api.get('/api/admin/notifications/unread');
    if (response.data && response.data.data) {
      notifications.value = Array.isArray(response.data.data) ? response.data.data : [];
      stats.value.unreadNotifications = response.data.count || 0;
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    showNotification({ type: 'error', message: 'Failed to load notifications' });
  }
};

const fetchRecentActivities = async () => {
  try {
    if (notifications.value.length > 0) {
      recentActivities.value = notifications.value.slice(0, 5).map(n => ({
        id: n._id || n.id,
        type: 'notification',
        message: n.message || 'No message',
        timestamp: n.createdAt || new Date()
      }));
    } else {
      const response = await api.get('/api/admin/recent-activities');
      if (response.data && response.data.data) {
        recentActivities.value = Array.isArray(response.data.data) ? response.data.data : [];
      }
    }
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    recentActivities.value = [];
  }
};

const openApproveModal = (user) => {
  if (!user) return;
  selectedUser.value = user;
  
  // Initialize department with either the populated department's _id or the raw ObjectId
  const departmentId = user.department?._id || user.department || '';
  
  approvalData.value = { 
    department: departmentId,
    position: user.position || '',
    role: user.role || 'employee',
    salary: user.salary || '',
    sex: user.sex || '',
    employmentType: user.employmentType || 'full-time'
  };
  showApproveModal.value = true;
};

const confirmApprove = async () => {
  if (!selectedUser.value?.id) return;

  // Validate required fields
  if (!approvalData.value.department || !approvalData.value.position) {
    showNotification({ type: 'error', message: 'Department and Position are required fields' });
    return;
  }

  if (!isValidObjectId(approvalData.value.department)) {
    showNotification({ type: 'error', message: 'Invalid department selected' });
    return;
  }

  const departmentExists = departments.value.some(d => d._id === approvalData.value.department);
  if (!departmentExists) {
    showNotification({ type: 'error', message: 'Selected department does not exist' });
    return;
  }

  loadingStates.value[selectedUser.value.id] = 'approving';
  try {
    const payload = {
      department: approvalData.value.department,
      position: approvalData.value.position,
      role: approvalData.value.role,
      salary: approvalData.value.salary || null,
      sex: approvalData.value.sex || null,
      employmentType: approvalData.value.employmentType || null
    };

    const response = await api.patch(
      `/api/admin/approve-registration/${selectedUser.value.id}`,
      payload
    );
    
    if (response.data) {
      const index = pendingRegistrations.value.findIndex(u => u.id === selectedUser.value.id);
      if (index !== -1) {
        pendingRegistrations.value[index] = {
          ...pendingRegistrations.value[index],
          isActive: true,
          isRejected: false,
          department: approvalData.value.department,
          position: approvalData.value.position,
          role: approvalData.value.role,
          salary: approvalData.value.salary,
          sex: approvalData.value.sex,
          employmentType: approvalData.value.employmentType
        };
      }

      await Promise.all([fetchDashboardStats(), fetchNotifications()]);
      showNotification({
        type: 'success',
        message: response.data.message || 'Registration approved successfully'
      });

      showApproveModal.value = false;
      approvalData.value = {
        department: '',
        position: '',
        role: 'employee',
        salary: '',
        sex: '',
        employmentType: 'full-time'
      };
    }
  } catch (error) {
    console.error('Approval error:', error);
    let errorMessage = 'Failed to approve registration';

    if (error.response) {
      errorMessage = error.response.data?.message ||
        `Server error (${error.response.status})`;
      console.error('Error details:', error.response.data);
    }

    showNotification({ type: 'error', message: errorMessage });
  } finally {
    loadingStates.value[selectedUser.value.id] = null;
  }
};

const rejectRegistration = async () => {
  if (!selectedUser.value?.id) return;

  try {
    await api.delete(`/api/admin/reject-registration/${selectedUser.value.id}`, {
      data: { reason: rejectionReason.value }
    });

    const index = pendingRegistrations.value.findIndex(u => u.id === selectedUser.value.id);
    if (index !== -1) {
      pendingRegistrations.value[index] = {
        ...pendingRegistrations.value[index],
        isActive: false,
        isRejected: true,
        rejectionReason: rejectionReason.value
      };
    }
    
    await Promise.all([fetchDashboardStats(), fetchNotifications()]);
    showRejectModal.value = false;
    showNotification({ type: 'success', message: 'Registration rejected successfully' });
  } catch (error) {
    console.error('Rejection error:', error);
    showNotification({
      type: 'error',
      message: error.response?.data?.message || 'Failed to reject registration'
    });
  }
};

const markNotificationAsRead = async (notificationId) => {
  if (!notificationId) return;
  
  try {
    await api.patch(`/api/admin/notifications/${notificationId}/read`);
    await fetchNotifications();
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

const openRejectModal = (user) => {
  if (!user) return;
  selectedUser.value = user;
  rejectionReason.value = '';
  showRejectModal.value = true;
};

const closeRejectModal = () => {
  showRejectModal.value = false;
  selectedUser.value = null;
  rejectionReason.value = '';
};

const openUserDetails = (user) => {
  if (!user) return;
  selectedUser.value = user;
  showUserDetailsModal.value = true;
};

const closeUserDetailsModal = () => {
  showUserDetailsModal.value = false;
  selectedUser.value = null;
};

const handleEmployeeAdded = () => {
  showAddEmployeeForm.value = false;
  refreshData();
  showNotification({
    type: 'success',
    message: 'Employee added successfully'
  });
};

const closeAddEmployeeForm = () => {
  showAddEmployeeForm.value = false;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const refreshData = async () => {
  try {
    await Promise.all([
      fetchDepartments(),
      fetchDashboardStats(),
      fetchPendingRegistrations(),
      fetchNotifications()
    ]);
    await fetchRecentActivities();
    showNotification({ type: 'success', message: 'Data refreshed successfully' });
  } catch (error) {
    console.error('Refresh error:', error);
    showNotification({ type: 'error', message: 'Failed to refresh data' });
  }
};

onMounted(async () => {
  try {
    await Promise.all([
      fetchDepartments(),
      fetchDashboardStats(),
      fetchPendingRegistrations(),
      fetchNotifications()
    ]);
    await fetchRecentActivities();
    
    setInterval(async () => {
      await Promise.all([
        fetchDepartments(),
        fetchDashboardStats(),
        fetchPendingRegistrations(),
        fetchNotifications()
      ]);
    }, 30000);
  } catch (error) {
    console.error('Initialization error:', error);
    showNotification({ type: 'error', message: 'Failed to load initial data' });
  }
});
</script>

<template>
  <div class="admin-dashboard">
    <!-- Dashboard Header -->
    <div class="dashboard-header">
      <h1>Admin Dashboard</h1>
      <div class="header-actions">
        <button @click="refreshData" class="refresh-btn">
          <RefreshIcon class="icon" />
          Refresh
        </button>
        <button @click="showAddEmployeeForm = true" class="add-employee-btn">
          <PlusIcon class="icon" />
          Add Employee
        </button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">
          <UserGroupIcon />
        </div>
        <div class="stat-content">
          <h3>Total Employees</h3>
          <p>{{ stats.totalEmployees || 0 }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <UserIcon />
        </div>
        <div class="stat-content">
          <h3>Active Employees</h3>
          <p>{{ stats.activeEmployees || 0 }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <ClockIcon />
        </div>
        <div class="stat-content">
          <h3>Pending Approvals</h3>
          <p>{{ stats.pendingApprovals || 0 }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <BellIcon />
        </div>
        <div class="stat-content">
          <h3>Unread Notifications</h3>
          <p>{{ stats.unreadNotifications || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="dashboard-content">
      <!-- Pending Approvals Section -->
      <div class="approvals-section">
        <div class="section-header">
          <h2>Registration Approvals</h2>
          <div class="approval-tabs">
            <button
              v-for="tab in approvalTabs"
              :key="tab.value"
              @click="activeApprovalTab = tab.value"
              :class="{ active: activeApprovalTab === tab.value }"
            >
              {{ tab.label }} ({{ tab.count }})
            </button>
          </div>
        </div>

        <div class="approvals-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>{{ user.fullName || 'N/A' }}</td>
                <td>{{ user.email || 'N/A' }}</td>
                <td>{{ formatRole(user.role) }}</td>
                <td>{{ formatDate(user.createdAt) }}</td>
                <td>
                  <span :class="['status-badge', getStatusClass(user)]">
                    {{ getStatusText(user) }}
                  </span>
                </td>
                <td class="actions">
                  <button @click="openUserDetails(user)" class="view-btn">
                    <EyeIcon />
                  </button>
                  <button
                    v-if="!user.isActive && !user.isRejected"
                    @click="openApproveModal(user)"
                    class="approve-btn"
                    :disabled="loadingStates[user.id] === 'approving'"
                  >
                    <CheckCircleIcon />
                    {{ loadingStates[user.id] === 'approving' ? 'Approving...' : 'Approve' }}
                  </button>
                  <button
                    v-if="!user.isActive && !user.isRejected"
                    @click="openRejectModal(user)"
                    class="reject-btn"
                  >
                    <XCircleIcon />
                    Reject
                  </button>
                </td>
              </tr>
              <tr v-if="filteredUsers.length === 0">
                <td colspan="6" class="no-data">No users found</td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="pagination" v-if="totalPages > 1">
            <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
          </div>
        </div>
      </div>

      <!-- Recent Activities & Notifications -->
      <div class="activities-section">
        <div class="recent-activities">
          <h2>Recent Activities</h2>
          <ul v-if="recentActivities.length > 0">
            <li v-for="activity in recentActivities" :key="activity.id">
              <div class="activity-message">{{ activity.message }}</div>
              <div class="activity-time">{{ formatDateTime(activity.timestamp) }}</div>
            </li>
          </ul>
          <p v-else class="no-activities">No recent activities</p>
        </div>
        <div class="notifications">
          <h2>Notifications</h2>
          <ul v-if="notifications.length > 0">
            <li
              v-for="notification in notifications.slice(0, 5)"
              :key="notification.id"
              @click="markNotificationAsRead(notification.id)"
            >
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ formatDateTime(notification.createdAt) }}</div>
            </li>
          </ul>
          <p v-else class="no-notifications">No unread notifications</p>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ModalDialog
      v-if="showAddEmployeeForm"
      :show="showAddEmployeeForm"
      @close="closeAddEmployeeForm"
      title="Add New Employee"
    >
      <AddEmployeeForm @employee-added="handleEmployeeAdded" @cancel="closeAddEmployeeForm" />
    </ModalDialog>

    <ModalDialog
      v-if="showApproveModal"
      :show="showApproveModal"
      @close="showApproveModal = false"
      title="Approve Registration"
    >
      <div class="space-y-6 p-4 max-w-md mx-auto">
        <p class="text-gray-700 mb-4">
          Please confirm the employee details:
        </p>

        <div v-if="selectedUser" class="mb-6 bg-emerald-50 p-4 rounded shadow-sm">
          <p><strong>Name:</strong> {{ selectedUser.fullName || 'N/A' }}</p>
          <p><strong>Email:</strong> {{ selectedUser.email || 'N/A' }}</p>
        </div>

        <!-- Department -->
        <div>
          <label for="department" class="block text-sm font-medium text-gray-700 mb-1">
            Department <span class="text-emerald-600">*</span>
          </label>
          <select
            id="department"
            v-model="approvalData.department"
            required
            class="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 focus:ring-1 transition"
          >
            <option value="" disabled>Select Department</option>
            <option v-for="dept in departments" :key="dept._id" :value="dept._id">
              {{ dept.name }}
            </option>
          </select>
        </div>

        <!-- Position -->
        <div>
          <label for="position" class="block text-sm font-medium text-gray-700 mb-1">
            Position <span class="text-emerald-600">*</span>
          </label>
          <input
            id="position"
            v-model="approvalData.position"
            type="text"
            placeholder="Enter position"
            required
            class="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500 focus:ring-1 transition"
          />
        </div>

        <!-- Role -->
        <div>
          <label for="role" class="block text-sm font-medium text-gray-700 mb-1">
            Role <span class="text-emerald-600">*</span>
          </label>
          <select
            id="role"
            v-model="approvalData.role"
            required
            class="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 focus:ring-1 transition"
          >
            <option value="employee">Employee</option>
            <option value="hr">HR Manager</option>
            <option value="admin">Administrator</option>
          </select>
        </div>

        <!-- Salary -->
        <div>
          <label for="salary" class="block text-sm font-medium text-gray-700 mb-1">
            Salary
          </label>
          <input
            id="salary"
            v-model.number="approvalData.salary"
            type="number"
            min="0"
            placeholder="Enter salary"
            class="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500 focus:ring-1 transition"
          />
        </div>

        <!-- Sex -->
        <div>
          <label for="sex" class="block text-sm font-medium text-gray-700 mb-1">
            Sex
          </label>
          <select
            id="sex"
            v-model="approvalData.sex"
            class="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 focus:ring-1 transition"
          >
            <option value="">Select Sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <!-- Employment Type -->
        <div>
          <label for="employmentType" class="block text-sm font-medium text-gray-700 mb-1">
            Employment Type
          </label>
          <select
            id="employmentType"
            v-model="approvalData.employmentType"
            class="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 focus:ring-1 transition"
          >
            <option value="full-time">Full-Time</option>
            <option value="part-time">Part-Time</option>
            <option value="contract">Contract</option>
            <option value="temporary">Temporary</option>
          </select>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            @click="showApproveModal = false"
            class="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            @click="confirmApprove"
            :disabled="!approvalData.department || !approvalData.position"
            class="px-4 py-2 rounded-md bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Confirm Approval
          </button>
        </div>
      </div>
    </ModalDialog>

    <ModalDialog
      v-if="showRejectModal"
      :show="showRejectModal"
      @close="closeRejectModal"
      title="Reject Registration"
    >
      <div class="reject-modal">
        <p>Are you sure you want to reject this registration?</p>
        <div class="user-info">
          <p><strong>Name:</strong> {{ selectedUser?.fullName || 'N/A' }}</p>
          <p><strong>Email:</strong> {{ selectedUser?.email || 'N/A' }}</p>
        </div>
        <textarea
          v-model="rejectionReason"
          placeholder="Enter reason for rejection..."
          rows="3"
        ></textarea>
        <div class="modal-actions">
          <button @click="closeRejectModal" class="cancel-btn">Cancel</button>
          <button @click="rejectRegistration" class="confirm-btn">Confirm Rejection</button>
        </div>
      </div>
    </ModalDialog>

    <ModalDialog
      v-if="showUserDetailsModal"
      :show="showUserDetailsModal"
      @close="closeUserDetailsModal"
      :title="selectedUser?.fullName || 'User Details'"
    >
      <div class="user-details" v-if="selectedUser">
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">{{ selectedUser.email || 'N/A' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Phone:</span>
          <span class="detail-value">{{ selectedUser.phone || 'N/A' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Role:</span>
          <span class="detail-value">{{ formatRole(selectedUser.role) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Registration Date:</span>
          <span class="detail-value">{{ formatDate(selectedUser.createdAt) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span :class="['detail-value', getStatusClass(selectedUser)]">
            {{ getStatusText(selectedUser) }}
          </span>
        </div>
        <div v-if="selectedUser.isRejected" class="detail-row">
          <span class="detail-label">Rejection Reason:</span>
          <span class="detail-value">{{ selectedUser.rejectionReason || 'Not specified' }}</span>
        </div>
      </div>
    </ModalDialog>
  </div>
</template>

<style scoped>
.admin-dashboard {
  @apply p-4 max-w-7xl mx-auto;
}

.dashboard-header {
  @apply flex justify-between items-center mb-6;
}

.dashboard-header h1 {
  @apply text-2xl font-bold text-gray-800;
}

.header-actions {
  @apply flex gap-3;
}

.refresh-btn, .add-employee-btn {
  @apply flex items-center gap-2 px-4 py-2 rounded-md shadow-sm text-sm font-medium;
}

.refresh-btn {
  @apply bg-white text-gray-700 border border-gray-300 hover:bg-gray-50;
}

.add-employee-btn {
  @apply bg-emerald-600 text-white hover:bg-emerald-700;
}

.icon {
  @apply h-5 w-5;
}

.stats-overview {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6;
}

.stat-card {
  @apply bg-white rounded-lg shadow-sm p-4 flex items-start gap-4;
}

.stat-icon {
  @apply p-3 rounded-full bg-emerald-100 text-emerald-600;
}

.stat-icon svg {
  @apply h-6 w-6;
}

.stat-content h3 {
  @apply text-sm font-medium text-gray-500;
}

.stat-content p {
  @apply text-2xl font-semibold text-gray-900 mt-1;
}

.dashboard-content {
  @apply grid grid-cols-1 lg:grid-cols-3 gap-6;
}

.approvals-section {
  @apply bg-white rounded-lg shadow-sm p-4 lg:col-span-2;
}

.section-header {
  @apply flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3;
}

.section-header h2 {
  @apply text-lg font-semibold text-gray-800;
}

.approval-tabs {
  @apply flex border border-gray-200 rounded-md overflow-hidden;
}

.approval-tabs button {
  @apply px-3 py-1 text-sm font-medium;
}

.approval-tabs button.active {
  @apply bg-emerald-600 text-white;
}

.approvals-table {
  @apply overflow-x-auto;
}

.approvals-table table {
  @apply min-w-full divide-y divide-gray-200;
}

.approvals-table thead tr th {
  @apply px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
}

.approvals-table tbody tr {
  @apply hover:bg-gray-50;
}

.approvals-table tbody tr td {
  @apply px-4 py-3 whitespace-nowrap text-sm text-gray-500;
}

.status-badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.status-badge.pending {
  @apply bg-yellow-100 text-yellow-800;
}

.status-badge.approved {
  @apply bg-emerald-100 text-emerald-800;
}

.status-badge.rejected {
  @apply bg-red-100 text-red-800;
}

.actions {
  @apply flex gap-2;
}

.view-btn, .approve-btn, .reject-btn {
  @apply flex items-center gap-1 px-2 py-1 rounded-md text-xs;
}

.view-btn {
  @apply text-gray-600 hover:text-gray-900;
}

.approve-btn {
  @apply bg-emerald-100 text-emerald-700 hover:bg-emerald-200;
}

.reject-btn {
  @apply bg-red-100 text-red-700 hover:bg-red-200;
}

.no-data {
  @apply text-center py-4 text-gray-500;
}

.pagination {
  @apply flex justify-between items-center mt-4;
}

.pagination button {
  @apply px-3 py-1 border border-gray-300 rounded-md text-sm;
}

.pagination button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.activities-section {
  @apply space-y-4;
}

.recent-activities, .notifications {
  @apply bg-white rounded-lg shadow-sm p-4;
}

.recent-activities h2, .notifications h2 {
  @apply text-lg font-semibold text-gray-800 mb-3;
}

.recent-activities ul, .notifications ul {
  @apply space-y-3;
}

.recent-activities li, .notifications li {
  @apply cursor-pointer hover:bg-gray-50 p-2 rounded-md;
}

.activity-message, .notification-message {
  @apply text-sm text-gray-700;
}

.activity-time, .notification-time {
  @apply text-xs text-gray-500 mt-1;
}

.no-activities, .no-notifications {
  @apply text-sm text-gray-500 italic;
}

.reject-modal {
  @apply space-y-4 p-4;
}

.user-info {
  @apply bg-gray-50 p-3 rounded-md;
}

.user-info p {
  @apply text-sm;
}

.reject-modal textarea {
  @apply w-full border border-gray-300 rounded-md p-2 text-sm;
}

.modal-actions {
  @apply flex justify-end gap-3 pt-3;
}

.cancel-btn {
  @apply px-3 py-1 border border-gray-300 rounded-md text-sm;
}

.confirm-btn {
  @apply px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700;
}

.user-details {
  @apply space-y-3 p-4;
}

.detail-row {
  @apply flex;
}

.detail-label {
  @apply w-1/3 text-sm font-medium text-gray-500;
}

.detail-value {
  @apply w-2/3 text-sm text-gray-900;
}

.detail-value.approved {
  @apply text-emerald-600;
}

.detail-value.pending {
  @apply text-yellow-600;
}

.detail-value.rejected {
  @apply text-red-600;
}
</style>