<template>
  <div class="task-item" :class="{ completed: task.completed, overdue: task.overdue }">
    <div class="task-checkbox" @click="$emit('complete', task.id)">
      <i v-if="task.completed" class="fas fa-check-circle"></i>
      <i v-else class="far fa-circle"></i>
    </div>
    <div class="task-content">
      <div class="task-header">
        <h3 class="task-title">{{ task.title }}</h3>
        <span class="task-priority" :class="task.priority">
          {{ task.priority }}
        </span>
      </div>
      <div class="task-meta">
        <span class="task-project">
          <i class="fas fa-project-diagram"></i> {{ task.project }}
        </span>
        <span class="task-due">
          <i class="fas fa-calendar-day"></i> {{ task.dueDate }}
        </span>
      </div>
    </div>
    <button class="task-edit" @click="$emit('edit', task)">
      <i class="fas fa-ellipsis-v"></i>
    </button>
  </div>
</template>

<script>
export default {
  props: {
    task: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped>
.task-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background: white;
  margin-bottom: 0.75rem;
  border-left: 4px solid #e5e7eb;
  transition: all 0.2s ease;
}

.task-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.task-item.completed {
  opacity: 0.7;
  border-left-color: #10b981;
}

.task-item.overdue {
  border-left-color: #ef4444;
}

.task-checkbox {
  font-size: 1.25rem;
  color: #d1d5db;
  cursor: pointer;
  transition: color 0.2s ease;
}

.task-checkbox:hover {
  color: #9ca3af;
}

.task-checkbox .fa-check-circle {
  color: #10b981;
}

.task-content {
  flex: 1;
}

.task-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.task-title {
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
  color: #111827;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: #6b7280;
}

.task-priority {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.task-priority.high {
  background: #fee2e2;
  color: #dc2626;
}

.task-priority.medium {
  background: #fef3c7;
  color: #d97706;
}

.task-priority.low {
  background: #ecfdf5;
  color: #059669;
}

.task-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.task-meta i {
  margin-right: 0.25rem;
  opacity: 0.7;
}

.task-edit {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.5rem;
  opacity: 0;
  transition: all 0.2s ease;
}

.task-item:hover .task-edit {
  opacity: 1;
}

.task-edit:hover {
  color: #4f46e5;
}
</style>