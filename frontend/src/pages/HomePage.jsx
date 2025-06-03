import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaBuilding, FaMapMarkerAlt, FaBriefcase, FaUserPlus, FaExternalLinkAlt, FaGlobe } from 'react-icons/fa';
import { jobService } from '../services/api';
import { externalJobsService } from '../services/externalJobsApi';

const JobCard = ({ job }) => {
  const isExternal = job.isExternal || job.source !== 'internal';

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 relative">
      {isExternal && (
        <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
          <FaGlobe className="mr-1" size={10} />
          External
        </div>
      )}
      <div className="flex items-center mb-3">
        <div className="bg-primary text-white rounded-full p-3 mr-4">
          <FaBriefcase size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 hover:text-primary transition-colors">
            {isExternal && job.apply_link ? (
              <a
                href={job.apply_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                {job.title}
                <FaExternalLinkAlt className="ml-2" size={14} />
                </a>
            ) : isExternal && !job.apply_link ? (
              <span className="text-gray-600">{job.title}</span>
            ) : (
              <Link to={`/jobs/${job._id || job.id}`}>{job.title}</Link>
            )}
          </h3>
          <p className="text-gray-600 text-sm">{job.companyName || job.company || 'N/A'}</p>
        </div>
      </div>
      <div className="text-sm text-gray-500 mb-1 flex items-center">
        <FaMapMarkerAlt className="mr-2 text-primary" /> {job.location || 'Remote'}
      </div>
      <div className="text-sm text-gray-500 mb-3 flex items-center">
        <FaBuilding className="mr-2 text-primary" /> {job.jobType || job.employment_type || 'Full-time'}
      </div>
      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
        {job.description}
      </p>
      {isExternal && job.apply_link ? (
        <a
          href={job.apply_link}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary w-full text-center text-sm py-2 flex items-center justify-center"
        >
          Apply Now <FaExternalLinkAlt className="ml-2" size={12} />
          </a>
      ) : isExternal && !job.apply_link ? (
            <button
            disabled
            className="btn btn-gray w-full text-center text-sm py-2 cursor-not-allowed opacity-50"
            >
            Apply Link Not Available
            </button>
      ) : (
        <Link
          to={`/jobs/${job._id || job.id}`}
          className="btn btn-primary w-full text-center text-sm py-2"
        >
          View Details
        </Link>
      )}
    </div>
  );
};

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [recentJobs, setRecentJobs] = useState([]);
  const [externalJobs, setExternalJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingExternal, setLoadingExternal] = useState(false);
  const [error, setError] = useState(null);
  const [showExternalJobs, setShowExternalJobs] = useState(false);

  useEffect(() => {
    const fetchRecentJobs = async () => {
      try {
        setLoading(true);
        // Fetch latest 6 jobs, sorted by postedDate descending
        const response = await jobService.getJobs({ pageSize: 6, sort: '-postedDate' });
        setRecentJobs(response.data.jobs || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching recent jobs:", err);
        setError(err.response?.data?.message || 'Failed to load recent jobs.');
        setRecentJobs([]); // Clear jobs on error
      } finally {
        setLoading(false);
      }
    };
    fetchRecentJobs();
  }, []);

  const fetchExternalJobs = async () => {
    try {
      setLoadingExternal(true);
      const response = await externalJobsService.getTrending({ limit: 6 });
      setExternalJobs(response.data || []);
    } catch (err) {
      console.error("Error fetching external jobs:", err);
      // Don't show error for external jobs, just log it
    } finally {
      setLoadingExternal(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.append('search', searchTerm);
    if (location) queryParams.append('location', location);
    // navigate(`/jobs?${queryParams.toString()}`); // Requires useNavigate from react-router-dom
    window.location.href = `/jobs?${queryParams.toString()}`;
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-6 rounded-lg shadow-xl">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Dream Job Today</h1>
          <p className="text-lg md:text-xl mb-8">Search thousands of job openings from top companies.</p>
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Job title, keywords, or company"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-700"
              />
            </div>
            <div className="flex-grow relative">
              <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Location (e.g., city, state)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-700"
              />
            </div>
            <button type="submit" className="btn btn-primary py-3 px-6 w-full md:w-auto">
              Search Jobs
            </button>
          </form>
        </div>
      </section>

      {/* Recent Jobs Section */}
      <section>
        <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800">Recent Job Postings</h2>
        {loading && <p className="text-center text-gray-600">Loading jobs...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && recentJobs.length === 0 && (
          <p className="text-center text-gray-600">No recent jobs found. Check back later!</p>
        )}
        {!loading && !error && recentJobs.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentJobs.map(job => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
        {!loading && !error && recentJobs.length > 0 && (
            <div className="text-center mt-10">
                <Link to="/jobs" className="btn btn-secondary text-lg px-8 py-3">
                    View All Jobs
                </Link>
            </div>
        )}
      </section>

      {/* External Jobs Section */}
      <section className="mt-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-800">Jobs from Around the Web</h2>
          <button
            onClick={() => {
              setShowExternalJobs(!showExternalJobs);
              if (!showExternalJobs && externalJobs.length === 0) {
                fetchExternalJobs();
              }
            }}
            className="btn btn-secondary flex items-center"
          >
            <FaGlobe className="mr-2" />
            {showExternalJobs ? 'Hide External Jobs' : 'Show External Jobs'}
          </button>
        </div>

        {showExternalJobs && (
          <>
            {loadingExternal && <p className="text-center text-gray-600">Loading external jobs...</p>}
            {!loadingExternal && externalJobs.length === 0 && (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <FaGlobe size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg mb-2">External job integration not available</p>
                <p className="text-gray-500 text-sm">Configure API keys to enable external job listings.</p>
              </div>
            )}
            {!loadingExternal && externalJobs.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {externalJobs.map((job, index) => (
                  <JobCard key={job.id || index} job={job} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* How It Works Section (Placeholder) */}
      <section className="bg-gray-100 py-16 px-6 rounded-lg">
        <h2 className="text-3xl font-semibold mb-10 text-center text-gray-800">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="bg-primary text-white rounded-full p-4 inline-block mb-4">
              <FaUserPlus size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-700">1. Create Account</h3>
            <p className="text-gray-600 text-sm">Sign up as a candidate or employer to get started.</p>
          </div>
          <div className="p-6">
            <div className="bg-primary text-white rounded-full p-4 inline-block mb-4">
              <FaSearch size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-700">2. Search or Post</h3>
            <p className="text-gray-600 text-sm">Candidates can search for jobs, employers can post openings.</p>
          </div>
          <div className="p-6">
            <div className="bg-primary text-white rounded-full p-4 inline-block mb-4">
              <FaBriefcase size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-700">3. Apply & Hire</h3>
            <p className="text-gray-600 text-sm">Apply to jobs or review applications to find your match.</p>
          </div>
        </div>
      </section>

      {/* Call to Action (Placeholder) */}
      <section className="text-center py-12">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-800">Ready to Take the Next Step?</h2>
        <div className="space-x-0 md:space-x-4 space-y-4 md:space-y-0">
          <Link to="/register?role=candidate" className="btn btn-primary text-lg px-8 py-3 inline-block w-full sm:w-auto">
            Join as Candidate
          </Link>
          <Link to="/register?role=employer" className="btn btn-secondary text-lg px-8 py-3 inline-block w-full sm:w-auto">
            Join as Employer
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
