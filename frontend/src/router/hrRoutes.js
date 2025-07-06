import HRLayout from '@/layouts/HRLayout.vue'

export default [
  {
    path: '/hr',
    component: HRLayout,
    meta: { requiresAuth: true, roles: ['hr', 'admin'] },
    children: [
      {
        path: '',
        name: 'HRDashboard',
        component: () => import('@/pages/hr/Dashboard.vue')
      },
      {
        path: 'departments',
        name: 'Departments',
        component: () => import('@/pages/dashboard/Departments.vue')
      },

      {
        path: 'employees',
        name: 'EmployeeManagement',
        component: () => import('@/pages/hr/Employees.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/pages/dashboard/Settings.vue')
      },

      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/pages/dashboard/Reports.vue')
      },


      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('@/pages/dashboard/Analytics.vue')
      },

      {
        path: 'positions',
        name: 'Positions',
        component: () => import('@/pages/dashboard/Positions.vue')
      },


      {
        path: 'attendance',
        name: 'AttendanceTracking',
        component: () => import('@/pages/hr/Attendance.vue')
      },
      {
        path: 'leave-requests',
        name: 'LeaveRequests',
        component: () => import('@/pages/dashboard/LeaveRequests.vue')
      }
    ]
  }
]