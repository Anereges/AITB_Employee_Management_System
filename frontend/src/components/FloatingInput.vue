<template>
  <div class="relative mb-4">
    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 text-green-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icon" />
      </svg>
    </div>
    <input
      :id="id || label.toLowerCase().replace(' ', '-')"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur')"
      :type="type"
      class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
      :placeholder="placeholder || label"
      :class="{ 'border-red-500': error }"
      :required="required"
    />
    <label
      :for="id || label.toLowerCase().replace(' ', '-')"
      class="absolute left-9 -top-2.5 bg-white px-1 text-xs text-gray-500 transition-all"
    >
      {{ label }}
    </label>
    <p v-if="error" class="mt-1 ml-1 text-sm text-red-500">{{ error }}</p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    required: true
  },
  type: {
    type: String,
    default: 'text'
  },
  label: {
    type: String,
    required: true
  },
  error: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    required: true
  },
  id: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  }
});

defineEmits(['update:modelValue', 'blur']);
</script>