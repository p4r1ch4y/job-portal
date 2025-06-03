import React, { useState, useEffect } from 'react';
import {
  FaCheckCircle,      // Success
  FaTimesCircle,      // Error
  FaInfoCircle,       // Info
  FaExclamationTriangle // Warning
} from 'react-icons/fa';

const AlertMessage = ({ 
  type = 'info', // 'success', 'error', 'warning', 'info'
  message,
  duration = 5000, // Auto-dismiss duration in ms. 0 for no auto-dismiss.
  onClose, // Callback when alert is closed (either by button or auto-dismiss)
  showIcon = true,
  isDismissible = true,
  title = '',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]); // Re-run if duration changes, though typically it won't

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  if (!isVisible || !message) return null;

  const alertStyles = {
    success: {
      bgColor: 'bg-green-50', 
      borderColor: 'border-green-400', 
      textColor: 'text-green-700',
      icon: <FaCheckCircle />,
      defaultTitle: 'Success'
    },
    error: {
      bgColor: 'bg-red-50', 
      borderColor: 'border-red-400', 
      textColor: 'text-red-700',
      icon: <FaTimesCircle />,
      defaultTitle: 'Error'
    },
    warning: {
      bgColor: 'bg-yellow-50', 
      borderColor: 'border-yellow-400', 
      textColor: 'text-yellow-700',
      icon: <FaExclamationTriangle />,
      defaultTitle: 'Warning'
    },
    info: {
      bgColor: 'bg-blue-50', 
      borderColor: 'border-blue-400', 
      textColor: 'text-blue-700',
      icon: <FaInfoCircle />,
      defaultTitle: 'Information'
    },
  };

  const currentStyle = alertStyles[type] || alertStyles.info;
  const displayTitle = title || currentStyle.defaultTitle;

  return (
    <div 
      className={`p-4 border-l-4 rounded-md shadow-md flex items-start space-x-3 ${currentStyle.bgColor} ${currentStyle.borderColor} ${currentStyle.textColor} ${className}`}
      role="alert"
    >
      {showIcon && <span className="text-xl mt-0.5">{currentStyle.icon}</span>}
      <div className="flex-1">
        {displayTitle && <h3 className="font-semibold text-md mb-1">{displayTitle}</h3>}
        <p className="text-sm">{message}</p>
      </div>
      {isDismissible && (
        <button 
          onClick={handleClose} 
          className={`ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg inline-flex h-8 w-8 ${currentStyle.bgColor} ${currentStyle.textColor} hover:bg-opacity-80 focus:ring-2 focus:ring-offset-2 ${currentStyle.borderColor.replace('border-', 'focus:ring-')}`}
          aria-label="Dismiss"
        >
          <span className="sr-only">Dismiss</span>
          <FaTimesCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default AlertMessage;