import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilPeople,
  cilSpeedometer,
} from '@coreui/icons'
import { CNavItem, CNavGroup } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Users',
    to: '/users',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Requests',
        to: '/users/requests',
      },
      {
        component: CNavItem,
        name: 'Teachers',
        to: '/users/teachers',
      },
      {
        component: CNavItem,
        name: 'Students',
        to: '/users/students',
      },
    ],
  },
]

export default _nav
