// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/register';
import './App.css'; 

function App() {
  return (
    <div>
      <Routes>
        {/* The default route can also be the login page */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* We will add Dashboard and other routes here later */}
      </Routes>
    </div>
  );
}

export default App;