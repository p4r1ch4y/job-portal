import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-6 text-center">
      <div className="bg-white p-10 md:p-16 rounded-xl shadow-2xl max-w-lg w-full">
        <FaExclamationTriangle className="text-8xl text-yellow-400 mx-auto mb-6" />
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
        <p className="text-gray-600 mb-8 text-lg">
          Oops! The page you're looking for doesn't seem to exist. 
          It might have been moved, deleted, or maybe you just mistyped the URL.
        </p>
        <Link 
          to="/"
          className="btn btn-primary btn-lg inline-flex items-center group"
        >
          <FaHome className="mr-2 transition-transform duration-300 group-hover:scale-110" />
          Go to Homepage
        </Link>
        <p className="mt-10 text-sm text-gray-500">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;