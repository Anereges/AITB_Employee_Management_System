import AdminLayout from '@/layouts/AdminLayout.vue'

export default [
  {
    path: '/admin',
    component: AdminLayout,
    //meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('@/pages/admin/Dashboard.vue')
      },
      {
        path: 'system-settings',
        name: 'SystemSettings',
        component: () => import('@/pages/admin/Settings.vue')
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('@/pages/admin/Analytics.vue')
      },

      {
        path: 'positions',
        name: 'Positions',
        component: () => import('@/pages/admin/Positions.vue')
      },

      {
        path: 'leave-requests',
        name: 'LeaveRequests',
        component: () => import('@/pages/admin/LeaveRequests.vue')
      },

      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/pages/dashboard/Reports.vue')
      },

      {
        path: 'branches',
        name: 'Branches',
        component: () => import('@/pages/dashboard/Branches.vue')
      }

      
    ]
  }
]