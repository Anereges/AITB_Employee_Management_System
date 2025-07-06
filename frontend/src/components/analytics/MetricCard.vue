<template>
  <div 
    class="metric-card"
    :class="[`metric-card--${variant}`, { 'metric-card--interactive': interactive }]"
    @click="handleClick"
  >
    <!-- Header Section -->
    <div class="metric-card__header">
      <div class="metric-card__icon">
        <slot name="icon">
          <span v-if="icon" class="icon-emoji">{{ icon }}</span>
        </slot>
      </div>
      <div class="metric-card__titles">
        <h3>{{ title }}</h3>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="showMenu" class="metric-card__menu" @click.stop="toggleMenu">
        <span class="menu-dots">⋮</span>
        <div v-if="menuOpen" class="menu-options">
          <div v-for="option in menuOptions" :key="option.value" @click="handleMenuSelect(option)">
            {{ option.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- Main Value Display -->
    <div class="metric-card__value">
      {{ formattedValue }}
      <span v-if="showTrend" class="trend-indicator" :class="trendDirection">
        {{ trendSymbol }} {{ Math.abs(trendPercentage) }}%
      </span>
    </div>

    <!-- Sparkline Visualization -->
    <div v-if="showSparkline && sparklineData.length" class="metric-card__sparkline">
      <div 
        v-for="(value, index) in normalizedSparkline" 
        :key="index" 
        class="sparkline-bar" 
        :style="{ height: `${value}%` }"
      ></div>
    </div>

    <!-- Footer Slot -->
    <div v-if="$slots.footer" class="metric-card__footer">
      <slot name="footer"></slot>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="metric-card__loading">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script>
import { ref, computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'MetricCard',
  props: {
    title: String,
    subtitle: String,
    value: [Number, String],
    variant: {
      type: String,
      default: 'default',
      validator: (val) => ['default', 'primary', 'success', 'warning', 'danger'].includes(val)
    },
    icon: String,
    trendPercentage: {
      type: Number,
      default: 0
    },
    sparklineData: {
      type: Array,
      default: () => []
    },
    loading: Boolean,
    interactive: Boolean,
    showTrend: Boolean,
    showSparkline: Boolean,
    showMenu: Boolean,
    menuOptions: {
      type: Array,
      default: () => []
    },
    formatValue: {
      type: Function,
      default: (val) => val
    }
  },
  emits: ['click', 'menu-select'],
  setup(props, { emit }) {
    const menuOpen = ref(false)

    // Format the displayed value
    const formattedValue = computed(() => props.formatValue(props.value))

    // Trend indicator calculations
    const trendDirection = computed(() => {
      if (props.trendPercentage > 0) return 'up'
      if (props.trendPercentage < 0) return 'down'
      return 'neutral'
    })

    const trendSymbol = computed(() => {
      if (props.trendPercentage > 0) return '↑'
      if (props.trendPercentage < 0) return '↓'
      return '→'
    })

    // Normalize sparkline data to percentages
    const normalizedSparkline = computed(() => {
      if (!props.sparklineData.length) return []
      const max = Math.max(...props.sparklineData)
      return props.sparklineData.map(val => (val / max) * 100)
    })

    // Event handlers
    const handleClick = () => props.interactive && emit('click')
    const toggleMenu = () => menuOpen.value = !menuOpen.value
    const handleMenuSelect = (option) => {
      menuOpen.value = false
      emit('menu-select', option)
    }

    return {
      formattedValue,
      trendDirection,
      trendSymbol,
      normalizedSparkline,
      menuOpen,
      handleClick,
      toggleMenu,
      handleMenuSelect
    }
  }
})
</script>

<style scoped>
.metric-card {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
}

.metric-card--interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  cursor: pointer;
}

/* Variant colors */
.metric-card--primary { border-left: 4px solid #3b82f6; }
.metric-card--success { border-left: 4px solid #10b981; }
.metric-card--warning { border-left: 4px solid #f59e0b; }
.metric-card--danger { border-left: 4px solid #ef4444; }

/* Header styles */
.metric-card__header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.metric-card__icon {
  margin-right: 12px;
  font-size: 20px;
}

.metric-card__titles h3 {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.metric-card__titles p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #9ca3af;
}

/* Value display */
.metric-card__value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 12px;
}

/* Trend indicator */
.trend-indicator {
  font-size: 14px;
  margin-left: 8px;
}
.trend-indicator.up { color: #10b981; }
.trend-indicator.down { color: #ef4444; }
.trend-indicator.neutral { color: #6b7280; }

/* Sparkline */
.metric-card__sparkline {
  display: flex;
  align-items: flex-end;
  height: 40px;
  gap: 2px;
}
.sparkline-bar {
  flex: 1;
  background-color: #3b82f6;
  border-radius: 2px;
  min-width: 3px;
}

/* Menu */
.metric-card__menu {
  margin-left: auto;
  position: relative;
}
.menu-dots {
  font-size: 20px;
  cursor: pointer;
  padding: 0 8px;
}
.menu-options {
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 8px 0;
  min-width: 120px;
}
.menu-options div {
  padding: 8px 12px;
  cursor: pointer;
}
.menu-options div:hover {
  background: #f3f4f6;
}

/* Loading state */
.metric-card__loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: inherit;
}
.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>