<template>
  <div class="add-employee-page">
    <div class="page-header">
      <h1 class="page-title">Add New Employee</h1>
      <router-link :to="{ name: 'Employees' }" class="back-btn">
        <i class="fas fa-arrow-left mr-2"></i>
        Back to Employees
      </router-link>
    </div>
    
    <div class="employee-form">
      <form @submit.prevent="submitForm">
        <!-- Section 1: Basic Information -->
        <div class="form-section">
          <h3 class="section-title">Basic Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label>Employee ID</label>
              <input 
                type="text" 
                v-model="employee.employeeId"
                placeholder="EMP-001" 
                required
                disabled
              >
            </div>
            <div class="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                v-model="employee.fullName"
                placeholder="Enter full name" 
                required
              >
            </div>
            <div class="form-group">
              <label>Username</label>
              <input 
                type="text" 
                v-model="employee.username"
                placeholder="Enter username" 
                required
              >
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                v-model="employee.email"
                placeholder="Enter email address" 
                required
              >
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                v-model="employee.phone"
                placeholder="Enter phone number"
                required
              >
            </div>
            <div class="form-group">
              <label>Date of Birth</label>
              <input 
                type="date" 
                v-model="employee.dateOfBirth"
              >
            </div>
            <div class="form-group">
              <label>Sex</label>
              <select v-model="employee.sex">
                <option value="">Select sex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Profile Image URL</label>
              <input 
                type="text" 
                v-model="employee.profileImage"
                placeholder="Enter image URL"
              >
            </div>
          </div>
        </div>
        
        <!-- Section 2: Employment Details -->
        <div class="form-section">
          <h3 class="section-title">Employment Details</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label>Department</label>
              <select v-model="employee.department" required>
                <option value="">Select department</option>
                <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Position</label>
              <select v-model="employee.position" required>
                <option value="">Select position</option>
                <option v-for="pos in positions" :key="pos" :value="pos">{{ pos }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Role</label>
              <select v-model="employee.role" required>
                <option value="">Select role</option>
                <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Company Name</label>
              <input 
                type="text" 
                v-model="employee.companyName"
                placeholder="Enter company name"
                required
              >
            </div>
            <div class="form-group">
              <label>Salary</label>
              <input 
                type="number" 
                v-model="employee.salary"
                placeholder="Enter salary"
                required
                min="0"
              >
            </div>
            <div class="form-group">
              <label>Hire Date</label>
              <input 
                type="date" 
                v-model="employee.hireDate"
                required
              >
            </div>
            <div class="form-group">
              <label>Employment Type</label>
              <select v-model="employee.employmentType">
                <option value="">Select type</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
            </div>
            <div class="form-group">
              <label>Status</label>
              <select v-model="employee.isActive">
                <option :value="true">Active</option>
                <option :value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Section 3: Address Information -->
        <div class="form-section">
          <h3 class="section-title">Address Information</h3>
          <div class="grid grid-cols-1 gap-6">
            <div class="form-group">
              <label>Street Address</label>
              <input 
                type="text" 
                v-model="employee.address.street"
                placeholder="Enter street address"
              >
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="form-group">
                <label>City</label>
                <input 
                  type="text" 
                  v-model="employee.address.city"
                  placeholder="Enter city"
                >
              </div>
              <div class="form-group">
                <label>State/Province</label>
                <input 
                  type="text" 
                  v-model="employee.address.state"
                  placeholder="Enter state/province"
                >
              </div>
              <div class="form-group">
                <label>Postal Code</label>
                <input 
                  type="text" 
                  v-model="employee.address.postalCode"
                  placeholder="Enter postal code"
                >
              </div>
            </div>
            <div class="form-group">
              <label>Country</label>
              <select v-model="employee.address.country">
                <option value="">Select country</option>
                <option value="ethiopia">Ethiopia</option>
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
                <option value="canada">Canada</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Section 4: Account Credentials -->
        <div class="form-section">
          <h3 class="section-title">Account Credentials</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label>Password</label>
              <input 
                type="password" 
                v-model="employee.password"
                placeholder="Enter temporary password"
                required
              >
            </div>
            <div class="form-group">
              <label>Confirm Password</label>
              <input 
                type="password" 
                v-model="employee.passwordConfirm"
                placeholder="Confirm password"
                required
              >
            </div>
          </div>
        </div>
        
        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="cancelForm">Cancel</button>
          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            {{ isSubmitting ? 'Saving...' : 'Save Employee' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useToast } from 'vue-toastification'


export default {
  name: 'AddEmployee',
  setup() {
    const router = useRouter()
    const toast = useToast()
    const isSubmitting = ref(false)

    // API configuration
    const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Directly set header
  }
});

    // Add request intercepter to include token in all request
    axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

    // Sample data for dropdowns (you can fetch these from API)
    const departments = ref(['Engineering', 'Marketing', 'HR', 'Finance', 'Operations'])
    const positions = ref(['Developer', 'Manager', 'Designer', 'Analyst', 'Specialist'])
    const roles = ref(['employee', 'hr', 'manager', 'admin'])

    // Initialize employee data with default values
    const employee = ref({
      employeeId: '',
      fullName: '',
      username: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      sex: '',
      profileImage: '',
      department: '',
      position: '',
      role: 'employee',
      companyName: '',
      salary: 0,
      hireDate: new Date().toISOString().split('T')[0],
      employmentType: 'full-time',
      isActive: true,
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Ethiopia'
      },
      password: '',
      passwordConfirm: ''
    })

    // Generate employee ID (example implementation)
    const generateEmployeeId = () => {
      const prefix = 'EMP-'
      const randomNum = Math.floor(1000 + Math.random() * 9000)
      return prefix + randomNum
    }

    // Set default employee ID when component mounts
    onMounted(() => {
      employee.value.employeeId = generateEmployeeId()
    })

    const validateForm = () => {
      if (!employee.value.fullName.trim()) {
        toast.error('Full name is required')
        return false
      }
      
      if (!employee.value.email.trim()) {
        toast.error('Email is required')
        return false
      }
      
      if (employee.value.password.length < 6) {
        toast.error('Password must be at least 6 characters')
        return false
      }
      
      if (employee.value.password !== employee.value.passwordConfirm) {
        toast.error('Passwords do not match')
        return false
      }
      
      return true
    }

    const submitForm = async () => {
  if (!validateForm()) return;

  try {
    isSubmitting.value = true;
    
    // 1. FIRST get the token
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('No authentication token found. Please login again.');
      router.push({ name: 'Login' });
      return;
    }

    // 2. THEN prepare the data
    const employeeData = { ...employee.value };
    delete employeeData.passwordConfirm;

    // 3. FINALLY make the request
    const response = await axiosInstance.post('/employees', employeeData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    toast.success('Employee added successfully');
    router.push({ name: 'Employees' });
    
  } catch (error) {
    console.error('Full error:', error);
    
    if (error.response?.status === 401) {
  // Don't clear token blindly!
  toast.error('Unauthorized. Please check your permissions or re-login.');
} else {
  toast.error(error.response?.data?.message || 'Failed to create employee');
}

  } finally {
    isSubmitting.value = false;
  }
};

    const handleApiError = (error) => {
      console.error('API Error:', error)
      
      if (error.response) {
        // The request was made and the server responded with a status code
        const message = error.response.data?.message || 
                       error.response.data?.error ||
                       'Failed to process request'
        
        if (error.response.status === 401) {
          localStorage.removeItem('authToken')
          router.push({ name: 'Login' })
          toast.warning('Session expired. Please login again.')
        } else if (error.response.status === 400) {
          // Handle validation errors
          if (error.response.data.errors) {
            error.response.data.errors.forEach(err => {
              toast.error(`${err.param}: ${err.msg}`)
            })
          } else {
            toast.error(message)
          }
        } else {
          toast.error(message)
        }
      } else if (error.request) {
        // The request was made but no response was received
        toast.error('Network error. Please check your connection.')
      } else {
        // Something happened in setting up the request
        toast.error('Request error: ' + error.message)
      }
    }

    const cancelForm = () => {
      router.push({ name: 'Employees' })
    }

    return {
      employee,
      departments,
      positions,
      roles,
      isSubmitting,
      submitForm,
      cancelForm
    }
  }
}
</script>

<style scoped>
/* Your existing styles can remain the same */
.add-employee-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
}

.back-btn {
  display: flex;
  align-items: center;
  color: #4a5568;
  text-decoration: none;
  font-weight: 500;
}

.back-btn:hover {
  color: #2b6cb0;
}

.employee-form {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: #fff;
  color: #4a5568;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 1px #3182ce;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: #fff;
  color: #4a5568;
  cursor: pointer;
}

.cancel-btn:hover {
  background-color: #f7fafc;
}

.submit-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  background-color: #3182ce;
  color: white;
  cursor: pointer;
}

.submit-btn:hover {
  background-color: #2b6cb0;
}

.submit-btn:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}
</style>
