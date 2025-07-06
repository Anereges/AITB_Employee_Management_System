<template>
  <div class="reports-page">
    <div class="page-header">
      <h1 class="page-title">Reports</h1>
      <button class="generate-btn" @click="generateReport" :disabled="isGenerating">
        <i class="fas fa-file-export mr-2"></i>
        {{ isGenerating ? 'Generating...' : 'Generate Report' }}
      </button>
    </div>
    
    <div class="reports-grid">
      <div class="report-card" v-for="report in reports" :key="report.id">
        <div class="report-icon" :class="report.bgColor">
          <i :class="report.icon"></i>
        </div>
        <div class="report-content">
          <h3>{{ report.title }}</h3>
          <p>{{ report.description }}</p>
          <div class="report-actions">
            <button 
              class="view-btn" 
              @click="viewReport(report)"
              :disabled="report.isLoading"
            >
              <template v-if="report.isLoading">
                <i class="fas fa-spinner fa-spin mr-1"></i>
                Loading...
              </template>
              <template v-else>
                <i class="fas fa-eye mr-1"></i>
                View
              </template>
            </button>
            <button 
              class="download-btn" 
              @click="downloadReport(report)"
              :disabled="report.isLoading"
            >
              <template v-if="report.isLoading">
                <i class="fas fa-spinner fa-spin mr-1"></i>
                Downloading...
              </template>
              <template v-else>
                <i class="fas fa-download mr-1"></i>
                Download
              </template>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Viewer Modal -->
    <div v-if="showReportModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ currentReport?.title }}</h3>
          <button @click="closeModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="isLoading" class="loading-container">
            <i class="fas fa-spinner fa-spin"></i> Loading report...
          </div>
          <div v-else-if="reportError" class="error-message">
            <i class="fas fa-exclamation-triangle"></i> {{ reportError }}
          </div>
          <div v-else class="report-data">
            <!-- Display different report types differently -->
            <div v-if="reportData">
              <div v-if="currentReport.id === 1" class="employee-directory">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Position</th>
                      <th>Department</th>
                      <th>Email</th>
                      <th>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="employee in reportData" :key="employee.id">
                      <td>{{ employee.name }}</td>
                      <td>{{ employee.position }}</td>
                      <td>{{ employee.department }}</td>
                      <td>{{ employee.email }}</td>
                      <td>{{ employee.phone }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div v-else-if="currentReport.id === 2" class="attendance-summary">
                <div class="summary-stats">
                  <div class="stat-item">
                    <span class="stat-value">{{ reportData.totalDays }}</span>
                    <span class="stat-label">Working Days</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ reportData.averageHours }}</span>
                    <span class="stat-label">Avg. Hours/Day</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ reportData.lateArrivals }}</span>
                    <span class="stat-label">Late Arrivals</span>
                  </div>
                </div>
                <div class="attendance-chart">
                  <!-- Chart would be implemented with a chart library -->
                  <div class="chart-placeholder">
                    Attendance Chart Visualization
                  </div>
                </div>
              </div>
              
              <!-- Add other report type displays here -->
              <div v-else class="generic-report">
                <pre>{{ JSON.stringify(reportData, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="downloadCurrentReport" class="btn primary">
            <i class="fas fa-download mr-1"></i> Download
          </button>
          <button @click="closeModal" class="btn secondary">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from 'vue-toastification';

// Mock API function since we don't have the actual API
const mockApi = {
  get: async (endpoint) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (endpoint.includes('/employee-directory')) {
      return {
        data: [
          { id: 1, name: 'John Doe', position: 'Developer', department: 'IT', email: 'john@example.com', phone: '555-0101' },
          { id: 2, name: 'Jane Smith', position: 'Designer', department: 'Creative', email: 'jane@example.com', phone: '555-0102' },
          { id: 3, name: 'Bob Johnson', position: 'Manager', department: 'Operations', email: 'bob@example.com', phone: '555-0103' }
        ]
      };
    } else if (endpoint.includes('/attendance')) {
      return {
        data: {
          totalDays: 22,
          averageHours: 8.5,
          lateArrivals: 3
        }
      };
    } else if (endpoint.includes('/status')) {
      return {
        data: {
          lastUpdated: new Date().toISOString()
        }
      };
    }
    return { data: { message: 'Report data' } };
  },
  post: async (endpoint) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { data: { success: true } };
  }
};

const toast = useToast();

const reports = ref([
  {
    id: 1,
    title: 'Employee Directory',
    description: 'Complete list of all employees with contact information',
    icon: 'fas fa-users',
    bgColor: 'bg-blue',
    endpoint: '/reports/employee-directory',
    isLoading: false
  },
  {
    id: 2,
    title: 'Attendance Summary',
    description: 'Monthly attendance report with late arrivals and absences',
    icon: 'fas fa-calendar-check',
    bgColor: 'bg-emerald',
    endpoint: '/reports/attendance',
    isLoading: false
  },
  {
    id: 3,
    title: 'Leave Balance',
    description: 'Current leave balances for all employees',
    icon: 'fas fa-calendar-minus',
    bgColor: 'bg-amber',
    endpoint: '/reports/leave-balance',
    isLoading: false
  },
  {
    id: 4,
    title: 'Payroll Summary',
    description: 'Monthly payroll report with deductions and taxes',
    icon: 'fas fa-file-invoice-dollar',
    bgColor: 'bg-purple',
    endpoint: '/reports/payroll',
    isLoading: false
  },
  {
    id: 5,
    title: 'Performance Review',
    description: 'Employee performance metrics and ratings',
    icon: 'fas fa-chart-line',
    bgColor: 'bg-indigo',
    endpoint: '/reports/performance',
    isLoading: false
  },
  {
    id: 6,
    title: 'Training Completion',
    description: 'Status of mandatory training completion',
    icon: 'fas fa-chalkboard-teacher',
    bgColor: 'bg-red',
    endpoint: '/reports/training',
    isLoading: false
  }
]);

const showReportModal = ref(false);
const currentReport = ref(null);
const reportData = ref(null);
const isLoading = ref(false);
const reportError = ref(null);
const isGenerating = ref(false);

async function viewReport(report) {
  try {
    report.isLoading = true;
    currentReport.value = report;
    isLoading.value = true;
    reportError.value = null;
    showReportModal.value = true;
    
    const response = await mockApi.get(`${report.endpoint}?format=json`);
    reportData.value = response.data;
    toast.success(`${report.title} loaded successfully`);
  } catch (error) {
    console.error('Error viewing report:', error);
    reportError.value = error.message || 'Failed to load report';
    toast.error('Failed to load report');
  } finally {
    isLoading.value = false;
    report.isLoading = false;
  }
}

async function downloadReport(report) {
  try {
    report.isLoading = true;
    const response = await mockApi.get(`${report.endpoint}?format=csv`);
    
    // Create download link (simulated)
    toast.success(`${report.title} download started`);
    
    // In a real app, you would use the actual download logic:
    /*
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    */
  } catch (error) {
    console.error('Error downloading report:', error);
    toast.error(error.message || 'Failed to download report');
  } finally {
    report.isLoading = false;
  }
}

async function generateReport() {
  try {
    isGenerating.value = true;
    await mockApi.post('/reports/generate');
    toast.success('New report generation started');
    
    // Refresh reports list
    await Promise.all(reports.value.map(async report => {
      const res = await mockApi.get(report.endpoint + '/status');
      report.lastUpdated = res.data.lastUpdated;
    }));
  } catch (error) {
    console.error('Error generating report:', error);
    toast.error(error.message || 'Failed to generate report');
  } finally {
    isGenerating.value = false;
  }
}

function closeModal() {
  showReportModal.value = false;
  currentReport.value = null;
  reportData.value = null;
}

async function downloadCurrentReport() {
  if (!currentReport.value) return;
  await downloadReport(currentReport.value);
}
</script>

<style scoped>
.reports-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

.generate-btn {
  background-color: #4f46e5;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  display: flex;
  align-items: center;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.generate-btn:hover {
  background-color: #4338ca;
}

.generate-btn:disabled {
  background-color: #a5b4fc;
  cursor: not-allowed;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.report-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  transition: transform 0.2s, box-shadow 0.2s;
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.report-icon {
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.report-icon.bg-blue { background-color: #3b82f6; }
.report-icon.bg-emerald { background-color: #10b981; }
.report-icon.bg-amber { background-color: #f59e0b; }
.report-icon.bg-purple { background-color: #8b5cf6; }
.report-icon.bg-indigo { background-color: #6366f1; }
.report-icon.bg-red { background-color: #ef4444; }

.report-content {
  padding: 20px;
  flex: 1;
}

.report-content h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1f2937;
}

.report-content p {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 16px;
}

.report-actions {
  display: flex;
  gap: 10px;
}

.view-btn, .download-btn {
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.view-btn {
  background-color: #e0e7ff;
  color: #4f46e5;
  border: none;
}

.view-btn:hover {
  background-color: #c7d2fe;
}

.view-btn:disabled {
  background-color: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.download-btn {
  background-color: #f3f4f6;
  color: #4b5563;
  border: none;
}

.download-btn:hover {
  background-color: #e5e7eb;
}

.download-btn:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 80%;
  max-width: 900px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  line-height: 1;
}

.modal-close:hover {
  color: #1f2937;
}

.modal-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.loading-container, .error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #6b7280;
}

.error-message {
  color: #ef4444;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn.primary {
  background-color: #4f46e5;
  color: white;
}

.btn.primary:hover {
  background-color: #4338ca;
}

.btn.secondary {
  background-color: #f3f4f6;
  color: #4b5563;
}

.btn.secondary:hover {
  background-color: #e5e7eb;
}

/* Report Data Styles */
.employee-directory table {
  width: 100%;
  border-collapse: collapse;
}

.employee-directory th, 
.employee-directory td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.employee-directory th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.summary-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-item {
  flex: 1;
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  display: block;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.chart-placeholder {
  background: #f3f4f6;
  height: 200px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.generic-report pre {
  background: #f3f4f6;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 14px;
}
</style>