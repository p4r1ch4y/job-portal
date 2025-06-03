import React from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed with this action? This cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'danger' // 'danger', 'warning', 'info', 'success'
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return { 
          icon: <FaExclamationTriangle className="text-red-500 text-4xl" />, 
          confirmButtonClass: 'btn-danger',
          titleColor: 'text-red-700'
        };
      case 'warning':
        return { 
          icon: <FaExclamationTriangle className="text-yellow-500 text-4xl" />, 
          confirmButtonClass: 'btn-warning',
          titleColor: 'text-yellow-700'
        };
      case 'success':
        return { 
          icon: <FaCheckCircle className="text-green-500 text-4xl" />, 
          confirmButtonClass: 'btn-success',
          titleColor: 'text-green-700'
        };
      case 'info':
      default:
        return { 
          icon: <FaExclamationTriangle className="text-blue-500 text-4xl" />, // Default to info style icon
          confirmButtonClass: 'btn-primary',
          titleColor: 'text-blue-700'
        };
    }
  };

  const { icon, confirmButtonClass, titleColor } = getVariantStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out" onClick={onClose}>
      <div 
        className="bg-white p-6 md:p-8 rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalShow"
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
      >
        <div className="text-center">
          <div className="mx-auto mb-4 w-fit">
            {icon}
          </div>
          <h2 className={`text-2xl font-bold ${titleColor} mb-3`}>{title}</h2>
          <p className="text-gray-600 text-sm mb-6 whitespace-pre-line">{message}</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className="btn btn-outline w-full sm:w-auto"
          >
            <FaTimesCircle className="mr-2" /> {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isLoading}
            className={`btn ${confirmButtonClass} w-full sm:w-auto flex items-center justify-center`}
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <FaCheckCircle className="mr-2" />
            )}
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes modalShow {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modalShow {
          animation: modalShow 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ConfirmationModal;