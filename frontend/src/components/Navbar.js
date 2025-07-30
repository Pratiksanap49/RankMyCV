import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  
  console.log('Navbar - token exists:', !!token);

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">RankMyCV</Link>
      {token ? (
        <>
          <Link to="/">Home</Link>
          <Link to="/upload">Upload</Link>
          <Link to="/results">Results</Link>
          <Link to="/history">History</Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </>
      ) : (
        <>
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </>
      )}
    </nav>
  );
} 