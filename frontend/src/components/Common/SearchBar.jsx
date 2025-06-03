import React, { useState } from 'react';
import { FaSearch, FaMapMarkerAlt, FaBriefcase } from 'react-icons/fa';

const SearchBar = ({ 
  onSearch,
  initialKeywords = '',
  initialLocation = '',
  initialJobType = '',
  showLocation = true,
  showJobType = false, // Default to false for a more generic search bar
  placeholderText = "Search for jobs...",
  buttonText = "Search"
}) => {
  const [keywords, setKeywords] = useState(initialKeywords);
  const [location, setLocation] = useState(initialLocation);
  const [jobType, setJobType] = useState(initialJobType);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ keywords, location, jobType });
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="w-full bg-white p-4 md:p-6 rounded-lg shadow-lg flex flex-col md:flex-row items-center gap-3 md:gap-4"
    >
      <div className="relative flex-grow w-full md:w-auto">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
        <input 
          type="text" 
          value={keywords} 
          onChange={(e) => setKeywords(e.target.value)} 
          placeholder={placeholderText}
          className="input-field w-full pl-10 pr-3 py-3 text-md"
        />
      </div>

      {showLocation && (
        <div className="relative flex-grow w-full md:w-auto">
          <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
          <input 
            type="text" 
            value={location} 
            onChange={(e) => setLocation(e.target.value)} 
            placeholder="Location (e.g., city, remote)"
            className="input-field w-full pl-10 pr-3 py-3 text-md"
          />
        </div>
      )}

      {showJobType && (
        <div className="relative flex-grow w-full md:w-auto md:max-w-xs">
            <FaBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <select 
                value={jobType} 
                onChange={(e) => setJobType(e.target.value)} 
                className="input-field w-full pl-10 pr-3 py-3 text-md appearance-none"
            >
                <option value="">All Job Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Temporary">Temporary</option>
            </select>
        </div>
      )}

      <button 
        type="submit" 
        className="btn btn-primary w-full md:w-auto px-8 py-3 text-md flex items-center justify-center"
      >
        <FaSearch className="mr-2 md:hidden" /> {buttonText}
      </button>
    </form>
  );
};

export default SearchBar;
