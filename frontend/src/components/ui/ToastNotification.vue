<template>
  <transition name="toast">
    <div v-if="show" class="toast-notification" :class="type">
      <div class="toast-content">
        <i :class="iconClass"></i>
        <span class="toast-message">{{ message }}</span>
      </div>
      <button class="toast-close" @click="close">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </transition>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ToastNotification',
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
    },
    duration: {
      type: Number,
      default: 5000
    },
    show: {
      type: Boolean,
      default: true
    }
  },
  emits: ['close'],
  computed: {
    iconClass() {
      const icons = {
        info: 'fas fa-info-circle',
        success: 'fas fa-check-circle',
        warning: 'fas fa-exclamation-circle',
        error: 'fas fa-times-circle'
      }
      return icons[this.type]
    }
  },
  mounted() {
    if (this.duration > 0) {
      setTimeout(() => {
        this.close()
      }, this.duration)
    }
  },
  methods: {
    close() {
      this.$emit('close')
    }
  }
})
</script>

<style scoped>
.toast-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 300px;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  transition: all 0.3s ease;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toast-message {
  font-size: 14px;
  line-height: 1.5;
}

.toast-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: 15px;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.toast-close:hover {
  opacity: 1;
}

/* Type-specific styles */
.toast-notification.info {
  background-color: #3498db;
  color: white;
}

.toast-notification.success {
  background-color: #2ecc71;
  color: white;
}

.toast-notification.warning {
  background-color: #f39c12;
  color: white;
}

.toast-notification.error {
  background-color: #e74c3c;
  color: white;
}

/* Animation */
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.toast-enter-to,
.toast-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
</style>