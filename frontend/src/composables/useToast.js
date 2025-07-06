// src/composables/useToast.js
import { ref } from 'vue'

export function useToast() {
  const toast = ref({
    show: false,
    message: '',
    type: 'success' // can be 'success', 'error', 'warning', or 'info'
  })

  const showToast = (type, message, duration = 3000) => {
    toast.value = {
      show: true,
      message,
      type
    }
    
    setTimeout(() => {
      toast.value.show = false
    }, duration)
  }

  return { toast, showToast }
}