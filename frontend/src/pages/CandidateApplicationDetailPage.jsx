import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationService } from '../services/api';
import { FaBriefcase, FaBuilding, FaCalendarAlt, FaFileAlt, FaHourglassHalf, FaCheckCircle, FaTimesCircle, FaSpinner, FaArrowLeft } from 'react-icons/fa';

const CandidateApplicationDetailPage = () => {
  const { applicationId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      if (!user || user.role !== 'candidate') {
        setError('You must be logged in as a candidate.');
        setLoading(false);
        return;
      }
      if (!applicationId) {
        setError('Application ID is missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await applicationService.getApplicationById(applicationId);
        setApplication(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch application details:', err);
        setError(err.response?.data?.message || 'Failed to load application details.');
        setApplication(null);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
        fetchApplicationDetails();
    }
  }, [applicationId, user, authLoading]);

  const getStatusInfo = (status) => {
    status = status?.toLowerCase();
    switch (status) {
      case 'pending':
        return { text: 'Pending', icon: <FaHourglassHalf className="mr-2 text-yellow-500" />, color: 'text-yellow-700 bg-yellow-100' };
      case 'viewed':
        return { text: 'Viewed by Employer', icon: <FaHourglassHalf className="mr-2 text-blue-500" />, color: 'text-blue-700 bg-blue-100' };
      case 'shortlisted':
        return { text: 'Shortlisted', icon: <FaCheckCircle className="mr-2 text-teal-500" />, color: 'text-teal-700 bg-teal-100' };
      case 'interviewing':
        return { text: 'Interviewing', icon: <FaCheckCircle className="mr-2 text-indigo-500" />, color: 'text-indigo-700 bg-indigo-100' };
      case 'offered':
        return { text: 'Offer Extended', icon: <FaCheckCircle className="mr-2 text-green-500" />, color: 'text-green-700 bg-green-100' };
      case 'accepted': // Candidate accepted offer
        return { text: 'Offer Accepted', icon: <FaCheckCircle className="mr-2 text-green-600" />, color: 'text-green-800 bg-green-200' };
      case 'rejected': // Rejected by employer or candidate withdrew offer
        return { text: 'Not Selected', icon: <FaTimesCircle className="mr-2 text-red-500" />, color: 'text-red-700 bg-red-100' };
      case 'withdrawn': // Candidate withdrew application
        return { text: 'Application Withdrawn', icon: <FaTimesCircle className="mr-2 text-gray-500" />, color: 'text-gray-700 bg-gray-100' };
      default:
        return { text: status || 'Unknown', icon: <FaFileAlt className="mr-2 text-gray-400" />, color: 'text-gray-700 bg-gray-100' };
    }
  };

  if (authLoading || loading) {
    return <div className="flex justify-center items-center h-screen"><FaSpinner className="animate-spin text-4xl text-primary" /> <span className="ml-3 text-xl">Loading Application Details...</span></div>;
  }

  if (error) {
    return <div className="container mx-auto py-8 px-4 text-center text-red-600">Error: {error}</div>;
  }

  if (!application) {
    return <div className="container mx-auto py-8 px-4 text-center text-gray-600">Application not found.</div>;
  }

  const { jobDetails, jobSnapshot, applicationDate, status, coverLetter } = application;
  const displayJob = jobDetails || jobSnapshot; // Prefer live details, fallback to snapshot
  const statusInfo = getStatusInfo(status);

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg p-8">
        <div className="mb-6">
          <Link to="/candidate/applications" className="text-primary hover:underline flex items-center">
            <FaArrowLeft className="mr-2" /> Back to My Applications
          </Link>
        </div>

        <div className="border-b pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Application for: {displayJob?.title || 'Job Title Not Available'}
          </h1>
          <p className="text-xl text-gray-600 flex items-center mb-1">
            <FaBuilding className="mr-2 text-gray-500" /> {displayJob?.companyName || 'Company Not Available'}
          </p>
          <p className="text-sm text-gray-500 flex items-center">
            <FaCalendarAlt className="mr-2 text-gray-400" /> Applied on: {new Date(applicationDate).toLocaleDateString()}
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Application Status</h2>
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.icon}
            {statusInfo.text}
          </div>
        </div>

        {coverLetter && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Your Cover Letter</h2>
            <div className="p-4 bg-gray-50 rounded-md prose max-w-none text-gray-700 whitespace-pre-wrap">
              {coverLetter}
            </div>
          </div>
        )}

        {displayJob && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Job Details Snapshot</h2>
            <div className="p-4 bg-gray-50 rounded-md space-y-2">
              <p><strong>Location:</strong> {displayJob.location || 'N/A'}</p>
              <p><strong>Type:</strong> {displayJob.jobType || 'N/A'}</p>
              {displayJob.salary && (
                <p><strong>Salary:</strong> 
                  {typeof displayJob.salary === 'number' ? `$${displayJob.salary.toLocaleString()}` : displayJob.salary}
                  {displayJob.salaryPeriod && ` per ${displayJob.salaryPeriod}`}
                </p>
              )}
              <div className="mt-3">
                <Link to={`/jobs/${displayJob._id}`} className="btn btn-outline btn-sm text-primary border-primary hover:bg-primary hover:text-white">
                  View Original Job Posting
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {/* Placeholder for future: Communications / Feedback from employer */}
        {/* <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Communications</h2>
          <p className="text-gray-500 italic">No communications from the employer yet.</p>
        </div> */}

      </div>
    </div>
  );
};

export default CandidateApplicationDetailPage;
