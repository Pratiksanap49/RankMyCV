// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
    const token = localStorage.getItem('token');

    // If a token exists, render the child route (e.g., the Dashboard)
    if (token) {
        return <Outlet />;
    }

    // If no token, redirect to the login page
    return <Navigate to="/login" />;
}

export default ProtectedRoute;