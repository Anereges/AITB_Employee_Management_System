<template>
  <div class="tasks-view">
    <header class="header">
      <h2><i class="fas fa-tasks mr-2"></i>My Tasks</h2>
      <button @click="showAddTask = true" class="btn-primary">
        <i class="fas fa-plus"></i> Add Task
      </button>
    </header>

    <section class="task-list" v-if="tasks.length">
      <transition-group name="list" tag="div" class="task-list-grid">
        <div
          v-for="task in tasks"
          :key="task.id"
          class="task-card"
          :class="[
            `priority-${task.priority}`,
            { completed: task.completed }
          ]"
        >
          <label class="task-checkbox">
            <input type="checkbox" :checked="task.completed" @change="toggleComplete(task)" />
            <span class="checkmark"></span>
          </label>

          <div class="task-details">
            <h3 :class="{ done: task.completed }">{{ task.title }}</h3>
            <p class="description" v-if="task.description">{{ task.description }}</p>
            <div class="task-meta">
              <span><i class="fas fa-calendar-day"></i> {{ formatDate(task.dueDate) }}</span>
              <span><i class="fas fa-flag"></i> {{ capitalize(task.priority) }}</span>
            </div>
          </div>
        </div>
      </transition-group>
    </section>

    <p v-else class="empty-state">No tasks yet. Add one to get started!</p>

    <!-- Add Task Modal -->
    <transition name="fade">
      <div v-if="showAddTask" class="modal" @click.self="closeModal">
        <div class="modal-content" @keydown.escape="closeModal" tabindex="0">
          <header class="modal-header">
            <h3>Add New Task</h3>
            <button class="close-btn" @click="closeModal" aria-label="Close modal">&times;</button>
          </header>

          <form @submit.prevent="addTask" class="task-form">
            <input
              v-model="newTask.title"
              placeholder="Task title"
              required
              maxlength="100"
              autofocus
            />
            <textarea
              v-model="newTask.description"
              placeholder="Description (optional)"
              rows="3"
              maxlength="250"
            ></textarea>

            <div class="form-row">
              <label>
                Priority:
                <select v-model="newTask.priority" required>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>

              <label>
                Due Date:
                <input type="date" v-model="newTask.dueDate" required :min="minDate" />
              </label>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn-primary">Add Task</button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';

const toast = useToast();

const showAddTask = ref(false);
const newTask = ref({
  title: '',
  description: '',
  priority: 'medium',
  dueDate: ''
});

const tasks = ref([]);

const minDate = computed(() => new Date().toISOString().split('T')[0]);

// Replace with your real API base URL
const API_BASE_URL = 'https://your-api-domain.com/api';

async function fetchTasks() {
  try {
    const response = await axios.get(`${API_BASE_URL}/tasks`);
    // Normalize dates if necessary
    tasks.value = response.data.map(task => ({
      ...task,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : null
    }));
  } catch (error) {
    toast.error('Failed to load tasks');
    console.error(error);
  }
}

async function addTask() {
  try {
    const response = await axios.post(`${API_BASE_URL}/tasks`, {
      ...newTask.value,
      completed: false
    });
    tasks.value.push({
      ...response.data,
      dueDate: response.data.dueDate ? response.data.dueDate.split('T')[0] : null
    });
    toast.success('Task added successfully');
    resetForm();
    showAddTask.value = false;
  } catch (error) {
    toast.error('Failed to add task');
    console.error(error);
  }
}

async function toggleComplete(task) {
  try {
    const updatedTask = { ...task, completed: !task.completed };
    await axios.put(`${API_BASE_URL}/tasks/${task.id}`, updatedTask);
    task.completed = !task.completed;
    toast.success(task.completed ? 'Task marked as complete' : 'Task marked as incomplete');
  } catch (error) {
    toast.error('Failed to update task');
    console.error(error);
  }
}

function resetForm() {
  newTask.value = {
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  };
}

function closeModal() {
  showAddTask.value = false;
  resetForm();
}

function formatDate(dateStr) {
  if (!dateStr) return 'No due date';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString(undefined, options);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

onMounted(() => {
  fetchTasks();
});
</script>


<style scoped>
.tasks-view {
  padding: 2rem;
  max-width: 700px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.btn-primary {
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background-color: #4338ca;
}

.btn-secondary {
  background-color: #e0e7ff;
  color: #4f46e5;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-secondary:hover {
  background-color: #c7d2fe;
}

.task-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.task-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 6px 15px rgb(0 0 0 / 0.1);
  padding: 1.2rem 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  border-left: 6px solid transparent;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  cursor: default;
}

.task-card:hover {
  box-shadow: 0 10px 25px rgb(0 0 0 / 0.15);
  transform: translateY(-3px);
}

.task-card.priority-high {
  border-left-color: #ef4444;
}

.task-card.priority-medium {
  border-left-color: #f59e0b;
}

.task-card.priority-low {
  border-left-color: #10b981;
}

.task-card.completed {
  opacity: 0.6;
  text-decoration: line-through;
}

.task-checkbox {
  position: relative;
  cursor: pointer;
  user-select: none;
  margin-top: 6px;
}

.task-checkbox input {
  opacity: 0;
  width: 20px;
  height: 20px;
  position: absolute;
  cursor: pointer;
  margin: 0;
}

.checkmark {
  width: 22px;
  height: 22px;
  background-color: #eee;
  border-radius: 6px;
  display: inline-block;
  transition: background-color 0.3s ease;
  border: 2px solid #ddd;
}

.task-checkbox input:checked + .checkmark {
  background-color: #4f46e5;
  border-color: #4f46e5;
  background-image: url("data:image/svg+xml,%3csvg fill='none' stroke='%23fff' stroke-width='3' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M5 13l4 4L19 7'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: center;
}

.task-details {
  flex-grow: 1;
}

.task-details h3 {
  margin: 0;
  font-weight: 700;
  font-size: 1.1rem;
  color: #222;
  user-select: text;
}

.task-details h3.done {
  color: #6b7280;
  text-decoration: line-through;
}

.description {
  margin: 0.3rem 0 0.8rem 0;
  color: #555;
  font-size: 0.95rem;
  line-height: 1.3;
  user-select: text;
}

.task-meta {
  font-size: 0.85rem;
  color: #777;
  display: flex;
  gap: 1.2rem;
  user-select: text;
}

.task-meta i {
  margin-right: 0.3rem;
  color: #999;
}

/* Modal styles */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem 2.5rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 15px 30px rgb(0 0 0 / 0.2);
  outline: none;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
  color: #999;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #444;
}

.task-form input,
.task-form textarea,
.task-form select {
  width: 100%;
  padding: 0.6rem 0.8rem;
  margin-bottom: 1rem;
  border-radius: 6px;
  border: 1.5px solid #ddd;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  font-family: inherit;
}

.task-form input:focus,
.task-form textarea:focus,
.task-form select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 6px #c7d2fe;
}

.form-row {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.form-row label {
  flex: 1;
  font-weight: 600;
  font-size: 0.9rem;
  color: #444;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Animations */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 480px) {
  .form-row {
    flex-direction: column;
  }
}
</style>
