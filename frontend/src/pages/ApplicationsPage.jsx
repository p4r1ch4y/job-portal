import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { applicationService } from '../services/api';
import { Link } from 'react-router-dom';
import { FaBriefcase, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaSpinner, FaSearch } from 'react-icons/fa';

const ApplicationsPage = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'accepted', 'rejected'

  const fetchApplications = useCallback(async () => {
    if (!user || user.role !== 'candidate') {
      setError('You must be logged in as a candidate to view applications.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await applicationService.getMyApplications();
      setApplications(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError(err.response?.data?.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const getStatusIconAndColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { icon: <FaHourglassHalf className="text-yellow-500" />, color: 'text-yellow-600 bg-yellow-100' };
      case 'accepted':
      case 'shortlisted':
        return { icon: <FaCheckCircle className="text-green-500" />, color: 'text-green-600 bg-green-100' };
      case 'rejected':
        return { icon: <FaTimesCircle className="text-red-500" />, color: 'text-red-600 bg-red-100' };
      default:
        return { icon: <FaHourglassHalf className="text-gray-500" />, color: 'text-gray-600 bg-gray-100' };
    }
  };

  const filteredApplications = applications
    .filter(app => 
      (app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       app.job?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(app => 
      filterStatus === 'all' || app.status.toLowerCase() === filterStatus
    );

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><FaSpinner className="animate-spin text-4xl text-primary" /> <span className="ml-3 text-xl">Loading Applications...</span></div>;
  }

  if (error) {
    return <div className="container mx-auto py-8 px-4 text-center text-red-600">Error: {error}</div>;
  }
  
  if (!user || user.role !== 'candidate') {
    return <div className="container mx-auto py-8 px-4 text-center text-red-600">Please log in as a candidate to view your applications.</div>;
  }

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <FaBriefcase className="mx-auto h-12 w-auto text-primary" />
          <h1 className="text-4xl font-bold text-gray-800 mt-4">My Job Applications</h1>
          <p className="text-gray-600 mt-2">Track the status of all your job applications here.</p>
        </div>

        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <div className="grid md:grid-cols-2 gap-4 items-end">
                <div>
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Applications</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            id="search"
                            placeholder="Search by job title or company..."
                            className="input-field w-full pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
                <div>
                    <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                    <select 
                        id="statusFilter" 
                        className="input-field w-full"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow">
            <FaBriefcase className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-xl text-gray-500">You haven't applied for any jobs yet, or no applications match your filters.</p>
            <Link to="/jobs" className="mt-4 inline-block btn btn-primary">
              Find Jobs to Apply
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredApplications.map(app => {
              const { icon, color } = getStatusIconAndColor(app.status);
              return (
                <div key={app._id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <h2 className="text-2xl font-semibold text-primary hover:underline">
                        <Link to={`/jobs/${app.job?._id}`}>{app.job?.title || 'Job Title Not Available'}</Link>
                      </h2>
                      <p className="text-gray-700 text-md">{app.job?.companyName || 'Company Not Available'}</p>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <FaCalendarAlt className="mr-2" /> Applied on: {new Date(app.applicationDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`mt-4 md:mt-0 px-3 py-1.5 rounded-full text-sm font-medium flex items-center ${color}`}>
                      {icon}
                      <span className="ml-2 capitalize">{app.status}</span>
                    </div>
                  </div>
                  {app.coverLetter && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-700">Cover Letter Snippet:</h4>
                        <p className="text-sm text-gray-600 italic mt-1 truncate">
                            {app.coverLetter.substring(0,150)}{app.coverLetter.length > 150 ? '...' : ''}
                        </p>
                    </div>
                  )}
                  <div className="mt-4 text-right">
                    <Link to={`/jobs/${app.job?._id}`} className="btn btn-outline btn-sm">
                      View Job Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsPage;
