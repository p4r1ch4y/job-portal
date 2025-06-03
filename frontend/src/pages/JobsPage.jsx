import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { jobService } from '../services/api';
import { FaSearch, FaMapMarkerAlt, FaBriefcase, FaFilter, FaTimes, FaBuilding, FaDollarSign, FaClock } from 'react-icons/fa';

const JobCard = ({ job }) => (
  <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
    <div>
      <div className="flex items-start mb-3">
        <div className="bg-primary text-white rounded-lg p-3 mr-4 mt-1">
          <FaBriefcase size={22} />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800 hover:text-primary transition-colors">
            <Link to={`/jobs/${job._id}`}>{job.title}</Link>
          </h3>
          <p className="text-gray-600 text-sm">{job.companyName || 'N/A'}</p>
        </div>
      </div>
      <div className="text-sm text-gray-500 mb-1 flex items-center">
        <FaMapMarkerAlt className="mr-2 text-primary w-4" /> {job.location || 'Remote'}
      </div>
      <div className="text-sm text-gray-500 mb-1 flex items-center">
        <FaBuilding className="mr-2 text-primary w-4" /> {job.jobType || 'Full-time'}
      </div>
      {job.salary && (
         <div className="text-sm text-gray-500 mb-1 flex items-center">
          <FaDollarSign className="mr-2 text-primary w-4" /> 
          {typeof job.salary === 'number' ? `$${job.salary.toLocaleString()}` : job.salary}
          {job.salaryPeriod && ` per ${job.salaryPeriod}`}
        </div>
      )}
      <div className="text-sm text-gray-500 mb-3 flex items-center">
        <FaClock className="mr-2 text-primary w-4" /> Posted {new Date(job.postedDate).toLocaleDateString()}
      </div>
      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
        {job.description}
      </p>
    </div>
    <Link 
      to={`/jobs/${job._id}`} 
      className="btn btn-primary w-full text-center text-sm py-2 mt-auto"
    >
      View Details & Apply
    </Link>
  </div>
);

const JobsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [sortBy, setSortBy] = useState('-postedDate'); // Default sort by newest

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const jobsPerPage = 9;

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (searchLocation) queryParams.append('location', searchLocation);
      if (jobType) queryParams.append('jobType', jobType);
      if (sortBy) queryParams.append('sort', sortBy);
      queryParams.append('page', currentPage);
      queryParams.append('limit', jobsPerPage);

      // Update URL without reloading page
      navigate(`${location.pathname}?${queryParams.toString()}`, { replace: true });

      const response = await jobService.getJobs(Object.fromEntries(queryParams));
      setJobs(response.data.jobs || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalJobs(response.data.totalJobs || 0);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError(err.response?.data?.message || 'Failed to load jobs.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, searchLocation, jobType, sortBy, currentPage, navigate, location.pathname]);

  useEffect(() => {
    // Initialize filters from URL query params on first load
    const queryParams = new URLSearchParams(location.search);
    setSearchTerm(queryParams.get('search') || '');
    setSearchLocation(queryParams.get('location') || '');
    setJobType(queryParams.get('jobType') || '');
    setSortBy(queryParams.get('sort') || '-postedDate');
    setCurrentPage(parseInt(queryParams.get('page')) || 1);
  }, [location.search]); // Only on initial load or if URL query changes directly

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]); // Re-fetch when fetchJobs (and its dependencies) change

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchJobs(); // fetchJobs will use the latest state values
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSearchLocation('');
    setJobType('');
    setSortBy('-postedDate');
    setCurrentPage(1);
    // fetchJobs will be called by its own useEffect due to state changes
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // fetchJobs will be called by its own useEffect
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">Find Your Next Opportunity</h1>

      {/* Search and Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white p-6 rounded-lg shadow-lg mb-8 space-y-4">
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <div className="relative">
            <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
            <FaSearch className="absolute left-3 top-10 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              id="searchTerm"
              placeholder="Job title, company, skills"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          <div className="relative">
            <label htmlFor="searchLocation" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <FaMapMarkerAlt className="absolute left-3 top-10 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              id="searchLocation"
              placeholder="City, state, or remote"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          <div>
            <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
            <select 
              id="jobType" 
              value={jobType} 
              onChange={(e) => setJobType(e.target.value)} 
              className="input-field w-full"
            >
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Temporary">Temporary</option>
            </select>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4 items-end">
            <div>
                <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select 
                id="sortBy" 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)} 
                className="input-field w-full"
                >
                <option value="-postedDate">Newest</option>
                <option value="postedDate">Oldest</option>
                <option value="title">Title (A-Z)</option>
                <option value="-title">Title (Z-A)</option>
                {/* Add salary sort if applicable and data is clean */}
                </select>
            </div>
            <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-end space-y-2 sm:space-y-0 sm:space-x-2 pt-5">
                <button type="submit" className="btn btn-primary w-full sm:w-auto flex items-center justify-center">
                    <FaFilter className="mr-2" /> Apply Filters
                </button>
                <button type="button" onClick={clearFilters} className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 w-full sm:w-auto flex items-center justify-center">
                    <FaTimes className="mr-2" /> Clear Filters
                </button>
            </div>
        </div>
      </form>

      {/* Job Listings */}
      {loading && <p className="text-center text-gray-600 text-lg py-10">Loading jobs...</p>}
      {error && <p className="text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</p>}
      {!loading && !error && jobs.length === 0 && (
        <p className="text-center text-gray-600 text-lg py-10 bg-gray-50 rounded-md">No jobs found matching your criteria. Try broadening your search!</p>
      )}
      {!loading && !error && jobs.length > 0 && (
        <>
          <p className="text-sm text-gray-600 mb-4">Showing {jobs.length} of {totalJobs} jobs.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center space-x-2">
          <button 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          {[...Array(totalPages).keys()].map(num => (
            <button 
              key={num + 1} 
              onClick={() => handlePageChange(num + 1)} 
              className={`px-4 py-2 border rounded-md text-sm font-medium ${currentPage === num + 1 ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
            >
              {num + 1}
            </button>
          ))}
          <button 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default JobsPage;