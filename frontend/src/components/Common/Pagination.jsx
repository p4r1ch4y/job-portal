import React from 'react';
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

const Pagination = ({ 
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5 // Number of page links to show (excluding prev/next, first/last)
}) => {
  if (totalPages <= 1) return null;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const buttonClass = (isActive = false, isDisabled = false) => 
    `px-3 py-2 mx-1 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out 
    ${isActive ? 'bg-primary text-white cursor-default' : 'bg-white text-gray-700 hover:bg-gray-100'} 
    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center my-8">
      <button 
        onClick={() => handlePageChange(1)} 
        disabled={currentPage === 1}
        className={`${buttonClass(false, currentPage === 1)} flex items-center`}
        aria-label="Go to first page"
      >
        <FaAngleDoubleLeft />
      </button>
      <button 
        onClick={() => handlePageChange(currentPage - 1)} 
        disabled={currentPage === 1}
        className={`${buttonClass(false, currentPage === 1)} flex items-center ml-1`}
        aria-label="Go to previous page"
      >
        <FaChevronLeft className="mr-1" /> Prev
      </button>

      {pageNumbers.map((page, index) => (
        typeof page === 'number' ? (
          <button 
            key={index} 
            onClick={() => handlePageChange(page)} 
            className={buttonClass(currentPage === page, false)}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        ) : (
          <span key={index} className="px-3 py-2 mx-1 text-gray-500">{page}</span>
        )
      ))}

      <button 
        onClick={() => handlePageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
        className={`${buttonClass(false, currentPage === totalPages)} flex items-center mr-1`}
        aria-label="Go to next page"
      >
        Next <FaChevronRight className="ml-1" />
      </button>
      <button 
        onClick={() => handlePageChange(totalPages)} 
        disabled={currentPage === totalPages}
        className={`${buttonClass(false, currentPage === totalPages)} flex items-center`}
        aria-label="Go to last page"
      >
        <FaAngleDoubleRight />
      </button>
    </nav>
  );
};

export default Pagination;