<template>
    <div class="p-6 bg-white rounded-2xl shadow-md w-full max-w-md mx-auto">
      <h2 class="text-2xl font-bold mb-4">{{ isEdit ? 'Edit' : 'Add' }} Position</h2>
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label class="block font-semibold mb-1">Position Title</label>
          <input
            v-model="form.title"
            type="text"
            class="w-full border rounded-lg p-2 focus:outline-none focus:ring focus:ring-green-300"
            required
          />
        </div>
  
        <div class="mb-4">
          <label class="block font-semibold mb-1">Department</label>
          <select
            v-model="form.department"
            class="w-full border rounded-lg p-2 focus:outline-none focus:ring focus:ring-green-300"
            required
          >
            <option disabled value="">Select Department</option>
            <option v-for="dept in departments" :key="dept.id" :value="dept.name">
              {{ dept.name }}
            </option>
          </select>
        </div>
  
        <div class="flex justify-end gap-4">
          <button type="button" class="text-gray-500 hover:text-gray-700" @click="$emit('close')">Cancel</button>
          <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            {{ isEdit ? 'Update' : 'Create' }}
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  
  const props = defineProps({
    modelValue: Object,
    departments: Array,
    isEdit: Boolean
  })
  
  const emit = defineEmits(['update:modelValue', 'submit', 'close'])
  
  const form = ref({ title: '', department: '' })
  
  watch(
    () => props.modelValue,
    (val) => {
      if (val) {
        form.value = { ...val }
      }
    },
    { immediate: true }
  )
  
  const handleSubmit = () => {
    emit('submit', form.value)
  }
  </script>
  