import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'primary', fullScreen = false, text = null }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const colorClasses = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    white: 'border-white',
    blue: 'border-blue-500',
    green: 'border-green-500',
    red: 'border-red-500',
    yellow: 'border-yellow-500',
  };

  const spinnerClass = `
    animate-spin rounded-full 
    ${sizeClasses[size] || sizeClasses.md} 
    ${colorClasses[color] || colorClasses.primary}
    border-t-transparent border-4
  `;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex flex-col items-center justify-center z-50">
        <div className={spinnerClass}></div>
        {text && <p className={`mt-4 text-lg font-semibold ${color === 'white' ? 'text-white' : 'text-gray-700'}`}>{text}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={spinnerClass}></div>
      {text && <p className={`mt-2 text-sm ${color === 'white' ? 'text-white' : 'text-gray-600'}`}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;