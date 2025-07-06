import { createApp, h } from 'vue'
import ToastNotification from '@/components/ui/ToastNotification.vue'

const toast = {
  install(app) {
    app.config.globalProperties.$toast = {
      show(options) {
        const toastApp = createApp({
          data() {
            return {
              showToast: true
            }
          },
          render() {
            return h(ToastNotification, {
              message: options.message,
              type: options.type || 'info',
              duration: options.duration || 5000,
              show: this.showToast,
              onClose: () => {
                this.showToast = false
                setTimeout(() => {
                  toastApp.unmount()
                  document.getElementById('toast-container')?.remove()
                }, 300)
              }
            })
          }
        })

        let toastContainer = document.getElementById('toast-container')
        if (!toastContainer) {
          toastContainer = document.createElement('div')
          toastContainer.id = 'toast-container'
          document.body.appendChild(toastContainer)
        }

        toastApp.mount(toastContainer)
      },

      info(message, duration = 5000) {
        this.show({ message, type: 'info', duration })
      },

      success(message, duration = 5000) {
        this.show({ message, type: 'success', duration })
      },

      warning(message, duration = 5000) {
        this.show({ message, type: 'warning', duration })
      },

      error(message, duration = 5000) {
        this.show({ message, type: 'error', duration })
      }
    }
  }
}

export default toast