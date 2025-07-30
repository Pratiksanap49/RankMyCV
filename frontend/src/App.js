import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Upload from './pages/Upload';
import Results from './pages/Results';
import History from './pages/History';
import Test from './pages/Test';

function App() {
  const token = localStorage.getItem('token');
  console.log('Current token:', token ? 'exists' : 'none');
  console.log('Current pathname:', window.location.pathname);
  
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/upload" /> : <Login />} />
        <Route path="/signup" element={token ? <Navigate to="/upload" /> : <Signup />} />
        <Route path="/upload" element={token ? <Upload /> : <Navigate to="/login" />} />
        <Route path="/results" element={token ? <Results /> : <Navigate to="/login" />} />
        <Route path="/history" element={token ? <History /> : <Navigate to="/login" />} />
        <Route path="/test" element={<Test />} />
        <Route path="/" element={<Navigate to={token ? "/upload" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;