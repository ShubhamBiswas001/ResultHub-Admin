import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Users = React.lazy(() => import('./views/users/Users'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/users', name: 'Users', element: Users, exact: true },
  { path: '/users/requests', name: 'Requests', element: Users },
  { path: '/users/teachers', name: 'Teachers', element: Users },
  { path: '/users/students', name: 'Students', element: Users },
]

export default routes
