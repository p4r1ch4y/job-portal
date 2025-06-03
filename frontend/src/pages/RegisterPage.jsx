import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUserPlus, FaEnvelope, FaLock, FaUserTie, FaBuilding, FaUser } from 'react-icons/fa';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'candidate', // Default role
    companyName: ''
  });
  const { register, error, setError, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for role in query params (e.g., from HomePage CTA)
    const queryParams = new URLSearchParams(location.search);
    const roleFromQuery = queryParams.get('role');
    if (roleFromQuery && (roleFromQuery === 'candidate' || roleFromQuery === 'employer')) {
      setFormData(prev => ({ ...prev, role: roleFromQuery }));
    }
  }, [location.search]);

  const { name, email, password, confirmPassword, role, companyName } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (role === 'employer' && !companyName.trim()) {
      setError('Company name is required for employers');
      return;
    }

    try {
      const registrationData = { name, email, password, role };
      if (role === 'employer') {
        registrationData.companyName = companyName;
      }
      
      const userData = await register(registrationData);
      // Navigate based on role after successful registration
      if (userData.role === 'employer') {
        navigate('/employer/dashboard');
      } else if (userData.role === 'candidate') {
        navigate('/candidate/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      // Error is already set by AuthContext
      console.error("Registration failed:", err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <FaUserPlus className="mx-auto h-12 w-auto text-primary" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                name="name"
                type="text"
                required
                className="input-field pl-10"
                placeholder="Full Name"
                value={name}
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field pl-10"
                placeholder="Email address"
                value={email}
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="input-field pl-10"
                placeholder="Password"
                value={password}
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="input-field pl-10"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">I am a:</label>
              <select 
                name="role" 
                id="role" 
                value={role} 
                onChange={handleChange} 
                className="input-field appearance-none"
              >
                <option value="candidate">Candidate (Looking for a job)</option>
                <option value="employer">Employer (Looking to hire)</option>
              </select>
            </div>

            {role === 'employer' && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaBuilding className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="companyName"
                  type="text"
                  className="input-field pl-10"
                  placeholder="Company Name"
                  value={companyName}
                  onChange={handleChange}
                  required={role === 'employer'}
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;