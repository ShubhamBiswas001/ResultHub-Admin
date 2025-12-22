import React from 'react'
import { Navigate } from 'react-router-dom'

const GuestRoute = ({ children }) => {
    const isAuthenticated = sessionStorage.getItem('adminToken')

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

export default GuestRoute
