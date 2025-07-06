<template>
  <div class="reports-view">
    <h2><i class="fas fa-chart-bar mr-2"></i>Admin Reports Dashboard</h2>
    
    <div class="report-filters">
      <div class="filter-group">
        <label>Report Type:</label>
        <select v-model="reportType">
          <option value="team">Team Performance</option>
          <option value="department">Department Analysis</option>
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
          <option value="year">This Year</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>
      
      <div v-if="timePeriod === 'custom'" class="filter-group">
        <label>Date Range:</label>
        <div class="date-range">
          <input type="date" v-model="startDate">
          <span class="mx-2">to</span>
          <input type="date" v-model="endDate">
        </div>
      </div>
      
      <div class="filter-group" v-if="reportType === 'team' || reportType === 'department'">
        <label>Filter By:</label>
        <select v-model="selectedFilter">
          <option value="all">All Teams/Departments</option>
          <option v-for="option in filterOptions" :value="option.id">{{ option.name }}</option>
        </select>
      </div>
      
      <button @click="generateReport" class="generate-btn" :disabled="loading">
        <i class="fas fa-sync-alt mr-2"></i>
        {{ loading ? 'Generating...' : 'Generate Report' }}
      </button>
      
      <button @click="exportReport" class="export-btn" :disabled="loading || !reportGenerated">
        <i class="fas fa-file-export mr-2"></i>
        Export
      </button>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
    
    <div v-if="loading && !error" class="loading-message">Loading report data...</div>
    
    <div v-if="!loading && !error && reportGenerated" class="report-container">
      <div class="chart-container">
        <h3>{{ reportTitle }}</h3>
        <div class="chart-placeholder">
          <!-- Replace with your chart component -->
          <i class="fas fa-chart-pie text-5xl text-gray-300"></i>
          <p>Chart visualization would appear here</p>
        </div>
        
        <div v-if="reportType === 'team' || reportType === 'department'" class="comparison-chart">
          <h4>Comparison</h4>
          <div class="chart-placeholder">
            <i class="fas fa-chart-bar text-5xl text-gray-300"></i>
            <p>Comparison chart would appear here</p>
          </div>
        </div>
      </div>
      
      <div class="report-data">
        <h3>Summary</h3>
        <div class="data-grid">
          <div class="data-card">
            <h4>Total Tasks Completed</h4>
            <p class="text-3xl font-bold">{{ reportData.tasksCompleted }}</p>
            <span :class="reportData.tasksChange >= 0 ? 'text-green-500' : 'text-red-500'" class="text-sm">
              {{ Math.abs(reportData.tasksChange) }}% {{ reportData.tasksChange >= 0 ? 'increase' : 'decrease' }}
            </span>
          </div>
          
          <div class="data-card">
            <h4>Total Hours Logged</h4>
            <p class="text-3xl font-bold">{{ reportData.hoursLogged }}</p>
            <span :class="reportData.hoursChange >= 0 ? 'text-green-500' : 'text-red-500'" class="text-sm">
              {{ Math.abs(reportData.hoursChange) }}% {{ reportData.hoursChange >= 0 ? 'increase' : 'decrease' }}
            </span>
          </div>
          
          <div class="data-card">
            <h4>Average Productivity</h4>
            <p class="text-3xl font-bold">{{ reportData.productivityScore }}</p>
            <span :class="reportData.productivityChange >= 0 ? 'text-green-500' : 'text-red-500'" class="text-sm">
              {{ Math.abs(reportData.productivityChange) }}% {{ reportData.productivityChange >= 0 ? 'increase' : 'decrease' }}
            </span>
          </div>
          
          <div v-if="reportType === 'team' || reportType === 'department'" class="data-card">
            <h4>Participation Rate</h4>
            <p class="text-3xl font-bold">{{ reportData.participationRate }}%</p>
            <span :class="reportData.participationChange >= 0 ? 'text-green-500' : 'text-red-500'" class="text-sm">
              {{ Math.abs(reportData.participationChange) }}% {{ reportData.participationChange >= 0 ? 'increase' : 'decrease' }}
            </span>
          </div>
        </div>
        
        <div class="data-table">
          <h3>Detailed Breakdown</h3>
          <div class="table-controls">
            <div class="table-search">
              <i class="fas fa-search"></i>
              <input type="text" v-model="searchQuery" placeholder="Search...">
            </div>
            <div class="table-pagination">
              <span>Rows per page:</span>
              <select v-model="rowsPerPage">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th v-for="header in tableHeaders" :key="header.key" @click="sortTable(header.key)">
                  {{ header.label }}
                  <i v-if="sortKey === header.key" 
                     :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in paginatedTableData" :key="row.id">
                <td>{{ row.date || row.team || row.department }}</td>
                <td>{{ row.tasks }}</td>
                <td>{{ row.hours }}</td>
                <td>{{ row.score }}</td>
                <td>{{ row.members || '-' }}</td>
                <td>
                  <span class="status" :class="row.status">{{ row.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="pagination-footer">
            <span>Showing {{ currentPageFirstItem }} to {{ currentPageLastItem }} of {{ filteredTableData.length }} entries</span>
            <div class="pagination-buttons">
              <button @click="prevPage" :disabled="currentPage === 1">
                <i class="fas fa-chevron-left"></i>
              </button>
              <span>Page {{ currentPage }} of {{ totalPages }}</span>
              <button @click="nextPage" :disabled="currentPage === totalPages">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const reportType = ref('team');
const timePeriod = ref('month');
const startDate = ref('');
const endDate = ref('');
const selectedFilter = ref('all');
const filterOptions = ref([]);

const reportData = ref({
  tasksCompleted: 0,
  tasksChange: 0,
  hoursLogged: 0,
  hoursChange: 0,
  productivityScore: 0,
  productivityChange: 0,
  participationRate: 0,
  participationChange: 0
});

const tableHeaders = computed(() => {
  const baseHeaders = [
    { key: 'date', label: 'Date' },
    { key: 'tasks', label: 'Tasks Completed' },
    { key: 'hours', label: 'Hours Worked' },
    { key: 'score', label: 'Score' },
    { key: 'status', label: 'Status' }
  ];
  
  if (reportType.value === 'team') {
    return [
      { key: 'team', label: 'Team' },
      ...baseHeaders.slice(1),
      { key: 'members', label: 'Members' }
    ];
  } else if (reportType.value === 'department') {
    return [
      { key: 'department', label: 'Department' },
      ...baseHeaders.slice(1),
      { key: 'members', label: 'Members' }
    ];
  }
  return baseHeaders;
});

const tableData = ref([]);
const loading = ref(false);
const error = ref(null);
const reportGenerated = ref(false);

// Table controls
const searchQuery = ref('');
const sortKey = ref('date');
const sortOrder = ref('asc');
const currentPage = ref(1);
const rowsPerPage = ref(10);

// Fetch filter options on mount
onMounted(async () => {
  try {
    const teamsRes = await axios.get('/api/admin/teams');
    const deptsRes = await axios.get('/api/admin/departments');
    
    filterOptions.value = [
      ...teamsRes.data.map(t => ({ id: `team_${t.id}`, name: t.name })),
      ...deptsRes.data.map(d => ({ id: `dept_${d.id}`, name: d.name }))
    ];
  } catch (err) {
    console.error('Error fetching filter options:', err);
  }
});

const reportTitle = computed(() => {
  const typeMap = {
    team: 'Team Performance',
    department: 'Department Analysis',
    tasks: 'Task Completion',
    hours: 'Work Hours',
    productivity: 'Productivity'
  };
  
  const periodMap = {
    week: 'Weekly',
    month: 'Monthly',
    quarter: 'Quarterly',
    year: 'Annual',
    custom: 'Custom Date Range'
  };
  
  let filterName = 'All';
  if (selectedFilter.value !== 'all') {
    const option = filterOptions.value.find(o => o.id === selectedFilter.value);
    filterName = option ? option.name : '';
  }
  
  return `${periodMap[timePeriod.value]} ${typeMap[reportType.value]} Report${filterName ? ` - ${filterName}` : ''}`;
});

const generateReport = async () => {
  loading.value = true;
  error.value = null;
  reportGenerated.value = false;

  try {
    const params = {
      type: reportType.value,
      period: timePeriod.value,
      filter: selectedFilter.value
    };
    
    if (timePeriod.value === 'custom') {
      if (!startDate.value || !endDate.value) {
        throw new Error('Please select both start and end dates');
      }
      params.start_date = startDate.value;
      params.end_date = endDate.value;
    }
    
    const response = await axios.get('/api/admin/reports', { params });
    const data = response.data.data;

    reportData.value = {
      tasksCompleted: data.total_tasks,
      tasksChange: data.tasks_change,
      hoursLogged: data.total_hours,
      hoursChange: data.hours_change,
      productivityScore: data.avg_productivity,
      productivityChange: data.productivity_change,
      participationRate: data.participation_rate || 0,
      participationChange: data.participation_change || 0
    };

    tableData.value = data.details.map((item, index) => ({
      id: index,
      date: item.date || null,
      team: item.team || null,
      department: item.department || null,
      tasks: item.tasks_completed,
      hours: item.hours_worked,
      score: item.productivity_score,
      status: item.status,
      members: item.member_count || null
    }));

    reportGenerated.value = true;
    currentPage.value = 1;
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Failed to load report data';
  } finally {
    loading.value = false;
  }
};

const exportReport = () => {
  // Implement export functionality (CSV, PDF, etc.)
  console.log('Exporting report:', reportTitle.value);
  // This would typically call an API endpoint to generate a downloadable file
};

// Table filtering, sorting and pagination
const filteredTableData = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return tableData.value.filter(row => {
    return Object.values(row).some(
      val => String(val).toLowerCase().includes(query)
    );
  });
});

const sortedTableData = computed(() => {
  return [...filteredTableData.value].sort((a, b) => {
    let modifier = 1;
    if (sortOrder.value === 'desc') modifier = -1;
    
    if (a[sortKey.value] < b[sortKey.value]) return -1 * modifier;
    if (a[sortKey.value] > b[sortKey.value]) return 1 * modifier;
    return 0;
  });
});

const paginatedTableData = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return sortedTableData.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredTableData.value.length / rowsPerPage.value);
});

const currentPageFirstItem = computed(() => {
  return (currentPage.value - 1) * rowsPerPage.value + 1;
});

const currentPageLastItem = computed(() => {
  const end = currentPage.value * rowsPerPage.value;
  return end > filteredTableData.value.length ? filteredTableData.value.length : end;
});

const sortTable = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};
</script>

<style scoped>
.reports-view {
  padding: 1.5rem;
}

.report-filters {
  display: flex;
  flex-wrap: wrap;
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
  min-width: 200px;
}

.filter-group label {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.filter-group select, 
.filter-group input[type="date"] {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
}

.date-range {
  display: flex;
  align-items: center;
}

.generate-btn, .export-btn {
  padding: 0.75rem 1.5rem;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-right: 0.5rem;
}

.generate-btn {
  background: #4a90e2;
}

.generate-btn:hover {
  background: #3a7bc8;
}

.export-btn {
  background: #10b981;
}

.export-btn:hover {
  background: #0d9f6e;
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

.comparison-chart {
  margin-top: 2rem;
}

.comparison-chart h4 {
  color: #666;
  font-size: 1rem;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

.table-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.table-search {
  display: flex;
  align-items: center;
  background: white;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.table-search input {
  border: none;
  outline: none;
  margin-left: 0.5rem;
}

.table-pagination {
  display: flex;
  align-items: center;
}

.table-pagination select {
  margin-left: 0.5rem;
  padding: 0.25rem;
  border: 1px solid #ddd;
  border-radius: 4px;
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
  cursor: pointer;
}

th i {
  margin-left: 0.25rem;
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
.status.poor { background: #fee2e2; color: #dc2626; }

.pagination-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #666;
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-buttons button {
  background: #f8fafc;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
}

.pagination-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  color: #dc2626;
  background: #fee2e2;
  padding: 1rem;
  border-radius: 6px;
  margin: 1rem 0;
}

.loading-message {
  color: #666;
  padding: 1rem;
  text-align: center;
}
</style>