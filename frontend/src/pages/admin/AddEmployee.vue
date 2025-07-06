<template>
  <div class="add-employee-container">
    <h2>Add New Employee</h2>
    <form @submit.prevent="submitForm" class="employee-form" novalidate>
      <!-- Full Name -->
      <div class="form-group">
        <label for="fullName">Full Name:</label>
        <input
          type="text"
          id="fullName"
          v-model="form.fullName"
          required
          maxlength="100"
          class="form-control"
          :class="{ 'input-error': errors.fullName }"
        />
        <span v-if="errors.fullName" class="error-message">{{ errors.fullName }}</span>
      </div>

      <!-- Username -->
      <div class="form-group">
        <label for="username">Username:</label>
        <input
          type="text"
          id="username"
          v-model="form.username"
          required
          minlength="3"
          maxlength="20"
          class="form-control"
          :class="{ 'input-error': errors.username }"
        />
        <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
      </div>

      <!-- Email -->
      <div class="form-group">
        <label for="email">Email:</label>
        <input
          type="email"
          id="email"
          v-model="form.email"
          required
          class="form-control"
          :class="{ 'input-error': errors.email }"
        />
        <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
      </div>

      <!-- Phone -->
      <div class="form-group">
        <label for="phone">Phone:</label>
        <input
          type="tel"
          id="phone"
          v-model="form.phone"
          required
          class="form-control"
          :class="{ 'input-error': errors.phone }"
        />
        <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
      </div>

      <!-- Date of Birth -->
      <div class="form-group">
        <label for="dateOfBirth">Date of Birth:</label>
        <input
          type="date"
          id="dateOfBirth"
          v-model="form.dateOfBirth"
          class="form-control"
          :class="{ 'input-error': errors.dateOfBirth }"
        />
        <span v-if="errors.dateOfBirth" class="error-message">{{ errors.dateOfBirth }}</span>
      </div>

      <!-- Sex -->
<div class="form-group">
  <label for="sex">Sex:</label>
  <select
    id="sex"
    v-model="form.sex" 
    class="form-control"
    :class="{ 'input-error': errors.sex }"
  >
    <option value="" disabled>Select Sex</option>
    <option value="Male">Male</option>
    <option value="Female">Female</option>
    <option value="Other">Other</option>
  </select>
  <span v-if="errors.sex" class="error-message">{{ errors.sex }}</span>
</div>

      <!-- Department (Dropdown) -->
      <div class="form-group">
        <label for="department">Department:</label>
        <select
          id="department"
          v-model="form.department"
          required
          class="form-control"
          :class="{ 'input-error': errors.department }"
        >
          <option value="" disabled>Select Department</option>
          <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
        </select>
        <span v-if="errors.department" class="error-message">{{ errors.department }}</span>
      </div>

      <!-- Position (Dropdown) -->
      <div class="form-group">
        <label for="position">Position:</label>
        <select
          id="position"
          v-model="form.position"
          required
          class="form-control"
          :class="{ 'input-error': errors.position }"
        >
          <option value="" disabled>Select Position</option>
          <option v-for="pos in positions" :key="pos" :value="pos">{{ pos }}</option>
        </select>
        <span v-if="errors.position" class="error-message">{{ errors.position }}</span>
      </div>

      <!-- Role -->
      <div class="form-group">
        <label for="role">Role:</label>
        <select
          id="role"
          v-model="form.role"
          required
          class="form-control"
          :class="{ 'input-error': errors.role }"
        >
          <option value="" disabled>Select Role</option>
          <option value="admin">Admin</option>
          <option value="hr">HR</option>
          <option value="employee">Employee</option>
        </select>
        <span v-if="errors.role" class="error-message">{{ errors.role }}</span>
      </div>

      <!-- Salary -->
      <div class="form-group">
        <label for="salary">Salary:</label>
        <input
          type="number"
          id="salary"
          v-model.number="form.salary"
          required
          min="0"
          class="form-control"
          :class="{ 'input-error': errors.salary }"
        />
        <span v-if="errors.salary" class="error-message">{{ errors.salary }}</span>
      </div>

      <!-- Hire Date -->
      <div class="form-group">
        <label for="hireDate">Hire Date:</label>
        <input
          type="date"
          id="hireDate"
          v-model="form.hireDate"
          class="form-control"
          :class="{ 'input-error': errors.hireDate }"
        />
        <span v-if="errors.hireDate" class="error-message">{{ errors.hireDate }}</span>
      </div>

      <!-- Employment Type -->
      <div class="form-group">
        <label for="employmentType">Employment Type:</label>
        <select
          id="employmentType"
          v-model="form.employmentType"
          class="form-control"
          :class="{ 'input-error': errors.employmentType }"
        >
          <option value="" disabled>Select Employment Type</option>
          <option value="full-time">Full-Time</option>
          <option value="part-time">Part-Time</option>
          <option value="contract">Contract</option>
          <option value="temporary">Temporary</option>
        </select>
        <span v-if="errors.employmentType" class="error-message">{{ errors.employmentType }}</span>
      </div>

      <!-- Password -->
      <div class="form-group">
        <label for="password">Password:</label>
        <input
          type="password"
          id="password"
          v-model="form.password"
          required
          minlength="8"
          class="form-control"
          :class="{ 'input-error': errors.password }"
        />
        <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
      </div>

      <!-- Confirm Password -->
      <div class="form-group">
        <label for="passwordConfirm">Confirm Password:</label>
        <input
          type="password"
          id="passwordConfirm"
          v-model="form.passwordConfirm"
          required
          class="form-control"
          :class="{ 'input-error': errors.passwordConfirm }"
        />
        <span v-if="errors.passwordConfirm" class="error-message">{{ errors.passwordConfirm }}</span>
      </div>

      <!-- Submit Button -->
      <button type="submit" class="btn btn-primary" :disabled="loading">
        <span v-if="loading">Adding...</span>
        <span v-else>Add Employee</span>
      </button>

      <!-- API Success/Error Messages -->
      <div v-if="apiError" class="alert alert-danger mt-3">{{ apiError }}</div>
      <div v-if="apiSuccess" class="alert alert-success mt-3">{{ apiSuccess }}</div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import api from '@/api/axios.js';
  

// Predefined department and position options (customize as needed)
const departments = [
  'Engineering',
  'Human Resources',
  'Sales',
  'Marketing',
  'Finance',
  'Customer Support',
  'IT',
  'Operations',
  'Legal',
  'Research & Development'
];

const positions = [
  'Intern',
  'Junior Developer',
  'Senior Developer',
  'Team Lead',
  'Manager',
  'Director',
  'VP',
  'C-Level Executive',
  'HR Specialist',
  'Sales Representative',
  'Database Administrator',
  'DevOps Engineer',
  'HR Manager',
  'Coder',
  'Business Analyst',
  'Network Engineer',
  'Product Manager',
  'Quality Assurance Engineer',
  'Software Engineer',
  'System Administrator',
  'Technical Support Specialist',
  'UX/UI Designer'
];


// Form data reactive object
const form = reactive({
  fullName: '',
  username: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  sex: '',
  department: '',
  position: '',
  role: '',
  salary: null,
  hireDate: '',
  employmentType: '',
  password: '',
  passwordConfirm: ''
});

// Validation errors reactive object
const errors = reactive({});

// Loading and API feedback states
const loading = ref(false);
const apiError = ref('');
const apiSuccess = ref('');

// Validation function
const validateForm = () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => (errors[key] = ''));

  if (!form.fullName.trim()) errors.fullName = 'Full Name is required.';
  if (!form.username.trim()) errors.username = 'Username is required.';
  if (!form.email.trim()) errors.email = 'Email is required.';
  else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) errors.email = 'Invalid email format.';
  }
  if (!form.phone.trim()) errors.phone = 'Phone is required.';
  else {
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;
    if (!phoneRegex.test(form.phone)) errors.phone = 'Invalid phone format.';
  }
  if (form.dateOfBirth && isNaN(Date.parse(form.dateOfBirth))) errors.dateOfBirth = 'Invalid date.';
  if (form.sex && !['Male', 'Female','other',].includes(form.sex)) errors.sex = 'Invalid gender selection.';
  if (!form.department) errors.department = 'Department is required.';
  if (!form.position) errors.position = 'Position is required.';
  if (!form.role) errors.role = 'Role is required.';
  else if (!['admin', 'hr', 'employee'].includes(form.role)) errors.role = 'Invalid role selected.';
  if (form.salary === null || form.salary === '') errors.salary = 'Salary is required.';
  else if (form.salary < 0) errors.salary = 'Salary cannot be negative.';
  if (form.hireDate && isNaN(Date.parse(form.hireDate))) errors.hireDate = 'Invalid hire date.';
  if (form.employmentType && !['full-time', 'part-time', 'contract', 'temporary'].includes(form.employmentType)) errors.employmentType = 'Invalid employment type.';
  if (!form.password) errors.password = 'Password is required.';
  else if (form.password.length < 8) errors.password = 'Password must be at least 8 characters.';
  if (!form.passwordConfirm) errors.passwordConfirm = 'Password confirmation is required.';
  else if (form.password !== form.passwordConfirm) errors.passwordConfirm = 'Passwords do not match.';

  // Return true if no errors
  return Object.values(errors).every(e => !e);
};

// Submit handler
const submitForm = async () => {
  apiError.value = '';
  apiSuccess.value = '';



  // Validate form before sending data
  if (!validateForm()) return;

  loading.value = true;

  try {
    const payload = {
      fullName: form.fullName.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      dateOfBirth: form.dateOfBirth || undefined,
      sex: form.sex || undefined,
      department: form.department,
      position: form.position,
      role: form.role,
      salary: form.salary,
      hireDate: form.hireDate || undefined,
      employmentType: form.employmentType || undefined,
      password: form.password,
      passwordConfirm: form.passwordConfirm
    };

    // Log the payload before sending the request
    console.log('Payload:', payload);

    // Send request to the backend
    const response = await api.post('/api/admin/employees', payload);

    // Log the successful response
    console.log(response.data);

    apiSuccess.value = 'Employee added successfully!';

    // Reset form and errors
    Object.keys(form).forEach(key => (form[key] = key === 'salary' ? null : ''));
    Object.keys(errors).forEach(key => (errors[key] = ''));

  } catch (error) {
    console.error(error.response?.data || error.message);
    apiError.value = error.response?.data?.message || 'Failed to add employee.';
  } finally {
    loading.value = false;
  }
};

</script>

<style scoped>
.add-employee-container {
  max-width: 700px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
}

.employee-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 1.25rem;
}

label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
}

.form-control {
  width: 100%;
  padding: 0.6rem 0.8rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: border-color 0.3s ease;
}

.form-control:focus {
  border-color: #28a745;
  outline: none;
  box-shadow: 0 0 5px rgba(40, 167, 69, 0.5);
}

.input-error {
  border-color: #dc3545 !important;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.btn-primary {
  background-color: #28a745;
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background-color 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  background-color: #218838;
}

.btn-primary:disabled {
  background-color: #94d3a2;
  cursor: not-allowed;
}

.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  font-weight: 600;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}
</style>
