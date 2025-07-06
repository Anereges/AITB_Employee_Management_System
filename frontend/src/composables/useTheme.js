import { ref } from 'vue'

const theme = ref('light') // or 'dark'

export function useTheme() {
  return {
    theme,
    toggleTheme: () => {
      theme.value = theme.value === 'light' ? 'dark' : 'light'
    }
  }
}
