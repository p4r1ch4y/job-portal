import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaBriefcase, FaUserCircle, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaTachometerAlt, FaPlusCircle } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeStyle = "text-primary border-b-2 border-primary";
  const inactiveStyle = "hover:text-primary transition-colors duration-200";

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary flex items-center">
          <FaBriefcase className="mr-2" /> JobPortal
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <NavLink to="/" className={({ isActive }) => isActive ? activeStyle : inactiveStyle} end>
            Home
          </NavLink>
          <NavLink to="/jobs" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
            Find Jobs
          </NavLink>
          {/* Add more public links here if needed */}
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {user.role === 'employer' && (
                <NavLink 
                  to="/employer/dashboard" 
                  className={({ isActive }) => `flex items-center ${isActive ? activeStyle : inactiveStyle}`}
                >
                  <FaTachometerAlt className="mr-1" /> Dashboard
                </NavLink>
              )}
              {user.role === 'candidate' && (
                <NavLink 
                  to="/candidate/dashboard" 
                  className={({ isActive }) => `flex items-center ${isActive ? activeStyle : inactiveStyle}`}
                >
                  <FaTachometerAlt className="mr-1" /> Dashboard
                </NavLink>
              )}
              {user.role === 'employer' && (
                 <NavLink 
                  to="/employer/post-job" 
                  className={({ isActive }) => `flex items-center ${isActive ? activeStyle : inactiveStyle}`}
                >
                  <FaPlusCircle className="mr-1" /> Post Job
                </NavLink>
              )}
               {user.role === 'candidate' && (
                <NavLink 
                  to="/candidate/profile" 
                  className={({ isActive }) => `flex items-center ${isActive ? activeStyle : inactiveStyle}`}
                >
                  <FaUserCircle className="mr-1" /> Profile
                </NavLink>
              )}
              <button 
                onClick={handleLogout} 
                className="btn btn-primary py-2 px-3 text-sm flex items-center"
              >
                <FaSignOutAlt className="mr-1" /> Logout
              </button>
            </>
          ) : (
            <>
              <NavLink 
                to="/login" 
                className={({ isActive }) => `flex items-center ${isActive ? activeStyle : inactiveStyle}`}
              >
                <FaSignInAlt className="mr-1" /> Login
              </NavLink>
              <NavLink 
                to="/register" 
                className="btn btn-primary py-2 px-3 text-sm flex items-center"
              >
                <FaUserPlus className="mr-1" /> Register
              </NavLink>
            </>
          )}
        </div>
        {/* Mobile Menu Button (optional, for future enhancement) */}
        {/* <div className="md:hidden">
          <button>Menu</button>
        </div> */}
      </div>
    </nav>
  );
};

export default Navbar;