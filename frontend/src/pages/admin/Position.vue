<template>
  <div class="positions-page">
    <div class="page-header">
      <h1 class="text-2xl font-bold">
        <i class="fas fa-users-cog mr-2"></i>
        Manage Positions
      </h1>
      <button 
        @click="openCreateModal"
        class="btn-primary"
      >
        <i class="fas fa-plus mr-2"></i>
        Add Position
      </button>
    </div>

    <div class="positions-table">
      <table>
        <thead>
          <tr>
            <th>Position</th>
            <th>Department</th>
            <th>Employees</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="position in positions" :key="position._id">
            <td>{{ position.title }}</td>
            <td>{{ position.department }}</td>
            <td>{{ position.employees || 0 }}</td> <!-- ✅ Fixed line -->
            <td>
              <span :class="statusClass(position)">
                {{ position.status || 'Active' }}
              </span>
            </td>
            <td>
              <button @click="editPosition(position)" class="btn-icon">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deletePosition(position._id)" class="btn-icon text-red-500">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
          <tr v-if="positions.length === 0">
            <td colspan="5" class="text-center py-4">No positions found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <PositionModal
      v-if="showModal"
      :position="currentPosition"
      @close="closeModal"
      @save="savePosition"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import PositionModal from '@/components/admin/PositionModal.vue'
import { useToast } from 'vue-toastification'

const toast = useToast()
const positions = ref([])
const showModal = ref(false)
const currentPosition = ref(null)

// Axios config with token
const api = axios.create({
  baseURL: 'http://localhost:5000/api/admin',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
})

// Refresh token before each request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => Promise.reject(error))

// Fetch positions
const fetchPositions = async () => {
  try {
    const response = await api.get('/position')
    positions.value = response.data.data?.positions || []
  } catch (error) {
    toast.error('Failed to load positions')
    console.error('Fetch positions error:', error)
  }
}

// Create modal
const openCreateModal = () => {
  currentPosition.value = null
  showModal.value = true
}

// Edit modal
const editPosition = (position) => {
  currentPosition.value = { ...position }
  showModal.value = true
}

// Save position
const savePosition = async (positionData) => {
  try {
    if (positionData._id) {
      await api.put(`/position/${positionData._id}`, positionData)
      toast.success('Position updated successfully')
    } else {
      await api.post('/position', positionData)
      toast.success('Position created successfully')
    }
    await fetchPositions()
    closeModal()
  } catch (error) {
    toast.error('Failed to save position')
    console.error('Save position error:', error)
  }
}

// Delete position
const deletePosition = async (id) => {
  if (!confirm('Are you sure you want to delete this position?')) return
  try {
    await api.delete(`/position/${id}`)
    toast.success('Position deleted successfully')
    positions.value = positions.value.filter(p => p._id !== id)
  } catch (error) {
    toast.error('Failed to delete position')
    console.error('Delete position error:', error)
  }
}

// Close modal
const closeModal = () => {
  showModal.value = false
}

// Load on mount
onMounted(() => {
  fetchPositions()
})

// Status class
const statusClass = (position) => {
  return {
    'status-badge': true,
    'active': (position.status || 'Active') === 'Active',
    'inactive': (position.status || 'Active') !== 'Active'
  }
}
</script>


<style scoped>
/* Keep your existing styles */
.positions-page {
  @apply space-y-6;
}

.page-header {
  @apply flex flex-col md:flex-row md:items-center md:justify-between mb-6;
}

.positions-table {
  @apply overflow-x-auto bg-white rounded-lg shadow;
}

table {
  @apply min-w-full divide-y divide-gray-200;
}

th {
  @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
}

td {
  @apply px-6 py-4 whitespace-nowrap text-sm text-gray-500;
}

.status-badge {
  @apply px-2 py-1 rounded-full text-xs font-semibold;
}

.status-badge.active {
  @apply bg-green-100 text-green-800;
}

.status-badge.inactive {
  @apply bg-gray-100 text-gray-800;
}

.btn-icon {
  @apply p-1 mx-1 rounded hover:bg-gray-100;
}
</style>
