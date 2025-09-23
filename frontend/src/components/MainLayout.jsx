import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

function MainLayout() {
    return (
        <div>
            <Navbar />
            <main className="p-6 bg-base-200">
                <Outlet />
            </main>
        </div>
    );
}

export default MainLayout;