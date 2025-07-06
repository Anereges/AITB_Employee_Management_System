import { useAuthStore } from '@/store/auth'
import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/home', name: 'Home', component: () => import('@/pages/Home.vue'), meta: { public: true, title: 'Home' } },
    { path: '/login', name: 'Login', component: () => import('@/pages/auth/Login.vue'), meta: { public: true, title: 'Login' } },
    { path: '/register', name: 'Register', component: () => import('@/pages/auth/Register.vue'), meta: { public: true, title: 'Register' } },
    { path: '/forgot-password', name: 'ForgotPassword', component: () => import('@/pages/auth/ForgotPassword.vue'), meta: { public: true, title: 'Forgot Password' } },

    {
  path: '/dashboard/admin',
  component: () => import('@/layouts/AdminLayout.vue'),
  meta: { requiresAuth: true, roles: ['admin'] },
  children: [
    { path: '', name: 'AdminDashboard', component: () => import('@/pages/admin/AdminDashboard.vue') },
    { path: 'system-settings', name: 'Settings', component: () => import('@/pages/admin/Settings.vue') },
    { path: 'analytics', name: 'Analytics', component: () => import('@/pages/admin/Analytics.vue') },
    { path: 'employees', name: 'Employee', component: () => import('@/pages/admin/Employees.vue') },
    { path: 'departments', name: 'Department', component: () => import('@/pages/admin/Departments.vue') },
    { path: 'leaverequests', name: 'LeaveRequests', component: () => import('@/pages/admin/LeaveRequests.vue') },
    { path: 'position', name: 'Position', component: () => import('@/pages/admin/Position.vue') },
    { path: 'report', name: 'Report', component: () => import('@/pages/admin/Report.vue') },
    { path: 'about', name: 'About', component: () => import('@/pages/admin/About.vue') },
    { path: 'payroll', name: 'Payroll', component: () => import('@/pages/admin/payroll.vue') },
    { path: 'attendance', name: 'Attendance', component: () => import('@/pages/admin/Attendance.vue'),meta: { requiresAuth: true, roles: ['admin'] } }
  ]
},
   {
  path: '/dashboard/hr',
  component: () => import('@/layouts/DefaultLayout.vue'),
  meta: { requiresAuth: true, roles: ['hr'] },
  children: [
    { path: '', name: 'DashboardHome', component: () => import('@/pages/dashboard/DashboardHome.vue') },
    { path: 'employees', name: 'Employees', component: () => import('@/pages/dashboard/Employees.vue') },
    { path: 'employees/add', name: 'AddEmployee', component: () => import('@/pages/dashboard/AddEmployee.vue') },
    { path: 'departments', name: 'Departments', component: () => import('@/pages/dashboard/Departments.vue') },
    { path: 'positions', name: 'Positions', component: () => import('@/pages/dashboard/Positions.vue') },
    { path: 'attendances', name: 'Attendances', component: () => import('@/pages/dashboard/Attendances.vue') },
    { path: 'leave-requests', name: 'HRLeaveRequests', component: () => import('@/pages/dashboard/LeaveRequests.vue') },
    { path: 'reports', name: 'HRReports', component: () => import('@/pages/dashboard/Reports.vue') },
    { path: 'analytic', name: 'Analytic', component: () => import('@/pages/dashboard/Analytic.vue') },
    { path: 'settings', name: 'HRSettings', component: () => import('@/pages/dashboard/Settings.vue') },
    { path: 'about', name: 'HRAbout', component: () => import('@/pages/dashboard/About.vue') },
  ]
},

    {
  path: '/dashboard/employee',
  component: () => import('@/layouts/EmployeeLayout.vue'),
  meta: { requiresAuth: true, roles: ['employee'] },
  children: [
    { path: '', name: 'EmployeeDashboard', component: () => import('@/pages/employee/EmployeeDashboard.vue') }, // Dashboard home
    { path: 'attendances', name: 'Attendances', component: () => import('@/pages/employee/Attendances.vue') },
    { path: 'leave-requests', name: 'MyLeaveRequests', component: () => import('@/pages/employee/LeaveRequests.vue') },
    { path: 'about', name: 'MyAbout', component: () => import('@/pages/employee/About.vue') },
    { path: 'leave', name: 'Leave', component: () => import('@/pages/dashboard/LeaveRequests.vue'), meta: { title: 'Leave Management' } },
    { path: 'tasks', name: 'MyTasks', component: () => import('@/pages/employee/Tasks.vue') },
    { path: 'schedule', name: 'Schedule', component: () => import('@/pages/employee/Schedule.vue'), meta: { title: 'Schedule' } },
    { path: 'team', name: 'Team', component: () => import('@/pages/employee/Team.vue'), meta: { title: 'Team' } },
    { path: 'reports', name: 'Reports', component: () => import('@/pages/employee/Reports.vue'), meta: { title: 'Reports' } }
  ]
},


    // Error Routes
    {
      path: '/unauthorized',
      name: 'Unauthorized',
      component: () => import('@/pages/errors/Unauthorized.vue'),
      meta: { public: true, title: 'Unauthorized' }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/pages/errors/NotFound.vue'),
      meta: { public: true }
    }
  ],

  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  }
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} | Employee Management`
  }

  // Allow public routes without authentication
  if (to.meta.public) {
    return next()
  }

  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    await authStore.initialize() // Load user from localStorage or API

    if (!authStore.isAuthenticated) {
      return next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  }

  // Check if account is active
  if (!authStore.user?.isActive) {
    return next({
      path: '/login',
      query: {
        redirect: to.fullPath,
        message: 'Your account is pending admin approval'
      }
    })
  }

  // Gather all roles from matched routes (including parents)
  const allowedRoles = to.matched
    .filter(record => record.meta.roles)
    .flatMap(record => record.meta.roles)

  // If route has role restrictions, check user role
  if (allowedRoles.length && !allowedRoles.includes(authStore.userRole)) {
    // Redirect user to their respective dashboard
    switch (authStore.userRole) {
      case 'admin':
        return next('/dashboard/admin')
      case 'hr':
        return next('/dashboard')
      case 'employee':
        return next('/dashboard/employee')
      default:
        return next('/unauthorized')
    }
  }

  // All checks passed, proceed to route
  next()
})

export default router
