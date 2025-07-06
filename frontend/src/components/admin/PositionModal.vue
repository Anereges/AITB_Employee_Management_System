<template>
  <div class="position-modal">
    <div class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Edit Position' : 'Add New Position' }}</h3>
          <button @click="closeModal" class="modal-close">&times;</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="positionTitle">Position Title</label>
              <input
                id="positionTitle"
                v-model="formData.title"
                type="text"
                required
                placeholder="Enter position title"
              >
            </div>
            
            <div class="form-group">
              <label for="positionDepartment">Department</label>
              <select
                id="positionDepartment"
                v-model="formData.department"
                required
              >
                <option value="">Select Department</option>
                <option 
                  v-for="dept in departments" 
                  :key="dept.id" 
                  :value="dept.id"
                >
                  {{ dept.name }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="positionDescription">Description</label>
              <textarea
                id="positionDescription"
                v-model="formData.description"
                rows="3"
                placeholder="Enter position description"
              ></textarea>
            </div>
            
            <div class="modal-footer">
              <button type="button" @click="closeModal" class="btn secondary">
                Cancel
              </button>
              <button type="submit" class="btn primary">
                {{ isEditMode ? 'Update' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  position: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const departments = ref([
  { id: 'dev', name: 'Development' },
  { id: 'hr', name: 'Human Resources' },
  { id: 'finance', name: 'Finance' },
  { id: 'marketing', name: 'Marketing' }
])

const formData = ref({
  title: '',
  department: '',
  description: ''
})

const isEditMode = computed(() => props.position !== null)

// Initialize form if in edit mode
if (props.position) {
  formData.value = {
    title: props.position.title,
    department: props.position.department,
    description: props.position.description
  }
}

const handleSubmit = () => {
  emit('save', formData.value)
  closeModal()
}

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl w-full max-w-md;
}

.modal-header {
  @apply px-6 py-4 border-b border-gray-200 flex justify-between items-center;
}

.modal-header h3 {
  @apply text-lg font-bold text-gray-800;
}

.modal-close {
  @apply text-gray-500 hover:text-gray-700 text-xl;
}

.modal-body {
  @apply px-6 py-4;
}

.form-group {
  @apply mb-4;
}

.form-group label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.form-group input,
.form-group select,
.form-group textarea {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500;
}

.form-group textarea {
  @apply min-h-[100px];
}

.modal-footer {
  @apply px-6 py-4 border-t border-gray-200 flex justify-end gap-3;
}

.btn {
  @apply px-4 py-2 rounded-lg font-medium text-sm transition-colors;
}

.btn.primary {
  @apply bg-green-600 text-white hover:bg-green-700;
}

.btn.secondary {
  @apply bg-white border border-gray-300 text-gray-700 hover:bg-gray-50;
}
</style>