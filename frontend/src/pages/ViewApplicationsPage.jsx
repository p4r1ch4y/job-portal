import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobService, applicationService } from '../services/api';
import { FaUserTie, FaEnvelope, FaPhone, FaFileAlt, FaCalendarAlt, FaSpinner, FaCheck, FaTimes, FaHourglassHalf, FaFilter, FaDownload, FaCheckCircle } from 'react-icons/fa';

const ViewApplicationsPage = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({}); // Tracks loading state for individual status updates
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'shortlisted', 'rejected'

  const fetchJobAndApplications = useCallback(async () => {
    if (!user || user.role !== 'employer') {
      setError('You must be logged in as an employer.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [jobRes, appsRes] = await Promise.all([
        jobService.getJobById(jobId),
        applicationService.getJobApplications(jobId)
      ]);
      setJobDetails(jobRes.data);
      // Ensure applications are for this employer
      if (jobRes.data.employer._id !== user.id && jobRes.data.employer !== user.id) { // Check both populated and unpopulated employer ID
        setError('You are not authorized to view applications for this job.');
        setApplications([]);
      } else {
        setApplications(appsRes.data);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch job and applications:', err);
      setError(err.response?.data?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [jobId, user]);

  useEffect(() => {
    fetchJobAndApplications();
  }, [fetchJobAndApplications]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [applicationId]: true }));
    try {
      await applicationService.updateApplicationStatus(applicationId, newStatus);
      setApplications(prevApps => 
        prevApps.map(app => app._id === applicationId ? { ...app, status: newStatus } : app)
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(`Error updating status: ${err.response?.data?.message || 'Please try again.'}`);
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  const getStatusIconAndColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return { icon: <FaHourglassHalf className="text-yellow-500" />, color: 'border-yellow-500', bgColor: 'bg-yellow-50' };
      case 'shortlisted': return { icon: <FaCheck className="text-blue-500" />, color: 'border-blue-500', bgColor: 'bg-blue-50' };
      case 'accepted': return { icon: <FaCheckCircle className="text-green-500" />, color: 'border-green-500', bgColor: 'bg-green-50' };
      case 'rejected': return { icon: <FaTimes className="text-red-500" />, color: 'border-red-500', bgColor: 'bg-red-50' };
      default: return { icon: <FaHourglassHalf className="text-gray-500" />, color: 'border-gray-500', bgColor: 'bg-gray-50' };
    }
  };

  const filteredApplications = applications.filter(app => 
    filterStatus === 'all' || app.status.toLowerCase() === filterStatus
  );

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><FaSpinner className="animate-spin text-4xl text-primary" /> <span className="ml-3 text-xl">Loading Applications...</span></div>;
  }

  if (error) {
    return <div className="container mx-auto py-8 px-4 text-center text-red-600">Error: {error}</div>;
  }

  if (!user || user.role !== 'employer') {
    return <div className="container mx-auto py-8 px-4 text-center text-red-600">Access Denied. Please log in as an employer.</div>;
  }

  if (!jobDetails) {
    return <div className="container mx-auto py-8 px-4 text-center">Job details not found.</div>;
  }

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-primary mb-2">Applications for: {jobDetails.title}</h1>
          <p className="text-gray-600">Manage and review candidates who applied for this position.</p>
          <Link to={`/jobs/${jobId}`} className="text-sm text-blue-600 hover:underline mt-1 inline-block">View Job Posting</Link>
        </div>

        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
          <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <FaFilter className="mr-2" /> Filter by Status:
          </label>
          <select 
              id="statusFilter" 
              className="input-field w-full md:w-1/3"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
          >
              <option value="all">All Applications</option>
              <option value="pending">Pending</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
          </select>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FaUserTie className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-xl text-gray-500">
              {applications.length === 0 
                ? 'No applications received for this job yet.' 
                : 'No applications match the current filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredApplications.map(app => {
              const { icon: statusIcon, color: statusBorderColor, bgColor: statusBgColor } = getStatusIconAndColor(app.status);
              const candidate = app.candidate; // Assuming candidate is populated
              return (
                <div key={app._id} className={`bg-white p-6 rounded-lg shadow-lg border-l-4 ${statusBorderColor} ${statusBgColor} transition-all duration-300 hover:shadow-xl`}>
                  <div className="flex flex-col md:flex-row justify-between items-start">
                    <div className="flex-1">
                      <h2 className="text-2xl font-semibold text-gray-800">
                        {candidate?.fullName || candidate?.user?.name || 'N/A'}
                      </h2>
                      {candidate?.headline && <p className="text-md text-primary italic">{candidate.headline}</p>}
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        {candidate?.user?.email && <p className="flex items-center"><FaEnvelope className="mr-2 text-gray-400" /> {candidate.user.email}</p>}
                        {candidate?.contactNumber && <p className="flex items-center"><FaPhone className="mr-2 text-gray-400" /> {candidate.contactNumber}</p>}
                        <p className="flex items-center"><FaCalendarAlt className="mr-2 text-gray-400" /> Applied on: {new Date(app.applicationDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className={`mt-4 md:mt-0 px-3 py-1.5 rounded-full text-sm font-medium flex items-center ${statusBgColor.replace('bg-', 'text-').replace('-50', '-700')} border ${statusBorderColor}`}>
                      {statusIcon}
                      <span className="ml-2 capitalize">{app.status}</span>
                    </div>
                  </div>

                  {app.coverLetter && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-700">Cover Letter:</h4>
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{app.coverLetter}</p>
                    </div>
                  )}
                  
                  {candidate?.resumeUrl && (
                    <div className="mt-4">
                      <a 
                        href={candidate.resumeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center btn btn-outline btn-sm text-primary border-primary hover:bg-primary hover:text-white"
                      >
                        <FaDownload className="mr-2" /> View Resume
                      </a>
                    </div>
                  )}
                  
                  {candidate?._id && (
                     <div className="mt-3">
                        <Link to={`/candidate/${candidate._id}/profile`} className="text-sm text-blue-600 hover:underline">
                            View Full Profile
                        </Link>
                     </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-2">Update Status:</h4>
                    <div className="flex flex-wrap gap-2">
                      {['pending', 'shortlisted', 'accepted', 'rejected'].map(newStatus => (
                        <button 
                          key={newStatus} 
                          onClick={() => handleStatusUpdate(app._id, newStatus)} 
                          disabled={updatingStatus[app._id] || app.status.toLowerCase() === newStatus.toLowerCase()}
                          className={`btn btn-sm capitalize 
                            ${app.status.toLowerCase() === newStatus.toLowerCase() ? 'btn-active ' + getStatusIconAndColor(newStatus).bgColor.replace('bg-','bg-opacity-50 border ') + getStatusIconAndColor(newStatus).color : 'btn-outline'}
                            ${getStatusIconAndColor(newStatus).color.replace('border-','hover:bg-').replace('-500','-500 hover:text-white')}
                            disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {updatingStatus[app._id] && app.status.toLowerCase() !== newStatus.toLowerCase() ? <FaSpinner className="animate-spin mr-1" /> : getStatusIconAndColor(newStatus).icon} 
                          {newStatus}
                        </button>
                      ))}
                    </div>
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

export default ViewApplicationsPage;