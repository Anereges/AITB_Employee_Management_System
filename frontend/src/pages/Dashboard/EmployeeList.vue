<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">Employees</h1>
        <p class="mt-2 text-sm text-gray-700">
          List of all employees in the system
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <router-link
          v-if="authStore.user?.role !== 'employee'"
          to="/dashboard/employee/add"
          class="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          Add Employee
        </router-link>
      </div>
    </div>

    <!-- Filters -->
    <div class="mt-6 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by name, email, or role"
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
      <select
        v-model="departmentFilter"
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      >
        <option value="">All Departments</option>
        <option v-for="dept in departments" :key="dept" :value="dept">
          {{ dept }}
        </option>
      </select>
    </div>

    <!-- Table -->
    <div class="mt-8 flow-root">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table class="min-w-full divide-y divide-gray-300">
            <thead class="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  <button @click="sortBy('fullName')" class="flex items-center">
                    Name
                    <SortIcon :direction="sortConfig.key === 'fullName' ? sortConfig.direction : null" />
                  </button>
                </th>
                <th
                  scope="col"
                  class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Role
                </th>
                <th
                  scope="col"
                  class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Department
                </th>
                <th
                  scope="col"
                  class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Hire Date
                </th>
                <th
                  scope="col"
                  class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Salary
                </th>
                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="employee in paginatedEmployees" :key="employee.id">
                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                  <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0">
                      <img
                        class="h-10 w-10 rounded-full"
                        :src="employee.avatar || placeholderAvatar"
                        alt=""
                      />
                    </div>
                    <div class="ml-4">
                      <div class="font-medium text-gray-900">
                        {{ employee.fullName }}
                      </div>
                      <div class="text-gray-500">{{ employee.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span
                    class="inline-flex rounded-full px-2 text-xs font-semibold leading-5"
                    :class="{
                      'bg-green-100 text-green-800': employee.role === 'admin',
                      'bg-blue-100 text-blue-800': employee.role === 'manager',
                      'bg-gray-100 text-gray-800': employee.role === 'employee',
                    }"
                  >
                    {{ employee.role }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {{ employee.department }}
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {{ formatDate(employee.hireDate) }}
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {{ formatCurrency(employee.salary) }}
                </td>
                <td
                  class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
                >
                  <router-link
                    :to="`/dashboard/employee/${employee.id}`"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="mt-4 flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Showing <span class="font-medium">{{ pagination.startIndex + 1 }}</span> to
        <span class="font-medium">{{ pagination.endIndex }}</span> of
        <span class="font-medium">{{ filteredEmployees.length }}</span> results
      </div>
      <nav
        class="isolate inline-flex -space-x-px rounded-md shadow-sm"
        aria-label="Pagination"
      >
        <button
          @click="prevPage"
          :disabled="pagination.currentPage === 1"
          class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
          :class="{ 'cursor-not-allowed opacity-50': pagination.currentPage === 1 }"
        >
          <span class="sr-only">Previous</span>
          <ChevronLeftIcon class="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          v-for="page in pagination.totalPages"
          :key="page"
          @click="goToPage(page)"
          class="relative inline-flex items-center px-4 py-2 text-sm font-semibold"
          :class="{
            'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600':
              pagination.currentPage === page,
            'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50':
              pagination.currentPage !== page,
          }"
        >
          {{ page }}
        </button>
        <button
          @click="nextPage"
          :disabled="pagination.currentPage === pagination.totalPages"
          class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
          :class="{
            'cursor-not-allowed opacity-50':
              pagination.currentPage === pagination.totalPages,
          }"
        >
          <span class="sr-only">Next</span>
          <ChevronRightIcon class="h-5 w-5" aria-hidden="true" />
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/store/auth';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/20/solid';
import SortIcon from '@/components/ui/SortIcon.vue';
import api from '@/services/api';

const authStore = useAuthStore();
const placeholderAvatar = 'https://via.placeholder.com/150';

// Data
const employees = ref([]);
const searchQuery = ref('');
const departmentFilter = ref('');
const sortConfig = ref({
  key: 'fullName',
  direction: 'asc',
});

// Fetch employees
const fetchEmployees = async () => {
  try {
    const response = await api.get('/employees');
    employees.value = response.data;
  } catch (error) {
    console.error('Failed to fetch employees:', error);
  }
};

// Computed properties
const departments = computed(() => {
  const depts = new Set();
  employees.value.forEach((emp) => depts.add(emp.department));
  return Array.from(depts);
});

const filteredEmployees = computed(() => {
  let result = employees.value;
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (emp) =>
        emp.fullName.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        emp.role.toLowerCase().includes(query)
    );
  }
  if (departmentFilter.value) {
    result = result.filter((emp) => emp.department === departmentFilter.value);
  }
  return result;
});

const sortedEmployees = computed(() => {
  const key = sortConfig.value.key;
  const direction = sortConfig.value.direction;
  return [...filteredEmployees.value].sort((a, b) => {
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });
});

// Pagination
const pagination = ref({
  currentPage: 1,
  itemsPerPage: 10,
  totalPages: computed(() =>
    Math.ceil(filteredEmployees.value.length / pagination.value.itemsPerPage)
  ),
  startIndex: computed(() =>
    (pagination.value.currentPage - 1) * pagination.value.itemsPerPage
  ),
  endIndex: computed(() =>
    Math.min(
      pagination.value.startIndex + pagination.value.itemsPerPage,
      filteredEmployees.value.length
    )
  ),
});

const paginatedEmployees = computed(() =>
  sortedEmployees.value.slice(
    pagination.value.startIndex,
    pagination.value.endIndex
  )
);

// Methods
const sortBy = (key) => {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction =
      sortConfig.value.direction === 'asc' ? 'desc' : 'asc';
  } else {
    sortConfig.value.key = key;
    sortConfig.value.direction = 'asc';
  }
};

const prevPage = () => {
  if (pagination.value.currentPage > 1) {
    pagination.value.currentPage--;
  }
};

const nextPage = () => {
  if (pagination.value.currentPage < pagination.value.totalPages) {
    pagination.value.currentPage++;
  }
};

const goToPage = (page) => {
  pagination.value.currentPage = page;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Lifecycle
onMounted(() => {
  fetchEmployees();
});
</script>