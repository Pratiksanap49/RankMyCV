// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// Correct relative path to shared axios instance
import API from './api';

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Client-side validation for matching passwords
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const { name, email, password } = formData;
            // Call the register endpoint
            const response = await API.post('/auth/register', { name, email, password });

            // On successful registration, the backend sends a token
            localStorage.setItem('token', response.data.token);

            // Redirect to the main dashboard
            navigate('/dashboard');

        } catch (err) {
            const message = err.response?.data?.message || "Registration failed. Please try again.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid w-full min-h-screen grid-cols-1 lg:grid-cols-2">
            {/* Left Side: Branding */}
            <div className="hidden lg:flex flex-col items-center justify-center bg-base-200 p-12 text-center">
                <img src="/logo.png" alt="RankMyCV Logo" className="w-28 mb-6 drop-shadow-md" />
                <h1 className="text-4xl font-bold">Welcome to RankMyCV</h1>
                <p className="mt-3 max-w-md text-lg text-gray-600">
                    Join us to streamline your hiring process with the power of AI.
                </p>
            </div>

            {/* Right Side: Register Form */}
            <div className="flex items-center justify-center bg-gradient-to-br from-base-200 to-base-100 p-6">
                <div className="w-full max-w-md">
                    <div className="card bg-white/90 backdrop-blur-xl shadow-2xl border border-base-300 rounded-2xl">
                        <form onSubmit={handleSubmit} className="card-body px-8 py-10">
                            <h2 className="mb-6 text-3xl font-extrabold text-center text-gray-800">
                                Create Your Account
                            </h2>

                            {error && (
                                <div role="alert" className="mb-4 flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-red-700 shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M12 18a6 6 0 100-12 6 6 0 000 12z" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Name Input */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Full Name</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="e.g., Jane Doe"
                                    className="input input-bordered w-full rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Email Input */}
                            <div className="form-control mt-4">
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

                            {/* Password Input */}
                            <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text font-medium">Password</span>
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    className="input input-bordered w-full rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Confirm Password Input */}
                            <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text font-medium">Confirm Password</span>
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="••••••••"
                                    className="input input-bordered w-full rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="form-control mt-8">
                                <button type="submit" className="btn btn-primary rounded-xl shadow-md hover:shadow-lg transition duration-200" disabled={loading}>
                                    {loading && <span className="loading loading-spinner"></span>}
                                    Create Account
                                </button>
                            </div>

                            {/* Login Link */}
                            <p className="mt-6 text-center text-sm text-gray-600">
                                Already have an account?{" "}
                                <Link to="/login" className="font-semibold text-primary hover:underline">
                                    Login Here
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;