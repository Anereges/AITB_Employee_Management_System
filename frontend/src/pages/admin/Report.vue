<template>
  <div class="admin-reports-view">
    <div class="header-section">
      <h2><i class="fas fa-tachometer-alt mr-2"></i>Admin Dashboard</h2>
      <div class="time-display">
        <i class="far fa-clock mr-2"></i>
        {{ currentDateTime }}
      </div>
    </div>
    
    <!-- Quick Stats Overview -->
    <div class="quick-stats">
      <div class="stat-card" v-for="stat in quickStats" :key="stat.title">
        <div class="stat-icon" :class="stat.bgColor">
          <i :class="stat.icon"></i>
        </div>
        <div class="stat-content">
          <h4>{{ stat.title }}</h4>
          <p class="text-2xl font-bold">{{ stat.value }}</p>
          <span :class="stat.change >= 0 ? 'text-green-500' : 'text-red-500'" class="text-sm">
            {{ Math.abs(stat.change) }}% {{ stat.change >= 0 ? 'increase' : 'decrease' }} from last period
          </span>
        </div>
      </div>
    </div>
    
    <!-- Main Report Section -->
    <div class="report-section">
      <div class="report-controls">
        <div class="control-group">
          <label>Report Type:</label>
          <select v-model="reportType" class="custom-select">
            <option value="overview">Overview</option>
            <option value="performance">Performance Analytics</option>
            <option value="productivity">Productivity</option>
            <option value="attendance">Attendance</option>
            <option value="projects">Projects</option>
          </select>
        </div>
        
        <div class="control-group">
          <label>Time Range:</label>
          <select v-model="timeRange" class="custom-select">
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        
        <div class="control-group" v-if="timeRange === 'custom'">
          <label>Date Range:</label>
          <div class="date-range-picker">
            <datepicker v-model="startDate" :max-date="endDate || new Date()"></datepicker>
            <span class="mx-2">to</span>
            <datepicker v-model="endDate" :min-date="startDate" :max-date="new Date()"></datepicker>
          </div>
        </div>
        
        <div class="control-group" v-if="reportType !== 'overview'">
          <label>Filter By:</label>
          <multiselect
            v-model="selectedFilters"
            :options="filterOptions"
            :multiple="true"
            :close-on-select="false"
            placeholder="Select departments/teams"
            label="name"
            track-by="id"
          ></multiselect>
        </div>
        
        <button @click="generateReport" class="generate-btn" :disabled="loading">
          <i class="fas fa-sync-alt mr-2" :class="{ 'fa-spin': loading }"></i>
          {{ loading ? 'Generating...' : 'Generate Report' }}
        </button>
        
        <div class="export-options">
          <button @click="exportPDF" class="export-btn" :disabled="!reportGenerated">
            <i class="fas fa-file-pdf mr-2"></i> PDF
          </button>
          <button @click="exportExcel" class="export-btn" :disabled="!reportGenerated">
            <i class="fas fa-file-excel mr-2"></i> Excel
          </button>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Compiling dashboard data...</p>
      </div>
      
      <!-- Error State -->
      <div v-if="error" class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button @click="generateReport" class="retry-btn">Retry</button>
      </div>
      
      <!-- Report Content -->
      <div v-if="!loading && !error && reportGenerated" class="report-content">
        <!-- Overview Dashboard -->
        <div v-if="reportType === 'overview'" class="overview-dashboard">
          <div class="grid-row">
            <div class="grid-col">
              <div class="chart-container">
                <h3>Productivity Trends</h3>
                <line-chart :chart-data="productivityChartData" :options="chartOptions"></line-chart>
              </div>
            </div>
            <div class="grid-col">
              <div class="chart-container">
                <h3>Department Distribution</h3>
                <pie-chart :chart-data="departmentChartData" :options="chartOptions"></pie-chart>
              </div>
            </div>
          </div>
          
          <div class="grid-row">
            <div class="grid-col">
              <div class="chart-container">
                <h3>Attendance Overview</h3>
                <bar-chart :chart-data="attendanceChartData" :options="chartOptions"></bar-chart>
              </div>
            </div>
            <div class="grid-col">
              <div class="data-card">
                <h3>Top Performers</h3>
                <div class="top-performers">
                  <div v-for="(performer, index) in topPerformers" :key="performer.id" class="performer">
                    <span class="rank">{{ index + 1 }}</span>
                    <div class="avatar">
                      <img :src="performer.avatar || defaultAvatar" :alt="performer.name">
                    </div>
                    <div class="details">
                      <p class="name">{{ performer.name }}</p>
                      <p class="role">{{ performer.role }}</p>
                    </div>
                    <div class="score">
                      <span class="badge" :class="getScoreClass(performer.score)">
                        {{ performer.score }}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Detailed Reports -->
        <div v-else class="detailed-report">
          <div class="report-header">
            <h3>{{ reportTitle }}</h3>
            <div class="report-summary">
              <div v-for="metric in reportMetrics" :key="metric.label" class="metric">
                <span class="label">{{ metric.label }}:</span>
                <span class="value">{{ metric.value }}</span>
                <span class="change" :class="metric.change >= 0 ? 'positive' : 'negative'">
                  <i :class="metric.change >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                  {{ Math.abs(metric.change) }}%
                </span>
              </div>
            </div>
          </div>
          
          <div class="chart-area">
            <div class="main-chart">
              <line-chart v-if="mainChartType === 'line'" :chart-data="mainChartData" :options="detailedChartOptions"></line-chart>
              <bar-chart v-else-if="mainChartType === 'bar'" :chart-data="mainChartData" :options="detailedChartOptions"></bar-chart>
            </div>
            <div class="chart-filters">
              <button v-for="filter in chartFilters" 
                      :key="filter.value" 
                      @click="setChartFilter(filter.value)"
                      :class="{ active: activeChartFilter === filter.value }">
                {{ filter.label }}
              </button>
            </div>
          </div>
          
          <div class="data-table-section">
            <div class="table-header">
              <h4>Detailed Data</h4>
              <div class="table-actions">
                <input type="text" v-model="tableSearch" placeholder="Search data..." class="search-input">
                <select v-model="tablePageSize" class="page-size-select">
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                </select>
              </div>
            </div>
            
            <div class="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th v-for="column in tableColumns" 
                        :key="column.key"
                        @click="sortTable(column.key)"
                        :class="{ sortable: column.sortable, active: sortField === column.key }">
                      {{ column.label }}
                      <i v-if="sortField === column.key" 
                         :class="sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in paginatedTableData" :key="item.id">
                    <td v-for="column in tableColumns" :key="column.key">
                      <template v-if="column.key === 'status'">
                        <span class="status-badge" :class="item[column.key]">{{ item[column.key] }}</span>
                      </template>
                      <template v-else-if="column.key === 'performance'">
                        <div class="performance-bar">
                          <div class="bar" :style="{ width: item[column.key] + '%' }"></div>
                          <span>{{ item[column.key] }}%</span>
                        </div>
                      </template>
                      <template v-else>
                        {{ item[column.key] }}
                      </template>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="table-footer">
              <div class="pagination-info">
                Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} entries
              </div>
              <div class="pagination-controls">
                <button @click="prevPage" :disabled="pagination.currentPage === 1">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <span>Page {{ pagination.currentPage }} of {{ pagination.lastPage }}</span>
                <button @click="nextPage" :disabled="pagination.currentPage === pagination.lastPage">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import Datepicker from 'vue3-datepicker';
import Multiselect from 'vue-multiselect';
import LineChart from '@/components/chart/LineChart.vue';
import BarChart from '@/components/chart/BarChart.vue';
import PieChart from '@/components/chart/PieChart.vue';

export default {
  components: {
    Datepicker,
    Multiselect,
    LineChart,
    BarChart,
    PieChart
  },
  setup() {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const defaultAvatar = 'https://i.pravatar.cc/150?img=0';

    // Current date and times
    const currentDateTime = ref('');
    
    // Update current time every minute
    const updateDateTime = () => {
      const now = new Date();
      currentDateTime.value = now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    // Quick stats data
    const quickStats = ref([
      { 
        title: 'Total Employees', 
        value: 0, 
        change: 0, 
        icon: 'fas fa-users',
        bgColor: 'bg-blue-100'
      },
      { 
        title: 'Active Projects', 
        value: 0, 
        change: 0, 
        icon: 'fas fa-tasks',
        bgColor: 'bg-green-100'
      },
      { 
        title: 'Avg Productivity', 
        value: 0, 
        change: 0, 
        icon: 'fas fa-chart-line',
        bgColor: 'bg-purple-100'
      },
      { 
        title: 'Pending Tasks', 
        value: 0, 
        change: 0, 
        icon: 'fas fa-clipboard-list',
        bgColor: 'bg-yellow-100'
      }
    ]);
    
    // Report controls
    const reportType = ref('overview');
    const timeRange = ref('month');
    const startDate = ref(new Date(new Date().setMonth(new Date().getMonth() - 1)));
    const endDate = ref(new Date());
    const selectedFilters = ref([]);
    const filterOptions = ref([]);
    
    // Chart data
    const productivityChartData = ref(null);
    const departmentChartData = ref(null);
    const attendanceChartData = ref(null);
    const mainChartData = ref(null);
    const mainChartType = ref('line');
    const activeChartFilter = ref('weekly');
    
    // Table data
    const tableData = ref([]);
    const tableSearch = ref('');
    const tablePageSize = ref(10);
    const sortField = ref('date');
    const sortDirection = ref('desc');
    
    // Report state
    const loading = ref(false);
    const error = ref(null);
    const reportGenerated = ref(false);
    
    // Chart options
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    };
    
    const detailedChartOptions = {
      ...chartOptions,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };
    
    // Chart filters
    const chartFilters = ref([
      { label: 'Daily', value: 'daily' },
      { label: 'Weekly', value: 'weekly' },
      { label: 'Monthly', value: 'monthly' }
    ]);
    
    // Table columns
    const tableColumns = computed(() => {
      const baseColumns = [
        { key: 'date', label: 'Date', sortable: true },
        { key: 'department', label: 'Department', sortable: true },
        { key: 'team', label: 'Team', sortable: true },
        { key: 'tasks', label: 'Tasks', sortable: true },
        { key: 'hours', label: 'Hours', sortable: true },
        { key: 'performance', label: 'Performance', sortable: true },
        { key: 'status', label: 'Status', sortable: true }
      ];
      
      if (reportType.value === 'performance') {
        return baseColumns.filter(col => col.key !== 'tasks' && col.key !== 'hours');
      }
      
      if (reportType.value === 'attendance') {
        return [
          { key: 'date', label: 'Date', sortable: true },
          { key: 'employee', label: 'Employee', sortable: true },
          { key: 'department', label: 'Department', sortable: true },
          { key: 'check_in', label: 'Check In', sortable: true },
          { key: 'check_out', label: 'Check Out', sortable: true },
          { key: 'hours_worked', label: 'Hours Worked', sortable: true },
          { key: 'status', label: 'Status', sortable: true }
        ];
      }
      
      return baseColumns;
    });
    
    // Report title
    const reportTitle = computed(() => {
      const titles = {
        overview: 'Dashboard Overview',
        performance: 'Performance Analytics Report',
        productivity: 'Productivity Report',
        attendance: 'Attendance Report',
        projects: 'Projects Report'
      };
      
      const periods = {
        today: 'Today',
        week: 'This Week',
        month: 'This Month',
        quarter: 'This Quarter',
        year: 'This Year',
        custom: 'Custom Range'
      };
      
      return `${periods[timeRange.value]} ${titles[reportType.value]}`;
    });
    
    // Report metrics
    const reportMetrics = ref([]);
    
    // Top performers
    const topPerformers = ref([]);
    
    // Filtered and sorted table data
    const filteredTableData = computed(() => {
      const searchTerm = tableSearch.value.toLowerCase();
      return tableData.value.filter(item => {
        return Object.values(item).some(
          val => String(val).toLowerCase().includes(searchTerm)
        );
      });
    });
    
    // Sorted table data
    const sortedTableData = computed(() => {
      return [...filteredTableData.value].sort((a, b) => {
        const aValue = a[sortField.value];
        const bValue = b[sortField.value];
        
        if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1;
        return 0;
      });
    });
    
    // Pagination
    const pagination = computed(() => {
      const total = sortedTableData.value.length;
      const lastPage = Math.ceil(total / tablePageSize.value);
      
      return {
        total,
        lastPage,
        currentPage: currentPage.value,
        from: (currentPage.value - 1) * tablePageSize.value + 1,
        to: Math.min(currentPage.value * tablePageSize.value, total)
      };
    });
    
    const currentPage = ref(1);
    
    const paginatedTableData = computed(() => {
      const start = (currentPage.value - 1) * tablePageSize.value;
      const end = start + tablePageSize.value;
      return sortedTableData.value.slice(start, end);
    });
    
    // Methods
    const sortTable = (field) => {
      if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortField.value = field;
        sortDirection.value = 'asc';
      }
      currentPage.value = 1;
    };
    
    const prevPage = () => {
      if (currentPage.value > 1) currentPage.value--;
    };
    
    const nextPage = () => {
      if (currentPage.value < pagination.value.lastPage) currentPage.value++;
    };
    
    const setChartFilter = (filter) => {
      activeChartFilter.value = filter;
      updateMainChartData();
    };
    
    const getScoreClass = (score) => {
      if (score >= 90) return 'excellent';
      if (score >= 75) return 'good';
      if (score >= 50) return 'average';
      return 'poor';
    };

    const getDateRangeParams = () => {
      let start, end;
      const now = new Date();
      
      switch(timeRange.value) {
        case 'today':
          start = new Date(now.setHours(0, 0, 0, 0));
          end = new Date(now.setHours(23, 59, 59, 999));
          break;
        case 'week':
          start = new Date(now.setDate(now.getDate() - 7));
          end = new Date();
          break;
        case 'month':
          start = new Date(now.setMonth(now.getMonth() - 1));
          end = new Date();
          break;
        case 'quarter':
          start = new Date(now.setMonth(now.getMonth() - 3));
          end = new Date();
          break;
        case 'year':
          start = new Date(now.setFullYear(now.getFullYear() - 1));
          end = new Date();
          break;
        case 'custom':
          start = new Date(startDate.value);
          end = new Date(endDate.value);
          break;
        default:
          start = new Date(now.setDate(now.getDate() - 7));
          end = new Date();
      }
      
      return {
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0]
      };
    };

    const fetchFilterOptions = async () => {
      try {
        const [deptsRes, teamsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/departments`),
          axios.get(`${API_BASE_URL}/teams`)
        ]);
        
        filterOptions.value = [
          ...deptsRes.data.map(d => ({ id: `dept_${d._id}`, name: d.name })),
          ...teamsRes.data.map(t => ({ id: `team_${t._id}`, name: t.name }))
        ];
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };

    const fetchQuickStats = async () => {
      try {
        const dateRange = getDateRangeParams();
        const res = await axios.get(`${API_BASE_URL}/reports/quick-stats`, {
          params: dateRange
        });
        
        const data = res.data.data;
        quickStats.value = [
          { 
            title: 'Total Employees', 
            value: data.totalEmployees, 
            change: data.employeeChange, 
            icon: 'fas fa-users',
            bgColor: 'bg-blue-100'
          },
          { 
            title: 'Active Projects', 
            value: data.activeProjects, 
            change: data.projectChange, 
            icon: 'fas fa-tasks',
            bgColor: 'bg-green-100'
          },
          { 
            title: 'Avg Productivity', 
            value: `${data.avgProductivity}%`, 
            change: data.productivityChange, 
            icon: 'fas fa-chart-line',
            bgColor: 'bg-purple-100'
          },
          { 
            title: 'Pending Tasks', 
            value: data.pendingTasks, 
            change: data.taskChange, 
            icon: 'fas fa-clipboard-list',
            bgColor: 'bg-yellow-100'
          }
        ];
      } catch (err) {
        console.error('Error fetching quick stats:', err);
      }
    };

    const fetchOverviewData = async () => {
      try {
        const dateRange = getDateRangeParams();
        const res = await axios.get(`${API_BASE_URL}/reports/overview`, {
          params: dateRange
        });
        
        const data = res.data.data;
        
        // Productivity chart data
        productivityChartData.value = {
          labels: data.productivityTrends.labels,
          datasets: [{
            label: 'Productivity Score',
            data: data.productivityTrends.data,
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            tension: 0.3
          }]
        };
        
        // Department distribution data
        departmentChartData.value = {
          labels: data.departmentDistribution.labels,
          datasets: [{
            data: data.departmentDistribution.data,
            backgroundColor: [
              '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
              '#ec4899', '#14b8a6', '#f97316', '#78716c', '#a855f7'
            ]
          }]
        };
        
        // Attendance data
        attendanceChartData.value = {
          labels: data.attendanceOverview.labels,
          datasets: [{
            label: 'Attendance',
            data: data.attendanceOverview.data,
            backgroundColor: [
              '#10b981', '#f59e0b', '#ef4444', '#3b82f6'
            ]
          }]
        };
        
        // Top performers
        topPerformers.value = data.topPerformers.map(p => ({
          id: p._id,
          name: p.name,
          role: p.role,
          score: p.score,
          avatar: p.avatar || defaultAvatar
        }));
        
      } catch (err) {
        console.error('Error fetching overview data:', err);
        throw err;
      }
    };

    const fetchDetailedReport = async () => {
      try {
        const dateRange = getDateRangeParams();
        const filters = selectedFilters.value.map(f => f.id);
        
        const res = await axios.get(`${API_BASE_URL}/reports/detailed`, {
          params: {
            ...dateRange,
            type: reportType.value,
            filters: filters.join(',')
          }
        });
        
        const data = res.data.data;
        
        // Set report metrics
        reportMetrics.value = [
          { label: 'Total', value: data.metrics.total.value, change: data.metrics.total.change },
          { label: 'High', value: data.metrics.high.value, change: data.metrics.high.change },
          { label: 'Low', value: data.metrics.low.value, change: data.metrics.low.change }
        ];
        
        // Set main chart data based on report type
        mainChartType.value = reportType.value === 'attendance' ? 'bar' : 'line';
        mainChartData.value = {
          labels: data.chartData.labels,
          datasets: [{
            label: data.chartData.label,
            data: data.chartData.values,
            backgroundColor: reportType.value === 'attendance' ? '#4f46e5' : 'rgba(79, 70, 229, 0.1)',
            borderColor: '#4f46e5',
            tension: 0.3
          }]
        };
        
        // Set table data
        tableData.value = data.tableData.map(item => ({
          ...item,
          status: getStatusFromScore(item.performance)
        }));
        
      } catch (err) {
        console.error('Error fetching detailed report:', err);
        throw err;
      }
    };

    const getStatusFromScore = (score) => {
      if (score >= 90) return 'excellent';
      if (score >= 75) return 'good';
      if (score >= 50) return 'average';
      return 'poor';
    };

    const updateMainChartData = async () => {
      if (reportType.value === 'overview') return;
      
      try {
        const dateRange = getDateRangeParams();
        const filters = selectedFilters.value.map(f => f.id);
        const granularity = activeChartFilter.value;
        
        const res = await axios.get(`${API_BASE_URL}/reports/chart-data`, {
          params: {
            ...dateRange,
            type: reportType.value,
            filters: filters.join(','),
            granularity
          }
        });
        
        const data = res.data.data;
        mainChartData.value = {
          labels: data.labels,
          datasets: [{
            label: data.label,
            data: data.values,
            backgroundColor: reportType.value === 'attendance' ? '#4f46e5' : 'rgba(79, 70, 229, 0.1)',
            borderColor: '#4f46e5',
            tension: 0.3
          }]
        };
      } catch (err) {
        console.error('Error updating chart data:', err);
      }
    };

    const generateReport = async () => {
      loading.value = true;
      error.value = null;
      reportGenerated.value = false;
      
      try {
        await fetchQuickStats();
        
        if (reportType.value === 'overview') {
          await fetchOverviewData();
        } else {
          await fetchDetailedReport();
        }
        
        reportGenerated.value = true;
      } catch (err) {
        error.value = err.response?.data?.message || err.message || 'Failed to generate report';
      } finally {
        loading.value = false;
      }
    };
    
    const exportPDF = async () => {
      try {
        const dateRange = getDateRangeParams();
        const filters = selectedFilters.value.map(f => f.id);
        
        const res = await axios.get(`${API_BASE_URL}/reports/export/pdf`, {
          params: {
            ...dateRange,
            type: reportType.value,
            filters: filters.join(','),
            title: reportTitle.value
          },
          responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${reportTitle.value}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (err) {
        console.error('Error exporting to PDF:', err);
        alert('Failed to export PDF: ' + (err.response?.data?.message || err.message));
      }
    };
    
    const exportExcel = async () => {
      try {
        const dateRange = getDateRangeParams();
        const filters = selectedFilters.value.map(f => f.id);
        
        const res = await axios.get(`${API_BASE_URL}/reports/export/excel`, {
          params: {
            ...dateRange,
            type: reportType.value,
            filters: filters.join(','),
            title: reportTitle.value
          },
          responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${reportTitle.value}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (err) {
        console.error('Error exporting to Excel:', err);
        alert('Failed to export Excel: ' + (err.response?.data?.message || err.message));
      }
    };
    
    // Initialize
    onMounted(() => {
      updateDateTime();
      setInterval(updateDateTime, 60000);
      
      // Load filter options
      fetchFilterOptions();
      
      // Generate initial report
      generateReport();
    });
    
    return {
      currentDateTime,
      quickStats,
      reportType,
      timeRange,
      startDate,
      endDate,
      selectedFilters,
      filterOptions,
      loading,
      error,
      reportGenerated,
      productivityChartData,
      departmentChartData,
      attendanceChartData,
      mainChartData,
      mainChartType,
      activeChartFilter,
      chartFilters,
      reportTitle,
      reportMetrics,
      topPerformers,
      tableColumns,
      tableData,
      tableSearch,
      tablePageSize,
      sortField,
      sortDirection,
      filteredTableData,
      sortedTableData,
      pagination,
      paginatedTableData,
      currentPage,
      chartOptions,
      detailedChartOptions,
      generateReport,
      exportPDF,
      exportExcel,
      sortTable,
      prevPage,
      nextPage,
      setChartFilter,
      getScoreClass,
      defaultAvatar
    };
  }
};
</script>

<style scoped>
.admin-reports-view {
  padding: 1.5rem;
  background-color: #f9fafb;
  min-height: 100vh;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-section h2 {
  font-size: 1.75rem;
  color: #111827;
  margin: 0;
}

.time-display {
  color: #6b7280;
  font-size: 0.9rem;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: white;
}

.stat-icon.bg-blue-100 { background-color: #3b82f6; color: white; }
.stat-icon.bg-green-100 { background-color: #10b981; color: white; }
.stat-icon.bg-purple-100 { background-color: #8b5cf6; color: white; }
.stat-icon.bg-yellow-100 { background-color: #f59e0b; color: white; }

.stat-content h4 {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
}

.stat-content p {
  margin: 0;
  color: #111827;
}

.stat-content span {
  font-size: 0.75rem;
}

.report-section {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.report-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.control-group {
  flex: 1;
  min-width: 200px;
}

.control-group label {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.custom-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: white;
}

.date-range-picker {
  display: flex;
  align-items: center;
}

.generate-btn {
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  height: fit-content;
  align-self: flex-end;
}

.generate-btn:hover {
  background-color: #4338ca;
}

.generate-btn:disabled {
  background-color: #a5b4fc;
  cursor: not-allowed;
}

.export-options {
  display: flex;
  gap: 0.5rem;
  height: fit-content;
  align-self: flex-end;
}

.export-btn {
  background-color: white;
  color: #4f46e5;
  border: 1px solid #4f46e5;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.export-btn:hover {
  background-color: #eef2ff;
}

.export-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6b7280;
}

.spinner {
  border: 3px solid #e5e7eb;
  border-top: 3px solid #4f46e5;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #ef4444;
  background-color: #fef2f2;
  border-radius: 0.5rem;
}

.error-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.retry-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  cursor: pointer;
}

.retry-btn:hover {
  background-color: #dc2626;
}

.report-content {
  margin-top: 1.5rem;
}

.overview-dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.grid-row {
  display: flex;
  gap: 1.5rem;
}

.grid-col {
  flex: 1;
  min-width: 0;
}

.chart-container {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 300px;
}

.chart-container h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.125rem;
  color: #111827;
}

.data-card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.top-performers {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.performer {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.375rem;
  background-color: #f9fafb;
}

.rank {
  font-weight: bold;
  color: #4f46e5;
  width: 1.5rem;
  text-align: center;
}

.avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 1rem;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.details {
  flex: 1;
}

.details .name {
  font-weight: 500;
  margin: 0;
}

.details .role {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.score .badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.score .badge.excellent {
  background-color: #dcfce7;
  color: #16a34a;
}

.score .badge.good {
  background-color: #dbeafe;
  color: #2563eb;
}

.score .badge.average {
  background-color: #fef3c7;
  color: #d97706;
}

.score .badge.poor {
  background-color: #fee2e2;
  color: #dc2626;
}

.detailed-report {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.report-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #111827;
}

.report-summary {
  display: flex;
  gap: 1.5rem;
}

.metric {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.metric .label {
  font-size: 0.875rem;
  color: #6b7280;
}

.metric .value {
  font-weight: 500;
  color: #111827;
}

.metric .change {
  font-size: 0.75rem;
  font-weight: 500;
}

.metric .change.positive {
  color: #10b981;
}

.metric .change.negative {
  color: #ef4444;
}

.chart-area {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.main-chart {
  height: 300px;
}

.chart-filters {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.chart-filters button {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
}

.chart-filters button.active {
  background-color: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.data-table-section {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.table-header h4 {
  margin: 0;
  font-size: 1.125rem;
  color: #111827;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
}

.search-input {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.page-size-select {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.table-responsive {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background-color: #f9fafb;
  color: #6b7280;
  font-weight: 500;
  text-align: left;
  padding: 0.75rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

th.sortable {
  cursor: pointer;
}

th.sortable:hover {
  background-color: #f3f4f6;
}

th.active {
  color: #4f46e5;
}

td {
  padding: 0.75rem;
  border-top: 1px solid #e5e7eb;
  font-size: 0.875rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.excellent {
  background-color: #dcfce7;
  color: #16a34a;
}

.status-badge.good {
  background-color: #dbeafe;
  color: #2563eb;
}

.status-badge.average {
  background-color: #fef3c7;
  color: #d97706;
}

.status-badge.poor {
  background-color: #fee2e2;
  color: #dc2626;
}

.performance-bar {
  display: flex;
  align-items: center;
}

.performance-bar .bar {
  height: 0.5rem;
  background-color: #4f46e5;
  border-radius: 0.25rem;
  margin-right: 0.5rem;
}

.performance-bar span {
  font-size: 0.75rem;
  color: #6b7280;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-controls button {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.pagination-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Multiselect overrides */
:deep(.multiselect) {
  min-height: 42px;
}

:deep(.multiselect__tags) {
  min-height: 42px;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
}

:deep(.multiselect__select) {
  height: 40px;
}

:deep(.multiselect__placeholder) {
  padding-top: 8px;
  margin-bottom: 8px;
}

:deep(.multiselect__tag) {
  background: #4f46e5;
}

:deep(.multiselect__tag-icon:after) {
  color: white;
}

:deep(.multiselect__tag-icon:hover) {
  background: #4338ca;
}

:deep(.multiselect__option--highlight) {
  background: #4f46e5;
}

:deep(.multiselect__option--highlight:after) {
  background: #4f46e5;
}
</style>