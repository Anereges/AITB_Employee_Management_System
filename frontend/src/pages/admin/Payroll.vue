<template>
  <div class="payroll-container">
    <AdminHeader />
    
    <div class="payroll-layout">
      <AdminSidebar />
      
      <main class="payroll-content">
        <div class="payroll-header">
          <h1>Payroll Management</h1>
          <div class="header-actions">
            <button class="action-btn primary" @click="openNewPaymentModal">
              <i class="fas fa-plus"></i> New Payment
            </button>
            <button class="action-btn" @click="exportPayrollData">
              <i class="fas fa-file-export"></i> Export
            </button>
          </div>
        </div>

        <!-- Payroll Filters -->
        <div class="payroll-filters">
          <div class="filter-group">
            <label>Period</label>
            <select v-model="filters.period" @change="fetchPayrollData">
              <option value="current">Current Month</option>
              <option value="last">Last Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div class="filter-group" v-if="filters.period === 'custom'">
            <label>From</label>
            <input type="date" v-model="filters.startDate" @change="fetchPayrollData">
          </div>

          <div class="filter-group" v-if="filters.period === 'custom'">
            <label>To</label>
            <input type="date" v-model="filters.endDate" @change="fetchPayrollData">
          </div>

          <div class="filter-group">
            <label>Status</label>
            <select v-model="filters.status" @change="fetchPayrollData">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processed">Processed</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Employee</label>
            <select v-model="filters.employee" @change="fetchPayrollData">
              <option value="">All Employees</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.name }}
              </option>
            </select>
          </div>

          <button class="filter-btn" @click="resetFilters">
            <i class="fas fa-sync-alt"></i> Reset
          </button>
        </div>

        <!-- Payroll Summary -->
        <div class="payroll-summary">
          <div class="summary-card">
            <div class="summary-icon bg-blue-100">
              <i class="fas fa-users text-blue-600"></i>
            </div>
            <div class="summary-details">
              <span class="summary-label">Total Employees</span>
              <span class="summary-value">{{ summary.totalEmployees }}</span>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-icon bg-green-100">
              <i class="fas fa-check-circle text-green-600"></i>
            </div>
            <div class="summary-details">
              <span class="summary-label">Processed</span>
              <span class="summary-value">{{ summary.processed }}</span>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-icon bg-yellow-100">
              <i class="fas fa-clock text-yellow-600"></i>
            </div>
            <div class="summary-details">
              <span class="summary-label">Pending</span>
              <span class="summary-value">{{ summary.pending }}</span>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-icon bg-purple-100">
              <i class="fas fa-money-bill-wave text-purple-600"></i>
            </div>
            <div class="summary-details">
              <span class="summary-label">Total Amount</span>
              <span class="summary-value">{{ formatCurrency(summary.totalAmount) }}</span>
            </div>
          </div>
        </div>

        <!-- Payroll Table -->
        <div class="payroll-table-container">
          <table class="payroll-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Period</th>
                <th>Basic Salary</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Net Pay</th>
                <th>Status</th>
                <th>Payment Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in payrollData" :key="item.id">
                <td>
                  <div class="employee-cell">
                    <img :src="item.employee.avatar" :alt="item.employee.name" class="employee-avatar">
                    <div>
                      <div class="employee-name">{{ item.employee.name }}</div>
                      <div class="employee-id">ID: {{ item.employee.id }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ formatDate(item.periodStart) }} - {{ formatDate(item.periodEnd) }}</td>
                <td>{{ formatCurrency(item.basicSalary) }}</td>
                <td>{{ formatCurrency(item.allowances) }}</td>
                <td>{{ formatCurrency(item.deductions) }}</td>
                <td class="font-semibold">{{ formatCurrency(item.netPay) }}</td>
                <td>
                  <span class="status-badge" :class="item.status">{{ item.status }}</span>
                </td>
                <td>{{ item.paymentDate ? formatDate(item.paymentDate) : '--' }}</td>
                <td>
                  <div class="action-buttons">
                    <button class="action-btn view-btn" @click="viewPayrollDetails(item)">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button 
                      class="action-btn process-btn" 
                      v-if="item.status === 'pending'"
                      @click="processPayroll(item)"
                    >
                      <i class="fas fa-cog"></i>
                    </button>
                    <button 
                      class="action-btn pay-btn" 
                      v-if="item.status === 'processed'"
                      @click="markAsPaid(item)"
                    >
                      <i class="fas fa-check"></i>
                    </button>
                    <button 
                      class="action-btn cancel-btn" 
                      v-if="item.status !== 'paid' && item.status !== 'cancelled'"
                      @click="cancelPayroll(item)"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                    <button class="action-btn print-btn" @click="printPayslip(item)">
                      <i class="fas fa-print"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="payrollData.length === 0">
                <td colspan="9" class="no-results">
                  No payroll records found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-controls">
          <div class="pagination-info">
            Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} entries
          </div>
          <div class="pagination-buttons">
            <button 
              class="pagination-btn" 
              @click="prevPage" 
              :disabled="pagination.currentPage === 1"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <button 
              v-for="page in displayedPages" 
              :key="page" 
              class="pagination-btn" 
              :class="{ active: pagination.currentPage === page }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <button 
              class="pagination-btn" 
              @click="nextPage" 
              :disabled="pagination.currentPage === pagination.totalPages"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
          <div class="items-per-page">
            <select v-model="pagination.perPage" @change="changePerPage">
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>
        </div>
      </main>

      <!-- New Payment Modal -->
      <div v-if="showNewPaymentModal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ editingPayment ? 'Edit Payment' : 'Create New Payment' }}</h2>
            <button class="modal-close" @click="closeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <form @submit.prevent="submitPayment">
            <div class="modal-body">
              <div class="form-group">
                <label>Employee <span class="required">*</span></label>
                <select v-model="paymentForm.employeeId" required>
                  <option value="">Select Employee</option>
                  <option 
                    v-for="emp in employees" 
                    :key="emp.id" 
                    :value="emp.id"
                  >
                    {{ emp.name }} ({{ emp.position }})
                  </option>
                </select>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Period Start <span class="required">*</span></label>
                  <input 
                    type="date" 
                    v-model="paymentForm.periodStart" 
                    required
                    @change="validateDates"
                  >
                </div>
                <div class="form-group">
                  <label>Period End <span class="required">*</span></label>
                  <input 
                    type="date" 
                    v-model="paymentForm.periodEnd" 
                    required
                    @change="validateDates"
                  >
                </div>
              </div>

              <div class="form-group">
                <label>Basic Salary <span class="required">*</span></label>
                <input 
                  type="number" 
                  v-model="paymentForm.basicSalary" 
                  required
                  min="0"
                  step="0.01"
                >
              </div>

              <div class="form-group">
                <label>Allowances</label>
                <div class="allowances-container">
                  <div class="allowance-item" v-for="(allowance, index) in paymentForm.allowances" :key="index">
                    <input 
                      type="text" 
                      v-model="allowance.name" 
                      placeholder="Allowance name"
                    >
                    <input 
                      type="number" 
                      v-model="allowance.amount" 
                      placeholder="Amount"
                      min="0"
                      step="0.01"
                    >
                    <button 
                      class="remove-btn" 
                      @click.prevent="removeAllowance(index)"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <button class="add-btn" @click.prevent="addAllowance">
                    <i class="fas fa-plus"></i> Add Allowance
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label>Deductions</label>
                <div class="deductions-container">
                  <div class="deduction-item" v-for="(deduction, index) in paymentForm.deductions" :key="index">
                    <input 
                      type="text" 
                      v-model="deduction.name" 
                      placeholder="Deduction name"
                    >
                    <input 
                      type="number" 
                      v-model="deduction.amount" 
                      placeholder="Amount"
                      min="0"
                      step="0.01"
                    >
                    <button 
                      class="remove-btn" 
                      @click.prevent="removeDeduction(index)"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <button class="add-btn" @click.prevent="addDeduction">
                    <i class="fas fa-plus"></i> Add Deduction
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label>Net Pay</label>
                <input 
                  type="text" 
                  :value="formatCurrency(calculatedNetPay)" 
                  readonly
                  class="readonly-input"
                >
              </div>

              <div class="form-group">
                <label>Payment Method <span class="required">*</span></label>
                <select v-model="paymentForm.paymentMethod" required>
                  <option value="">Select Method</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="mobile">Mobile Payment</option>
                </select>
              </div>

              <div class="form-group">
                <label>Payment Date</label>
                <input type="date" v-model="paymentForm.paymentDate">
              </div>

              <div class="form-group">
                <label>Notes</label>
                <textarea v-model="paymentForm.notes" rows="3"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="cancel-btn" @click="closeModal">
                Cancel
              </button>
              <button type="submit" class="submit-btn">
                {{ editingPayment ? 'Update' : 'Submit' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Payroll Details Modal -->
      <div v-if="selectedPayroll" class="modal-overlay">
        <div class="modal-content wide-modal">
          <div class="modal-header">
            <h2>Payroll Details</h2>
            <button class="modal-close" @click="selectedPayroll = null">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="details-header">
              <div class="employee-info">
                <img :src="selectedPayroll.employee.avatar" :alt="selectedPayroll.employee.name" class="employee-avatar">
                <div>
                  <h3>{{ selectedPayroll.employee.name }}</h3>
                  <p>Employee ID: {{ selectedPayroll.employee.id }}</p>
                  <p>Department: {{ selectedPayroll.employee.department }}</p>
                  <p>Position: {{ selectedPayroll.employee.position }}</p>
                </div>
              </div>
              <div class="payroll-meta">
                <div class="meta-item">
                  <span class="meta-label">Payroll ID</span>
                  <span class="meta-value">#{{ selectedPayroll.id }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Period</span>
                  <span class="meta-value">
                    {{ formatDate(selectedPayroll.periodStart) }} - {{ formatDate(selectedPayroll.periodEnd) }}
                  </span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Status</span>
                  <span class="meta-value status-badge" :class="selectedPayroll.status">
                    {{ selectedPayroll.status }}
                  </span>
                </div>
                <div class="meta-item" v-if="selectedPayroll.paymentDate">
                  <span class="meta-label">Payment Date</span>
                  <span class="meta-value">{{ formatDate(selectedPayroll.paymentDate) }}</span>
                </div>
              </div>
            </div>

            <div class="details-content">
              <div class="salary-breakdown">
                <h4>Salary Breakdown</h4>
                <table class="breakdown-table">
  <tbody>
    <tr>
      <td>Basic Salary</td>
      <td>{{ formatCurrency(selectedPayroll.basicSalary) }}</td>
    </tr>
    <tr v-for="allowance in selectedPayroll.allowances" :key="allowance.name">
      <td>{{ allowance.name }}</td>
      <td>+ {{ formatCurrency(allowance.amount) }}</td>
    </tr>
    <tr v-for="deduction in selectedPayroll.deductions" :key="deduction.name">
      <td>{{ deduction.name }}</td>
      <td>- {{ formatCurrency(deduction.amount) }}</td>
    </tr>
    <tr class="total-row">
      <td>Net Pay</td>
      <td>{{ formatCurrency(selectedPayroll.netPay) }}</td>
    </tr>
  </tbody>
</table>

              </div>

              <div class="payment-details">
                <h4>Payment Details</h4>
                <div class="payment-info">
                  <div class="info-item">
                    <span class="info-label">Payment Method:</span>
                    <span class="info-value">{{ selectedPayroll.paymentMethod }}</span>
                  </div>
                  <div class="info-item" v-if="selectedPayroll.bankDetails">
                    <span class="info-label">Bank Name:</span>
                    <span class="info-value">{{ selectedPayroll.bankDetails.bankName }}</span>
                  </div>
                  <div class="info-item" v-if="selectedPayroll.bankDetails">
                    <span class="info-label">Account Number:</span>
                    <span class="info-value">{{ selectedPayroll.bankDetails.accountNumber }}</span>
                  </div>
                  <div class="info-item" v-if="selectedPayroll.notes">
                    <span class="info-label">Notes:</span>
                    <span class="info-value">{{ selectedPayroll.notes }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="action-buttons">
              <button class="action-btn print-btn" @click="printPayslip(selectedPayroll)">
                <i class="fas fa-print"></i> Print Payslip
              </button>
              <button 
                class="action-btn process-btn" 
                v-if="selectedPayroll.status === 'pending'"
                @click="processPayroll(selectedPayroll)"
              >
                <i class="fas fa-cog"></i> Process
              </button>
              <button 
                class="action-btn pay-btn" 
                v-if="selectedPayroll.status === 'processed'"
                @click="markAsPaid(selectedPayroll)"
              >
                <i class="fas fa-check"></i> Mark as Paid
              </button>
              <button 
                class="action-btn cancel-btn" 
                v-if="selectedPayroll.status !== 'paid' && selectedPayroll.status !== 'cancelled'"
                @click="cancelPayroll(selectedPayroll)"
              >
                <i class="fas fa-times"></i> Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import axios from 'axios'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'

export default {
  components: {
    AdminSidebar
  },
  setup() {
    const router = useRouter()
    const toast = useToast()

    // Data properties
    const employees = ref([])
    const showNewPaymentModal = ref(false)
    const payrollData = ref([])
    const selectedPayroll = ref(null)
    const loading = ref(false)
    const errorMessage = ref('')

    // Filters
    const filters = ref({
      period: 'current',
      startDate: '',
      endDate: '',
      status: '',
      employee: ''
    })

    // Payment form
    const paymentForm = ref({
      employeeId: '',
      periodStart: '',
      periodEnd: '',
      basicSalary: 0,
      allowances: [],
      deductions: [],
      paymentMethod: '',
      paymentDate: '',
      notes: ''
    })

    // Summary data
    const summary = ref({
      totalEmployees: 0,
      processed: 0,
      pending: 0,
      totalAmount: 0
    })

    // Pagination
    const pagination = ref({
      currentPage: 1,
      perPage: 10,
      total: 0,
      totalPages: 1
    })

   const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});


    // Computed properties
const calculatedNetPay = computed(() => {
  const basic = parseFloat(paymentForm.value.basicSalary) || 0
  const allowances = paymentForm.value.allowances.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0)
  const deductions = paymentForm.value.deductions.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0)
  return basic + allowances - deductions
})

    const displayedPages = computed(() => {
      const pages = []
      const maxVisiblePages = 5
      
      if (pagination.value.totalPages <= maxVisiblePages) {
        for (let i = 1; i <= pagination.value.totalPages; i++) {
          pages.push(i)
        }
      } else {
        let start = Math.max(1, pagination.value.currentPage - Math.floor(maxVisiblePages / 2))
        let end = Math.min(pagination.value.totalPages, start + maxVisiblePages - 1)
        
        if (start > 1) {
          pages.push(1)
          if (start > 2) pages.push('...')
        }
        
        for (let i = start; i <= end; i++) {
          pages.push(i)
        }
        
        if (end < pagination.value.totalPages) {
          if (end < pagination.value.totalPages - 1) pages.push('...')
          pages.push(pagination.value.totalPages)
        }
      }
      
      return pages
    })

    const formatCurrency = (amount) => {
      if (amount === undefined || amount === null || isNaN(amount)) return '--'
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(amount)
    }

    const formatDate = (dateString) => {
      if (!dateString) return '--'
      return new Date(dateString).toLocaleDateString()
    }

    // API Methods

const fetchEmployees = async () => {
  try {
    // Updated URL with /api/admin prefix
    const response = await api.get('/admin/employees', { withCredentials: true });
    employees.value = response.data.data.employees || response.data.data; // Adjust if needed
  } catch (error) {
    toast.error('Failed to fetch employees');
  }
};

const fetchPayrollData = async () => {
  try {
    loading.value = true;
    const params = {
      ...filters.value,
      page: pagination.value.currentPage,
      limit: pagination.value.perPage
    };

    // Updated URL with /api/payroll prefix
    const response = await api.get('/payroll', { params, withCredentials: true });
    payrollData.value = response.data.data.payrolls || response.data.data; // Adjust if needed
    pagination.value.total = response.data.total;
    pagination.value.totalPages = Math.ceil(response.data.total / pagination.value.perPage);
  } catch (error) {
    toast.error('Failed to fetch payroll data');
  } finally {
    loading.value = false;
  }
};

const fetchPayrollSummary = async () => {
  try {
    // Updated URL with /api/payroll prefix
    const response = await api.get('/payroll/summary', { withCredentials: true });
    summary.value = response.data.data;
  } catch (error) {
    toast.error('Failed to fetch payroll summary');
  }
};

const submitPayment = async () => {
  try {
    const payload = {
      ...paymentForm.value,
      netPay: calculatedNetPay.value
    };

    const url = selectedPayroll.value 
      ? `/payroll/${selectedPayroll.value.id}`
      : '/payroll';

    const method = selectedPayroll.value ? 'put' : 'post';

    await api[method](url, payload, { withCredentials: true });
    toast.success('Payment submitted successfully');
    showNewPaymentModal.value = false;
    fetchPayrollData();
    fetchPayrollSummary();
  } catch (error) {
    toast.error('Failed to submit payment');
  }
};

const processPayroll = async (payroll) => {
  try {
    await api.patch(`/payroll/${payroll.id}/process`, null, { withCredentials: true });
    toast.success('Payroll processed successfully');
    fetchPayrollData();
    fetchPayrollSummary();
  } catch (error) {
    toast.error('Failed to process payroll');
  }
};

const markAsPaid = async (payroll) => {
  try {
    await api.patch(`payroll/${payroll.id}/pay`, null, { withCredentials: true });
    toast.success('Payroll marked as paid');
    fetchPayrollData();
    fetchPayrollSummary();
  } catch (error) {
    toast.error('Failed to mark payroll as paid');
  }
};

const cancelPayroll = async (payroll) => {
  try {
    await api.patch(`/payroll/${payroll.id}/cancel`, null, { withCredentials: true });
    toast.success('Payroll cancelled');
    fetchPayrollData();
    fetchPayrollSummary();
  } catch (error) {
    toast.error('Failed to cancel payroll');
  }
};

const exportPayrollData = async () => {
  try {
    const response = await api.get('/payroll/export', {
      params: filters.value,
      responseType: 'blob',
      withCredentials: true
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payroll-export-${new Date().toISOString()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Export started successfully');
  } catch (error) {
    toast.error('Failed to export payroll data');
  }
};


    // Pagination methods
    const goToPage = (page) => {
      if (page === '...') return
      pagination.value.currentPage = page
      fetchPayrollData()
    }

    const prevPage = () => {
      if (pagination.value.currentPage > 1) {
        pagination.value.currentPage--
        fetchPayrollData()
      }
    }

    const nextPage = () => {
      if (pagination.value.currentPage < pagination.value.totalPages) {
        pagination.value.currentPage++
        fetchPayrollData()
      }
    }

    const changePerPage = () => {
      pagination.value.currentPage = 1
      fetchPayrollData()
    }

    // Initialize component
    onMounted(async () => {
      await Promise.all([
        fetchEmployees(),
        fetchPayrollData(),
        fetchPayrollSummary()
      ])
    })

    return {
      // Data
      employees,
      showNewPaymentModal,
      payrollData,
      selectedPayroll,
      loading,
      filters,
      paymentForm,
      summary,
      pagination,

      // Computed
      calculatedNetPay,
      displayedPages,
      formatCurrency,
      formatDate,

      // Methods
      fetchPayrollData,
      submitPayment,
      processPayroll,
      markAsPaid,
      cancelPayroll,
      exportPayrollData,
      goToPage,
      prevPage,
      nextPage,
      changePerPage,

      // UI Methods
      openNewPaymentModal: () => {
        selectedPayroll.value = null
        paymentForm.value = {
          employeeId: '',
          periodStart: '',
          periodEnd: '',
          basicSalary: 0,
          allowances: [],
          deductions: [],
          paymentMethod: '',
          paymentDate: '',
          notes: ''
        }
        showNewPaymentModal.value = true
      },
      closeModal: () => {
        showNewPaymentModal.value = false
      },
      addAllowance: () => {
        paymentForm.value.allowances.push({ name: '', amount: 0 })
      },
      removeAllowance: (index) => {
        paymentForm.value.allowances.splice(index, 1)
      },
      addDeduction: () => {
        paymentForm.value.deductions.push({ name: '', amount: 0 })
      },
      removeDeduction: (index) => {
        paymentForm.value.deductions.splice(index, 1)
      },
      viewPayrollDetails: (item) => {
        selectedPayroll.value = item
      },
      resetFilters: () => {
        filters.value = {
          period: 'current',
          startDate: '',
          endDate: '',
          status: '',
          employee: ''
        }
        fetchPayrollData()
      }
    }
  }
}
</script>

<style scoped>
.payroll-container {
  @apply min-h-screen bg-gray-50;
}

.payroll-layout {
  @apply flex;
}

.payroll-content {
  @apply flex-1 p-6;
}

.payroll-header {
  @apply flex flex-col md:flex-row justify-between items-start md:items-center mb-6;
}

.payroll-header h1 {
  @apply text-2xl font-bold text-gray-800 mb-4 md:mb-0;
}

.header-actions {
  @apply flex space-x-2;
}

.action-btn {
  @apply px-4 py-2 rounded-lg flex items-center transition-colors;
}

.action-btn.primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.action-btn:not(.primary) {
  @apply bg-white border border-gray-300 text-gray-700 hover:bg-gray-50;
}

.payroll-filters {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm;
}

.filter-group {
  @apply mb-0;
}

.filter-group label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.filter-group select,
.filter-group input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.filter-btn {
  @apply flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300;
}

.payroll-summary {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6;
}

.summary-card {
  @apply bg-white p-4 rounded-lg shadow-sm flex items-center;
}

.summary-icon {
  @apply w-12 h-12 rounded-full flex items-center justify-center mr-4;
}

.summary-details {
  @apply flex flex-col;
}

.summary-label {
  @apply text-sm text-gray-500;
}

.summary-value {
  @apply text-xl font-semibold text-gray-800;
}

.payroll-table-container {
  @apply bg-white rounded-lg shadow-sm overflow-hidden mb-6;
}

.payroll-table {
  @apply min-w-full divide-y divide-gray-200;
}

.payroll-table th {
  @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
}

.payroll-table td {
  @apply px-6 py-4 whitespace-nowrap;
}

.employee-cell {
  @apply flex items-center;
}

.employee-avatar {
  @apply w-10 h-10 rounded-full mr-3;
}

.employee-name {
  @apply font-medium text-gray-900;
}

.employee-id {
  @apply text-sm text-gray-500;
}

.status-badge {
  @apply px-2 py-1 text-xs font-semibold rounded-full;
}

.status-badge.pending {
  @apply bg-yellow-100 text-yellow-800;
}

.status-badge.processed {
  @apply bg-blue-100 text-blue-800;
}

.status-badge.paid {
  @apply bg-green-100 text-green-800;
}

.status-badge.cancelled {
  @apply bg-red-100 text-red-800;
}

.action-buttons {
  @apply flex space-x-1;
}

.action-btn {
  @apply p-2 rounded-md;
}

.view-btn {
  @apply text-blue-600 hover:bg-blue-50;
}

.process-btn {
  @apply text-yellow-600 hover:bg-yellow-50;
}

.pay-btn {
  @apply text-green-600 hover:bg-green-50;
}

.cancel-btn {
  @apply text-red-600 hover:bg-red-50;
}

.print-btn {
  @apply text-purple-600 hover:bg-purple-50;
}

.no-results {
  @apply text-center py-8 text-gray-500;
}

.pagination-controls {
  @apply flex flex-col sm:flex-row items-center justify-between;
}

.pagination-info {
  @apply text-sm text-gray-500 mb-2 sm:mb-0;
}

.pagination-buttons {
  @apply flex space-x-1 mb-2 sm:mb-0;
}

.pagination-btn {
  @apply w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50;
}

.pagination-btn.active {
  @apply bg-blue-600 text-white border-blue-600;
}

.items-per-page select {
  @apply px-2 py-1 border border-gray-300 rounded-md;
}

/* Modal Styles */
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto;
}

.modal-content.wide-modal {
  @apply max-w-4xl;
}

.modal-header {
  @apply px-6 py-4 border-b border-gray-200 flex justify-between items-center;
}

.modal-header h2 {
  @apply text-xl font-semibold text-gray-800;
}

.modal-close {
  @apply text-gray-400 hover:text-gray-500;
}

.modal-body {
  @apply px-6 py-4;
}

.modal-footer {
  @apply px-6 py-4 border-t border-gray-200 flex justify-end space-x-3;
}

.form-group {
  @apply mb-4;
}

.form-group label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.form-group .required {
  @apply text-red-500;
}

.form-group input,
.form-group select,
.form-group textarea {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.form-group textarea {
  @apply min-h-[100px];
}

.readonly-input {
  @apply bg-gray-100 cursor-not-allowed;
}

.form-row {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.allowances-container,
.deductions-container {
  @apply space-y-2;
}

.allowance-item,
.deduction-item {
  @apply flex space-x-2 items-center;
}

.allowance-item input,
.deduction-item input {
  @apply flex-1;
}

.remove-btn {
  @apply text-red-500 hover:text-red-700;
}

.add-btn {
  @apply text-sm text-blue-600 hover:text-blue-800 flex items-center;
}

.cancel-btn {
  @apply px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50;
}

.submit-btn {
  @apply px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700;
}

/* Details Modal Styles */
.details-header {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6 mb-6;
}

.employee-info {
  @apply flex items-center;
}

.employee-info img {
  @apply w-16 h-16 rounded-full mr-4;
}

.employee-info h3 {
  @apply text-xl font-semibold;
}

.payroll-meta {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-4;
}

.meta-item {
  @apply flex flex-col;
}

.meta-label {
  @apply text-sm text-gray-500;
}

.meta-value {
  @apply font-medium;
}

.details-content {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-6;
}

.salary-breakdown h4,
.payment-details h4 {
  @apply text-lg font-semibold mb-4;
}

.breakdown-table {
  @apply w-full;
}

.breakdown-table td {
  @apply py-2 border-b border-gray-100;
}

.breakdown-table .total-row td {
  @apply font-semibold pt-3;
}

.payment-info {
  @apply space-y-3;
}

.info-item {
  @apply flex;
}

.info-label {
  @apply font-medium w-1/3;
}

.info-value {
  @apply flex-1;
}

.action-buttons {
  @apply flex justify-end space-x-3 mt-6;
}

.action-buttons .action-btn {
  @apply px-4 py-2 rounded-md flex items-center;
}

.action-buttons .print-btn {
  @apply bg-purple-100 text-purple-700 hover:bg-purple-200;
}

.action-buttons .process-btn {
  @apply bg-yellow-100 text-yellow-700 hover:bg-yellow-200;
}

.action-buttons .pay-btn {
  @apply bg-green-100 text-green-700 hover:bg-green-200;
}

.action-buttons .cancel-btn {
  @apply bg-red-100 text-red-700 hover:bg-red-200;
}

@media (max-width: 768px) {
  .payroll-filters {
    @apply grid-cols-1;
  }
  
  .details-header {
    @apply grid-cols-1;
  }
  
  .details-content {
    @apply grid-cols-1;
  }
  
  .action-buttons {
    @apply flex-col space-y-2 space-x-0;
  }
  
  .action-buttons .action-btn {
    @apply w-full justify-center;
  }
}
</style>