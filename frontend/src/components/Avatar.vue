<template>
  <div class="avatar" :class="size" :style="avatarStyle">
    <img v-if="src" :src="src" :alt="name" />
    <span v-else class="avatar-initials">{{ initials }}</span>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  props: {
    src: String,
    name: String,
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    color: String
  },
  setup(props) {
    const initials = computed(() => {
      if (!props.name) return '';
      const parts = props.name.split(' ');
      return parts
        .map(part => part[0])
        .join('')
        .toUpperCase();
    });

    const avatarStyle = computed(() => {
      if (props.color) return { backgroundColor: props.color };
      return {};
    });

    return { initials, avatarStyle };
  }
};
</script>

<style scoped>
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #4f46e5, #8b5cf6);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  font-size: 0.75rem;
}

.avatar-md {
  width: 40px;
  height: 40px;
  font-size: 0.875rem;
}

.avatar-lg {
  width: 56px;
  height: 56px;
  font-size: 1.25rem;
}

.avatar-initials {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
</style>