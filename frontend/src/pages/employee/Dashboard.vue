<template>
  <div class="dashboard-view">
    <div class="dashboard-header">
      <h1 class="greeting">Good {{ timeOfDay }}, {{ userName }}!</h1>
      <div class="date-display">
        <i class="fas fa-calendar-day"></i>
        {{ currentDate }}
      </div>
    </div>

    <!-- Stats Cards with Animation -->
    <div class="stats-grid">
      <transition-group name="fade" appear>
        <div class="stat-card" v-for="stat in stats" :key="stat.title" :class="stat.trend">
          <div class="stat-icon" :style="{ backgroundColor: stat.color }">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stat.title }}</h3>
            <p class="stat-value">{{ stat.value }}</p>
            <div class="stat-trend">
              <i :class="stat.trendIcon"></i>
              <span>{{ stat.change }}% {{ stat.trendText }}</span>
            </div>
          </div>
          <div class="stat-sparkline">
            <sparkline :data="stat.history" :color="stat.color"></sparkline>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- Main Dashboard Content -->
    <div class="dashboard-content">
      <!-- Tasks Section -->
      <div class="dashboard-section tasks-section">
        <div class="section-header">
          <h2><i class="fas fa-tasks"></i> My Tasks</h2>
          <button class="add-btn" @click="openTaskModal">
            <i class="fas fa-plus"></i> Add Task
          </button>
        </div>
        
        <div class="task-tabs">
          <button 
            v-for="tab in taskTabs" 
            :key="tab" 
            :class="{ active: activeTaskTab === tab }"
            @click="activeTaskTab = tab"
          >
            {{ tab }}
          </button>
        </div>
        
        <div class="task-list-container">
          <div v-if="filteredTasks.length" class="task-list">
            <task-item 
              v-for="task in filteredTasks" 
              :key="task.id" 
              :task="task"
              @complete="completeTask"
              @edit="editTask"
            />
          </div>
          <div v-else class="empty-state">
            <i class="fas fa-check-circle"></i>
            <p>No {{ activeTaskTab.toLowerCase() }} tasks</p>
          </div>
        </div>
      </div>

      <!-- Right Sidebar -->
      <div class="dashboard-sidebar">
        <!-- Upcoming Events -->
        <div class="sidebar-section">
          <h2><i class="fas fa-calendar-alt"></i> Upcoming Events</h2>
          <div class="event-list">
            <div v-for="event in upcomingEvents" :key="event.id" class="event-item">
              <div class="event-date">
                <span class="event-day">{{ event.day }}</span>
                <span class="event-month">{{ event.month }}</span>
              </div>
              <div class="event-details">
                <h3>{{ event.title }}</h3>
                <p>
                  <i class="fas fa-clock"></i> {{ event.time }} 
                  <i class="fas fa-map-marker-alt"></i> {{ event.location }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Team Activity -->
        <div class="sidebar-section">
          <h2><i class="fas fa-users"></i> Team Activity</h2>
          <div class="activity-feed">
            <div v-for="activity in teamActivities" :key="activity.id" class="activity-item">
              <avatar :src="activity.avatar" :name="activity.name" size="sm"></avatar>
              <div class="activity-content">
                <p>
                  <strong>{{ activity.name }}</strong> {{ activity.action }}
                  <span class="activity-time">{{ activity.time }}</span>
                </p>
                <div v-if="activity.task" class="activity-task">
                  {{ activity.task }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Productivity Chart -->
    <div class="dashboard-section chart-section">
      <h2><i class="fas fa-chart-line"></i> Weekly Productivity</h2>
      <div class="chart-container">
        <productivity-chart :data="productivityData"></productivity-chart>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <button class="quick-action" @click="quickAction('timeOff')">
        <i class="fas fa-umbrella-beach"></i>
        <span>Request Time Off</span>
      </button>
      <button class="quick-action" @click="quickAction('report')">
        <i class="fas fa-file-alt"></i>
        <span>Submit Report</span>
      </button>
      <button class="quick-action" @click="quickAction('feedback')">
        <i class="fas fa-comment-dots"></i>
        <span>Give Feedback</span>
      </button>
    </div>

    <!-- Task Modal -->
    <modal v-if="showTaskModal" @close="closeTaskModal">
      <task-form 
        :task="editingTask" 
        @submit="handleTaskSubmit"
      />
    </modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import Sparkline from '@/components/chart/Sparkline.vue';
import ProductivityChart from '@/components/chart/ProductivityChart.vue';
import TaskItem from '@/components/TaskItem.vue';
import Avatar from '@/components/Avatar.vue';
import Modal from '@/components/Modal.vue';
import TaskForm from '@/components/TaskForm.vue';

const userStore = useUserStore();
const userName = computed(() => userStore.name);
const timeOfDay = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
});

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
});

// Stats data
const stats = ref([
  {
    title: 'Pending Tasks',
    value: 8,
    change: 12,
    trend: 'up',
    trendText: 'increase',
    trendIcon: 'fas fa-arrow-up',
    color: '#3b82f6',
    icon: 'fas fa-tasks',
    history: [5, 6, 7, 8, 7, 8, 9]
  },
  {
    title: 'Completed',
    value: 15,
    change: 8,
    trend: 'up',
    trendText: 'increase',
    trendIcon: 'fas fa-arrow-up',
    color: '#10b981',
    icon: 'fas fa-check-circle',
    history: [10, 12, 11, 13, 14, 15, 15]
  },
  {
    title: 'Overdue',
    value: 2,
    change: 33,
    trend: 'down',
    trendText: 'decrease',
    trendIcon: 'fas fa-arrow-down',
    color: '#ef4444',
    icon: 'fas fa-exclamation-triangle',
    history: [4, 3, 3, 2, 3, 2, 2]
  },
  {
    title: 'Productivity',
    value: '87%',
    change: 5,
    trend: 'up',
    trendText: 'improvement',
    trendIcon: 'fas fa-arrow-up',
    color: '#8b5cf6',
    icon: 'fas fa-chart-line',
    history: [80, 82, 85, 83, 86, 87, 87]
  }
]);

// Tasks
const taskTabs = ['All', 'Pending', 'Completed', 'Overdue'];
const activeTaskTab = ref('All');
const tasks = ref([]);
const editingTask = ref(null);

// Filter tasks based on active tab
const filteredTasks = computed(() => {
  if (activeTaskTab.value === 'All') return tasks.value;
  if (activeTaskTab.value === 'Pending') return tasks.value.filter(t => !t.completed && !t.overdue);
  if (activeTaskTab.value === 'Completed') return tasks.value.filter(t => t.completed);
  if (activeTaskTab.value === 'Overdue') return tasks.value.filter(t => t.overdue);
  return [];
});

// Events and activities
const upcomingEvents = ref([]);
const teamActivities = ref([]);
const productivityData = ref([]);

// Modal control
const showTaskModal = ref(false);

// API calls
const loading = ref(false);
const error = ref(null);

async function fetchDashboardData() {
  loading.value = true;
  error.value = null;
  
  try {
    // In a real app, these would be API calls
    // Simulating API responses with timeouts
    await Promise.all([
      fetchTasks(),
      fetchEvents(),
      fetchActivities(),
      fetchProductivityData()
    ]);
  } catch (err) {
    error.value = err.message || 'Failed to load dashboard data';
  } finally {
    loading.value = false;
  }
}

async function fetchTasks() {
  // Simulated API call
  await new Promise(resolve => setTimeout(resolve, 500));
  tasks.value = [
    {
      id: 1,
      title: 'Complete project proposal',
      dueDate: 'Today',
      priority: 'high',
      completed: false,
      overdue: false,
      project: 'Website Redesign'
    },
    {
      id: 2,
      title: 'Review teammate\'s code',
      dueDate: 'Tomorrow',
      priority: 'medium',
      completed: false,
      overdue: false,
      project: 'API Development'
    },
    {
      id: 3,
      title: 'Submit monthly report',
      dueDate: 'Yesterday',
      priority: 'high',
      completed: false,
      overdue: true,
      project: 'Operations'
    },
    {
      id: 4,
      title: 'Team meeting preparation',
      dueDate: 'Completed',
      priority: 'low',
      completed: true,
      overdue: false,
      project: 'General'
    }
  ];
}

async function fetchEvents() {
  // Simulated API call
  await new Promise(resolve => setTimeout(resolve, 500));
  upcomingEvents.value = [
    {
      id: 1,
      title: 'Team Standup',
      day: '12',
      month: 'Jun',
      time: '10:00 AM',
      location: 'Conference Room A'
    },
    {
      id: 2,
      title: 'Client Meeting',
      day: '14',
      month: 'Jun',
      time: '2:00 PM',
      location: 'Zoom'
    },
    {
      id: 3,
      title: 'Project Deadline',
      day: '18',
      month: 'Jun',
      time: 'All day',
      location: ''
    }
  ];
}

async function fetchActivities() {
  // Simulated API call
  await new Promise(resolve => setTimeout(resolve, 500));
  teamActivities.value = [
    {
      id: 1,
      name: 'Alex Johnson',
      avatar: 'https://i.pravatar.cc/150?img=5',
      action: 'completed the user dashboard design',
      time: '2 hours ago',
      task: 'Dashboard UI Design'
    },
    {
      id: 2,
      name: 'Maria Garcia',
      avatar: 'https://i.pravatar.cc/150?img=11',
      action: 'commented on your task',
      time: '4 hours ago',
      task: 'API Documentation'
    },
    {
      id: 3,
      name: 'James Smith',
      avatar: 'https://i.pravatar.cc/150?img=8',
      action: 'assigned you a new task',
      time: '1 day ago',
      task: 'Bug Fixes'
    }
  ];
}

async function fetchProductivityData() {
  // Simulated API call
  await new Promise(resolve => setTimeout(resolve, 500));
  productivityData.value = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    data: [75, 82, 80, 87, 85]
  };
}

// Task methods
function completeTask(taskId) {
  const task = tasks.value.find(t => t.id === taskId);
  if (task) {
    task.completed = true;
    task.overdue = false;
  }
}

function editTask(task) {
  editingTask.value = { ...task };
  showTaskModal.value = true;
}

function openTaskModal() {
  editingTask.value = null;
  showTaskModal.value = true;
}

function closeTaskModal() {
  showTaskModal.value = false;
  editingTask.value = null;
}

function handleTaskSubmit(taskData) {
  if (taskData.id) {
    // Update existing task
    const index = tasks.value.findIndex(t => t.id === taskData.id);
    if (index !== -1) {
      tasks.value[index] = taskData;
    }
  } else {
    // Add new task
    tasks.value.push({
      ...taskData,
      id: Math.max(...tasks.value.map(t => t.id), 0) + 1,
      completed: false,
      overdue: false
    });
  }
  closeTaskModal();
}

// Quick actions
function quickAction(action) {
  // Implement quick action functionality
  console.log('Quick action:', action);
}

onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
.dashboard-view {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.greeting {
  font-size: 1.75rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.date-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 1rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  display: flex;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.25rem;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
  font-weight: 500;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0.25rem 0;
  color: #111827;
}

.stat-trend {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  gap: 0.25rem;
}

.stat-trend.up {
  color: #10b981;
}

.stat-trend.down {
  color: #ef4444;
}

.stat-sparkline {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: 80px;
  height: 40px;
  opacity: 0.7;
}

/* Dashboard Content Layout */
.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* Tasks Section */
.tasks-section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-btn {
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.add-btn:hover {
  background: #4338ca;
}

.task-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1rem;
}

.task-tabs button {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  color: #6b7280;
}

.task-tabs button.active {
  color: #4f46e5;
  font-weight: 500;
}

.task-tabs button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #4f46e5;
}

.task-list-container {
  min-height: 300px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #9ca3af;
}

.empty-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

/* Sidebar Sections */
.dashboard-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.sidebar-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Events List */
.event-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.event-item:last-child {
  border-bottom: none;
}

.event-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 50px;
  flex-shrink: 0;
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 0.5rem;
}

.event-day {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.event-month {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #6b7280;
}

.event-details {
  flex: 1;
}

.event-details h3 {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #111827;
}

.event-details p {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.event-details i {
  opacity: 0.7;
}

/* Activity Feed */
.activity-feed {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.activity-content {
  flex: 1;
}

.activity-content p {
  font-size: 0.8125rem;
  margin: 0 0 0.25rem 0;
  color: #4b5563;
}

.activity-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.activity-task {
  font-size: 0.75rem;
  background: #f9fafb;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  color: #4b5563;
}

/* Productivity Chart Section */
.chart-section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
}

.chart-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-container {
  height: 250px;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.quick-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: none;
  border-radius: 0.75rem;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.quick-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.quick-action i {
  font-size: 1.5rem;
  color: #4f46e5;
}

.quick-action span {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .quick-actions {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-action {
    padding: 0.75rem 1rem;
  }
}
</style>