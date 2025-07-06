<template>
  <form @submit.prevent="submit">
    <div class="form-group">
      <label for="title">Task Title</label>
      <input 
        type="text" 
        id="title" 
        v-model="form.title" 
        placeholder="Enter task title"
        required
      >
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="dueDate">Due Date</label>
        <input 
          type="date" 
          id="dueDate" 
          v-model="form.dueDate"
          required
        >
      </div>

      <div class="form-group">
        <label for="priority">Priority</label>
        <select id="priority" v-model="form.priority" required>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label for="project">Project</label>
      <input 
        type="text" 
        id="project" 
        v-model="form.project" 
        placeholder="Enter project name"
        required
      >
    </div>

    <div class="form-actions">
      <button type="button" class="btn-cancel" @click="$emit('cancel')">
        Cancel
      </button>
      <button type="submit" class="btn-submit">
        {{ task.id ? 'Update' : 'Create' }} Task
      </button>
    </div>
  </form>
</template>

<script>
import { reactive, watch } from 'vue';

export default {
  props: {
    task: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props, { emit }) {
    const form = reactive({
      title: '',
      dueDate: '',
      priority: 'medium',
      project: ''
    });

    // Initialize form with task data if editing
    watch(() => props.task, (task) => {
      if (task.id) {
        form.title = task.title;
        form.dueDate = task.dueDate;
        form.priority = task.priority;
        form.project = task.project;
      } else {
        resetForm();
      }
    }, { immediate: true });

    const resetForm = () => {
      form.title = '';
      form.dueDate = '';
      form.priority = 'medium';
      form.project = '';
    };

    const submit = () => {
      emit('submit', { ...form });
      resetForm();
    };

    return { form, submit };
  }
};
</script>

<style scoped>
form {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

input, select {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

input:focus, select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-cancel, .btn-submit {
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

.btn-cancel:hover {
  background: #f9fafb;
}

.btn-submit {
  background: #4f46e5;
  border: 1px solid #4f46e5;
  color: white;
}

.btn-submit:hover {
  background: #4338ca;
  border-color: #4338ca;
}
</style>