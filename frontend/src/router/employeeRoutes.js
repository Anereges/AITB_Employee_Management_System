import EmployeeLayout from '@/layouts/EmployeeLayout.vue'

export default [
  {
    path: '/employee',
    component: EmployeeLayout,
    meta: { requiresAuth: true, roles: ['employee', 'hr', 'admin'] },
    children: [
      {
        path: '',
        name: 'EmployeeDashboard',
        component: () => import('@/pages/dashboard/Dashboard.vue')
      },
      
      {
        path: 'attendance',
        name: 'MyAttendance',
        component: () => import('@/pages/dashboard/Attendance.vue')
      },
      {
        path: 'leave',
        name: 'Leave',
        component: () => import('@/pages/dashboard/LeaveRequests.vue'),
        meta: { title: 'Leave Management' }
      }
    ]
  }
]