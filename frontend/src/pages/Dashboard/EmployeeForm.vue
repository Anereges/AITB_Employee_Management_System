<template>
    <div class="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
      <div class="shadow sm:rounded-md sm:overflow-hidden">
        <div class="bg-white py-6 px-4 sm:p-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium leading-6 text-gray-900">
              {{ isEditing ? 'Edit Employee' : 'Add New Employee' }}
            </h3>
            <router-link
              to="/dashboard"
              class="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Cancel
            </router-link>
          </div>
  
          <form @submit.prevent="submitForm" class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <!-- Full Name -->
            <div class="sm:col-span-3">
              <label for="fullName" class="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                v-model="form.fullName"
                type="text"
                id="fullName"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
  
            <!-- Email -->
            <div class="sm:col-span-3">
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                v-model="form.email"
                type="email"
                id="email"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
  
            <!-- Role -->
            <div class="sm:col-span-2">
              <label for="role" class="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                v-model="form.role"
                id="role"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>
            </div>
  
            <!-- Department -->
            <div class="sm:col-span-2">
              <label for="department" class="block text-sm font-medium text-gray-700">
                Department
              </label>
              <input
                v-model="form.department"
                type="text"
                id="department"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
  
            <!-- Position -->
            <div class="sm:col-span-2">
              <label for="position" class="block text-sm font-medium text-gray-700">
                Position
              </label>
              <input
                v-model="form.position"
                type="text"
                id="position"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
  
            <!-- Salary -->
            <div class="sm:col-span-2">
              <label for="salary" class="block text-sm font-medium text-gray-700">
                Salary
              </label>
              <input
                v-model="form.salary"
                type="number"
                id="salary"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
  
            <!-- Hire Date -->
            <div class="sm:col-span-2">
              <label for="hireDate" class="block text-sm font-medium text-gray-700">
                Hire Date
              </label>
              <input
                v-model="form.hireDate"
                type="date"
                id="hireDate"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
  
            <!-- Submit Button -->
            <div class="sm:col-span-6 pt-5">
              <button
                type="submit"
                class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                :disabled="loading"
              >
                {{ loading ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useToast } from '@/composables/useToast';
  import api from '@/services/api';
  
  const { showToast } = useToast();
  const route = useRoute();
  const router = useRouter();
  
  const isEditing = ref(false);
  const loading = ref(false);
  
  const form = ref({
    fullName: '',
    email: '',
    role: 'employee',
    department: '',
    position: '',
    salary: '',
    hireDate: '',
  });
  
  // Load employee data if editing
  const loadEmployee = async (id) => {
    try {
      const response = await api.get(`/employees/${id}`);
      form.value = response.data;
    } catch (error) {
      showToast('error', 'Failed to load employee data');
      router.push('/dashboard');
    }
  };
  
  // Submit form
  const submitForm = async () => {
    loading.value = true;
    try {
      if (isEditing.value) {
        await api.put(`/employees/${route.params.id}`, form.value);
        showToast('success', 'Employee updated successfully');
      } else {
        await api.post('/employees', form.value);
        showToast('success', 'Employee added successfully');
      }
      router.push('/dashboard');
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Operation failed');
    } finally {
      loading.value = false;
    }
  };
  
  // Initialize
  onMounted(() => {
    if (route.params.id) {
      isEditing.value = true;
      loadEmployee(route.params.id);
    }
  });
  </script>