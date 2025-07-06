<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-green-800">Join Our Team</h1>
        <p class="mt-2 text-green-600">Create your account</p>
      </div>

      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="bg-green-600 h-1" :style="`width: ${progress}%`"></div>

        <div class="p-8">
          <!-- Form Error Message -->
          <div v-if="errors.form" class="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {{ errors.form }}
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Full Name -->
            <div>
              <label for="fullName" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  v-model="form.fullName"
                  type="text"
                  id="fullName"
                  required
                  class="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  :class="{ 'border-red-500': errors.fullName }"
                >
              </div>
              <p v-if="errors.fullName" class="mt-1 text-sm text-red-600">{{ errors.fullName }}</p>
            </div>

            <!-- Username -->
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  v-model="form.username"
                  type="text"
                  id="username"
                  required
                  class="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  :class="{ 'border-red-500': errors.username }"
                >
              </div>
              <p v-if="errors.username" class="mt-1 text-sm text-red-600">{{ errors.username }}</p>
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  v-model="form.email"
                  type="email"
                  id="email"
                  required
                  class="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  :class="{ 'border-red-500': errors.email }"
                >
              </div>
              <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
            </div>

            <!-- Phone -->
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  v-model="form.phone"
                  type="tel"
                  id="phone"
                  class="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  :class="{ 'border-red-500': errors.phone }"
                >
              </div>
              <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</p>
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  required
                  class="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  :class="{ 'border-red-500': errors.password }"
                >
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  @click="showPassword = !showPassword"
                >
                  <EyeIcon v-if="showPassword" class="h-5 w-5 text-gray-400" />
                  <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <div class="mt-1 text-xs text-gray-500">
                <p :class="{ 'text-green-600': hasMinLength, 'text-gray-500': !hasMinLength }">✓ 8+ characters</p>
                <p :class="{ 'text-green-600': hasUppercase, 'text-gray-500': !hasUppercase }">✓ 1 uppercase letter</p>
                <p :class="{ 'text-green-600': hasNumber, 'text-gray-500': !hasNumber }">✓ 1 number</p>
              </div>
              <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
            </div>

            <!-- Confirm Password -->
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  id="confirmPassword"
                  required
                  class="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  :class="{ 'border-red-500': errors.confirmPassword }"
                >
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <EyeIcon v-if="showConfirmPassword" class="h-5 w-5 text-gray-400" />
                  <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
            </div>

            <!-- Submit Button -->
            <div>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition disabled:opacity-75 disabled:cursor-not-allowed"
              >
                <span v-if="!isSubmitting">Create Account</span>
                <span v-else class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              </button>
            </div>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              Already have an account?
              <router-link to="/login" class="font-medium text-green-600 hover:text-green-700 transition">
                Sign in
              </router-link>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-8 max-w-sm w-full text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <CheckIcon class="h-6 w-6 text-green-600" />
        </div>
        <h3 class="mt-3 text-lg font-medium text-gray-900">Registration Successful!</h3>
        <div class="mt-2 text-sm text-gray-500">
          <p>Your account has been created successfully.</p>
          <p>Please wait for admin approval before logging in.</p>
          <p>You'll receive an email once your account is activated.</p>
        </div>
        <div class="mt-5">
          <button
            @click="showSuccessModal = false; $router.push('/login')"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { 
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  PhoneIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()

// Form state
const form = ref({
  fullName: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

// UI state
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isSubmitting = ref(false)
const showSuccessModal = ref(false)
const progress = ref(0)
const errors = ref({})

// Password strength indicators
const hasMinLength = computed(() => form.value.password.length >= 8)
const hasUppercase = computed(() => /[A-Z]/.test(form.value.password))
const hasNumber = computed(() => /[0-9]/.test(form.value.password))

// Form validation
const validateForm = () => {
  errors.value = {}

  if (!form.value.fullName.trim()) {
    errors.value.fullName = 'Full name is required'
  }

  if (!form.value.username.trim()) {
    errors.value.username = 'Username is required'
  } else if (!/^[a-zA-Z0-9_]+$/.test(form.value.username)) {
    errors.value.username = 'Username can only contain letters, numbers, and underscores'
  }

  if (!form.value.email.trim()) {
    errors.value.email = 'Email is required'
  } else if (!/^\S+@\S+\.\S+$/.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email'
  }

  if (form.value.phone && !/^[\d\s\-()+]+$/.test(form.value.phone)) {
    errors.value.phone = 'Please enter a valid phone number'
  }

  if (!form.value.password) {
    errors.value.password = 'Password is required'
  } else if (!hasMinLength.value || !hasUppercase.value || !hasNumber.value) {
    errors.value.password = 'Password must be at least 8 characters with one uppercase letter and one number'
  }

  if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  progress.value = 30

  try {
    // 1. Fetch CSRF token
    const csrfResponse = await axios.get('http://localhost:5000/api/csrf-token', {
      withCredentials: true
    })

    const csrfToken = csrfResponse.data.csrfToken

    // 2. Prepare payload WITHOUT role or status
    const payload = {
      fullName: form.value.fullName.trim(),
      username: form.value.username.trim(),
      email: form.value.email.trim().toLowerCase(),
      phone: form.value.phone.trim(),
      password: form.value.password,
      passwordConfirm: form.value.confirmPassword
    }

    progress.value = 60

    // 3. Send registration request
    const response = await axios.post(
      'http://localhost:5000/api/auth/register',
      payload,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        }
      }
    )

    if (response.data.status === 'success') {
      progress.value = 100
      showSuccessModal.value = true
    } else {
      throw new Error(response.data.message || 'Registration failed')
    }
  } catch (error) {
    console.error('Registration error:', error)

    if (error.response?.data?.errors) {
      errors.value = { ...errors.value, ...error.response.data.errors }
    } else if (error.response) {
      errors.value.form = error.response.data?.message || 'Registration failed'
    } else {
      errors.value.form = error.message || 'Network error'
    }
  } finally {
    isSubmitting.value = false
    progress.value = 0
  }
}
</script>


<style scoped>
.registration-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
}

.password-requirements {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #666;
}

.requirement-met {
  color: green;
  font-weight: bold;
}

.error-message {
  color: red;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

.form-error {
  color: red;
  margin-top: 1rem;
  text-align: center;
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.success-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(56, 97, 90, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
}
</style>