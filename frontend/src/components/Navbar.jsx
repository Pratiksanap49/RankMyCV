// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token'); // Clear the token
        navigate('/login'); // Redirect to login page
    };

    return (
        <div className="navbar bg-base-100 shadow-md">
            <div className="flex-1">
                <Link to="/dashboard" className="btn btn-ghost text-xl">
                    <img src="/logo.png" alt="Logo" className="w-8 h-8" />
                    RankMyCV
                </Link>
            </div>
            <div className="flex-none">
                <ul className="menu menu-horizontal px-1">
                    <li><Link to="/dashboard">Dashboard</Link></li>
                    <li><Link to="/history">History</Link></li>
                    <li><button onClick={handleLogout}>Logout</button></li>
                </ul>
            </div>
        </div>
    );
}

export default Navbar;