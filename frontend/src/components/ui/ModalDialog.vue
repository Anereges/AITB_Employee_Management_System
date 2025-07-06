<template>
  <transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container" :class="sizeClass">
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button class="modal-close" @click="closeModal">
            <XMarkIcon class="close-icon" />
          </button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div class="modal-footer" v-if="$slots.footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { XMarkIcon } from '@heroicons/vue/24/outline';
import { computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Modal Title'
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  }
});

const emit = defineEmits(['close']);

const sizeClass = computed(() => {
  return {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    'full': 'max-w-full'
  }[props.size];
});

const closeModal = () => {
  emit('close');
};
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
  backdrop-filter: blur(2px);
}

.modal-container {
  @apply bg-white rounded-lg shadow-xl w-full mx-4;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  @apply flex justify-between items-center px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10;
}

.modal-header h3 {
  @apply text-lg font-semibold text-gray-800;
}

.modal-close {
  @apply text-gray-500 hover:text-gray-700 transition-colors;
}

.close-icon {
  @apply w-5 h-5;
}

.modal-body {
  @apply px-6 py-4;
}

.modal-footer {
  @apply px-6 py-4 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white;
}

/* Modal transition effects */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: translateY(-20px);
  opacity: 0;
}
</style>