<template>
  <div class="reports-view">
    <h2><i class="fas fa-chart-bar mr-2"></i>Reports</h2>
    
    <div class="report-filters">
      <div class="filter-group">
        <label>Report Type:</label>
        <select v-model="reportType">
          <option value="tasks">Task Completion</option>
          <option value="hours">Work Hours</option>
          <option value="productivity">Productivity</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Time Period:</label>
        <select v-model="timePeriod">
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
        </select>
      </div>
      
      <button @click="generateReport" class="generate-btn" :disabled="loading">
        <i class="fas fa-sync-alt mr-2"></i>
        {{ loading ? 'Generating...' : 'Generate Report' }}
      </button>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
    
    <div v-if="loading && !error" class="loading-message">Loading report data...</div>
    
    <div v-if="!loading && !error" class="report-container">
      <div class="chart-container">
        <h3>{{ reportTitle }}</h3>
        <div class="chart-placeholder">
          <!-- Replace with your chart component -->
          <i class="fas fa-chart-pie text-5xl text-gray-300"></i>
          <p>Chart visualization would appear here</p>
        </div>
      </div>
      
      <div class="report-data">
        <h3>Summary</h3>
        <div class="data-grid">
          <div class="data-card">
            <h4>Tasks Completed</h4>
            <p class="text-3xl font-bold">{{ reportData.tasksCompleted }}</p>
            <span :class="reportData.tasksChange >= 0 ? 'text-green-500' : 'text-red-500'" class="text-sm">
              {{ Math.abs(reportData.tasksChange) }}% {{ reportData.tasksChange >= 0 ? 'increase' : 'decrease' }}
            </span>
          </div>
          
          <div class="data-card">
            <h4>Hours Logged</h4>
            <p class="text-3xl font-bold">{{ reportData.hoursLogged }}</p>
            <span :class="reportData.hoursChange >= 0 ? 'text-green-500' : 'text-red-500'" class="text-sm">
              {{ Math.abs(reportData.hoursChange) }}% {{ reportData.hoursChange >= 0 ? 'increase' : 'decrease' }}
            </span>
          </div>
          
          <div class="data-card">
            <h4>Productivity</h4>
            <p class="text-3xl font-bold">{{ reportData.productivityScore }}</p>
            <span :class="reportData.productivityChange >= 0 ? 'text-green-500' : 'text-red-500'" class="text-sm">
              {{ Math.abs(reportData.productivityChange) }}% {{ reportData.productivityChange >= 0 ? 'increase' : 'decrease' }}
            </span>
          </div>
        </div>
        
        <div class="data-table">
          <h3>Detailed Breakdown</h3>
          <table>
            <thead>
              <tr>
                <th v-for="header in tableHeaders" :key="header">{{ header }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in tableData" :key="row.id">
                <td>{{ row.date }}</td>
                <td>{{ row.tasks }}</td>
                <td>{{ row.hours }}</td>
                <td>{{ row.score }}</td>
                <td>
                  <span class="status" :class="row.status">{{ row.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';

const reportType = ref('tasks');
const timePeriod = ref('week');

const reportData = ref({
  tasksCompleted: 0,
  tasksChange: 0,
  hoursLogged: 0,
  hoursChange: 0,
  productivityScore: 0,
  productivityChange: 0
});

const tableHeaders = ref(['Date', 'Tasks Completed', 'Hours Worked', 'Score', 'Status']);
const tableData = ref([]);

const loading = ref(false);
const error = ref(null);

const reportTitle = computed(() => {
  const typeMap = {
    tasks: 'Task Completion',
    hours: 'Work Hours',
    productivity: 'Productivity'
  };
  const periodMap = {
    week: 'Weekly',
    month: 'Monthly',
    quarter: 'Quarterly'
  };
  return `${periodMap[timePeriod.value]} ${typeMap[reportType.value]} Report`;
});

const generateReport = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Example API endpoint - adjust to your backend
    const response = await axios.get('/api/reports', {
      params: {
        type: reportType.value,
        period: timePeriod.value
      }
    });

    const data = response.data.data;

    // Update reportData and tableData with real data from backend
    reportData.value = {
      tasksCompleted: data.tasksCompleted,
      tasksChange: data.tasksChange,
      hoursLogged: data.hoursLogged,
      hoursChange: data.hoursChange,
      productivityScore: data.productivityScore,
      productivityChange: data.productivityChange
    };

    tableData.value = data.detailedBreakdown.map((item, index) => ({
      id: index,
      date: item.date,
      tasks: item.tasks,
      hours: item.hours,
      score: item.score,
      status: item.status
    }));

  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load report data';
  } finally {
    loading.value = false;
  }
};
</script>

  
  <style scoped>
  .reports-view {
    padding: 1.5rem;
  }
  
  .report-filters {
    display: flex;
    gap: 1.5rem;
    align-items: flex-end;
    margin: 2rem 0;
    padding: 1.5rem;
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }
  
  .filter-group {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  
  .filter-group label {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #666;
  }
  
  .filter-group select {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: white;
  }
  
  .generate-btn {
    padding: 0.75rem 1.5rem;
    background: #4a90e2;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
  }
  
  .generate-btn:hover {
    background: #3a7bc8;
  }
  
  .report-container {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 1.5rem;
  }
  
  .chart-container, .report-data {
    background: white;
    border-radius: 10px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }
  
  .chart-placeholder {
    height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #999;
    border: 2px dashed #eee;
    margin-top: 1rem;
  }
  
  .data-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin: 1.5rem 0;
  }
  
  .data-card {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
  }
  
  .data-card h4 {
    margin: 0 0 0.5rem 0;
    color: #666;
    font-size: 0.9rem;
  }
  
  .data-table {
    margin-top: 2rem;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    background: #f8fafc;
    color: #666;
    font-weight: 500;
  }
  
  .status {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    text-transform: capitalize;
  }
  
  .status.excellent { background: #dcfce7; color: #16a34a; }
  .status.good { background: #dbeafe; color: #2563eb; }
  .status.average { background: #fef3c7; color: #d97706; }
  </style>