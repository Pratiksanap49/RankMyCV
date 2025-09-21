// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await API.post('/auth/login', formData);
            localStorage.setItem('token', response.data.token);
            navigate('/dashboard');
        } catch (err){
            const message = err.response?.data?.message || "Login failed. Please try again.";
        setError(message);
    } finally {
        setLoading(false);
    }
};

    return (<div className="grid w-full min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left Side: Branding */}
        <div className="hidden lg:flex flex-col items-center justify-center bg-base-200 p-12 text-center">
            <img src="/logo.png" alt="RankMyCV Logo" className="w-28 mb-6 drop-shadow-md" />
            <h1 className="text-4xl font-bold text-gray-800">RankMyCV</h1>
            <p className="mt-3 max-w-md text-lg text-gray-600">
                AI-Powered Resume Screening to Find the Perfect Candidate, Faster.
            </p>
            
        </div>

        {/* Right Side: Login Form */}
        <div className="flex items-center justify-center bg-gradient-to-br from-base-200 to-base-100 p-6">
            <div className="w-full max-w-md">
                <div className="card bg-white/90 backdrop-blur-xl shadow-2xl border border-base-300 rounded-2xl">
                    <form onSubmit={handleSubmit} className="card-body px-8 py-10">
                        {/* Title */}
                        <h2 className="mb-6 text-3xl font-extrabold text-center text-gray-800">
                            HR Portal Login
                        </h2>

                        {/* Error message */}
                        {error && (
                            <div
                                role="alert"
                                className="mb-4 flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-red-700 shadow-sm"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 8v4m0 4h.01M12 18a6 6 0 100-12 6 6 0 000 12z"
                                    />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Email */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Company Email</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="you@company.com"
                                className="input input-bordered w-full rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Password */}
                        {/* Password */}
                        <div className="form-control mt-4 relative">
                            <label className="label flex justify-between">
                                <span className="label-text font-medium">Password</span>
                                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                                    Forgot?
                                </Link>
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="••••••••"
                                className="input input-bordered w-full rounded-xl pr-12 focus:ring-2 focus:ring-primary focus:outline-none"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-[52px] text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.782-4.419M6.21 6.21A9.956 9.956 0 012 12c1.274 4.057 5.064 7 9.542 7a9.956 9.956 0 004.42-1.184M9.88 9.88a3 3 0 104.24 4.24" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Submit Button */}
                        <div className="form-control mt-8">
                            <button
                                type="submit"
                                className="btn btn-primary rounded-xl shadow-md hover:shadow-lg transition duration-200"
                                disabled={loading}
                            >
                                {loading && <span className="loading loading-spinner"></span>}
                                Login
                            </button>
                        </div>

                        {/* Register Link */}
                        <p className="mt-6 text-center text-sm text-gray-600">
                            Don’t have an account?{" "}
                            <Link to="/register" className="font-semibold text-primary hover:underline">
                                Register Here
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    </div>

);
}

export default Login;