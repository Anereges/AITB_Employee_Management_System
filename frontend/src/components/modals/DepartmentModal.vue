<template>
  <div class="p-6 bg-white rounded-2xl shadow-md w-full max-w-md mx-auto">
    <h2 class="text-2xl font-bold mb-4">{{ mode === 'edit' ? 'Edit' : 'Add' }} Department</h2>
    <form @submit.prevent="handleSubmit" novalidate>
      <div class="mb-4">
        <label for="name" class="block font-semibold mb-1">Department Name <span class="text-red-500">*</span></label>
        <input
          id="name"
          v-model.trim="form.name"
          type="text"
          class="w-full border rounded-lg p-2 focus:outline-none focus:ring focus:ring-green-300"
          :class="{ 'border-red-500': errors.name }"
          required
          autocomplete="off"
          aria-describedby="nameError"
        />
        <p v-if="errors.name" id="nameError" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
      </div>

      <div class="mb-4">
        <label for="description" class="block font-semibold mb-1">Description</label>
        <textarea
          id="description"
          v-model.trim="form.description"
          class="w-full border rounded-lg p-2 focus:outline-none focus:ring focus:ring-green-300"
          rows="3"
          autocomplete="off"
        ></textarea>
      </div>

      <div class="flex justify-end gap-4">
        <button type="button" class="text-gray-500 hover:text-gray-700" @click="handleClose">Cancel</button>
        <button
          type="submit"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          :disabled="loading"
        >
          {{ mode === 'edit' ? 'Update' : 'Create' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  department: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    default: 'add' // 'add' or 'edit'
  }
})

const emit = defineEmits(['save', 'close'])

const form = ref({
  name: '',
  description: ''
})

const errors = ref({})
const loading = ref(false)

// Watch for prop changes to populate form
watch(
  () => props.department,
  (newDept) => {
    if (newDept) {
      form.value = {
        name: newDept.name || '',
        description: newDept.description || ''
      }
    } else {
      form.value = { name: '', description: '' }
    }
    errors.value = {}
  },
  { immediate: true }
)

// Simple validation function
const validate = () => {
  errors.value = {}
  if (!form.value.name.trim()) {
    errors.value.name = 'Department name is required.'
  }
  return Object.keys(errors.value).length === 0
}

const handleSubmit = () => {
  if (!validate()) return
  loading.value = true
  // Emit save event with form data
  emit('save', { ...form.value, _id: props.department?._id })
  loading.value = false
}

const handleClose = () => {
  errors.value = {}
  emit('close')
}
</script>

<style scoped>
/* Optional: add styles for error states */
</style>
