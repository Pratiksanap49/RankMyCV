// src/components/Navbar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const links = [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/history', label: 'History' },
    ];

    const linkBaseClasses = 'px-3 py-2 text-sm font-medium transition-colors duration-150 rounded-md hover:text-primary';
    const activeClasses = 'text-primary font-semibold bg-base-200';

    return (
        <header className="sticky top-0 z-40 bg-base-100/90 backdrop-blur supports-[backdrop-filter]:bg-base-100/80 border-b border-base-300 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 h-35">
                <div className="flex items-center h-16 gap-6">
                    {/* Brand */}
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-3 group"
                    >
                        <div className="relative">
                            <img src="/logo.png" alt="RankMyCV Logo" className="w-12 h-12 object-contain drop-shadow-sm" />
                        </div>
                        <div className="text-left">
                            <span className="block text-xl font-bold tracking-tight text-neutral">
                                Rank<span className="text-primary">My</span>CV
                            </span>
                            <span className="block text-[11px] uppercase tracking-wider text-neutral/60 font-medium">
                                AI Resume Ranking
                            </span>
                        </div>
                    </button>

                    {/* Navigation Links */}
                    <nav className="flex-1 flex items-center">
                        <ul className="flex items-center gap-1">
                            {links.map(link => (
                                <li key={link.to}>
                                    <NavLink
                                        to={link.to}
                                        className={({ isActive }) => `${linkBaseClasses} ${isActive ? activeClasses : 'text-neutral/80'}`}
                                    >
                                        {link.label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Right side actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleLogout}
                            className="btn btn-sm btn-outline border-base-300 hover:border-primary hover:bg-primary hover:text-primary-content"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
            {/* Subtle bottom accent line (gradient) */}
            <div className="h-px w-full bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0" />
        </header>
    );
}

export default Navbar;