import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobService, applicationService } from '../services/api';
import { FaBuilding, FaMapMarkerAlt, FaBriefcase, FaDollarSign, FaClock, FaTasks, FaLightbulb, FaUsers, FaPaperPlane, FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const JobDetailsPage = () => {
  const { jobId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState({ applied: false, message: '', type: '' });
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await jobService.getJobById(jobId);
        setJob(response.data);
        // Increment view count (fire and forget)
        jobService.incrementJobView(jobId).catch(err => console.warn('Failed to increment view count', err));
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError(err.response?.data?.message || 'Failed to load job details.');
      }
      setLoading(false);
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  // Check if candidate has already applied (if user is a candidate)
  useEffect(() => {
    const checkApplication = async () => {
      if (user && user.role === 'candidate' && job) {
        try {
          const res = await applicationService.getMyApplications();
          const existingApplication = res.data.find(app => app.jobId === jobId);
          if (existingApplication) {
            setApplicationStatus({ applied: true, message: `You applied on ${new Date(existingApplication.applicationDate).toLocaleDateString()}`, type: 'info' });
          }
        } catch (err) {
          console.warn('Could not check existing application status', err);
        }
      }
    };
    checkApplication();
  }, [user, job, jobId]);

  const handleApply = async () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (user.role !== 'candidate') {
      setApplicationStatus({ applied: false, message: 'Only candidates can apply for jobs.', type: 'error' });
      return;
    }

    setIsApplying(true);
    setApplicationStatus({ applied: false, message: '', type: '' });
    try {
      // The backend will use the authenticated user's ID as candidateId
      await applicationService.applyForJob({ jobId });
      setApplicationStatus({ applied: true, message: 'Successfully applied for this job!', type: 'success' });
    } catch (err) {
      console.error("Error applying for job:", err);
      setApplicationStatus({ applied: false, message: err.response?.data?.message || 'Failed to apply. You may have already applied or an error occurred.', type: 'error' });
    } finally {
      setIsApplying(false);
    }
  };

  if (authLoading || loading) {
    return <div className="text-center py-10"><p className="text-lg text-gray-600">Loading job details...</p></div>;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <FaTimesCircle className="text-red-500 text-5xl mx-auto mb-4" />
        <p className="text-lg text-red-600 bg-red-100 p-4 rounded-md">Error: {error}</p>
        <Link to="/jobs" className="btn btn-primary mt-6 inline-flex items-center">
          <FaArrowLeft className="mr-2" /> Back to Jobs
        </Link>
      </div>
    );
  }

  if (!job) {
    return <div className="text-center py-10"><p className="text-lg text-gray-600">Job not found.</p></div>;
  }

  const { title, companyName, location: jobLocation, jobType, salaryMin, salaryMax, description, requirements, skills, postedDate, employerId } = job;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link to="/jobs" className="text-primary hover:underline flex items-center">
          <FaArrowLeft className="mr-2" /> Back to all jobs
        </Link>
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="md:flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{title}</h1>
              <p className="text-xl text-gray-600 mb-1">{companyName}</p>
              <div className="flex items-center text-gray-500 text-sm mb-4">
                <FaMapMarkerAlt className="mr-2 text-primary" /> {jobLocation || 'Remote'} 
                <span className="mx-2">|</span>
                <FaBriefcase className="mr-2 text-primary" /> {jobType || 'Full-time'}
                <span className="mx-2">|</span>
                <FaClock className="mr-2 text-primary" /> Posted: {new Date(postedDate).toLocaleDateString()}
              </div>
            </div>
            {user && user.role === 'candidate' && !applicationStatus.applied && (
              <button 
                onClick={handleApply}
                disabled={isApplying}
                className="btn btn-primary py-3 px-6 text-lg w-full md:w-auto mt-4 md:mt-0 flex items-center justify-center disabled:opacity-70"
              >
                <FaPaperPlane className="mr-2" /> {isApplying ? 'Applying...' : 'Apply Now'}
              </button>
            )}
            {user && user.role === 'candidate' && applicationStatus.applied && applicationStatus.type === 'success' && (
                <div className="mt-4 md:mt-0 p-3 rounded-md bg-green-100 text-green-700 flex items-center">
                    <FaCheckCircle className="mr-2" /> {applicationStatus.message}
                </div>
            )}
             {user && user.role === 'candidate' && applicationStatus.applied && applicationStatus.type === 'info' && (
                <div className="mt-4 md:mt-0 p-3 rounded-md bg-blue-100 text-blue-700 flex items-center">
                    <FaCheckCircle className="mr-2" /> {applicationStatus.message}
                </div>
            )}
          </div>

          {applicationStatus.message && applicationStatus.type === 'error' && (
            <div className="mb-6 p-3 rounded-md bg-red-100 text-red-700 flex items-center">
              <FaTimesCircle className="mr-2" /> {applicationStatus.message}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6 mb-8">
          {(salaryMin || salaryMax) && (
            <div className="bg-gray-50 p-4 rounded-lg">
                <FaDollarSign className="text-primary text-2xl mb-2" />
                <h3 className="font-semibold text-gray-700">Salary</h3>
                <p className="text-gray-600">
                {salaryMin && salaryMax ?
                  `$${salaryMin.toLocaleString()} - $${salaryMax.toLocaleString()}` :
                  salaryMin ? `$${salaryMin.toLocaleString()}+` :
                  `Up to $${salaryMax.toLocaleString()}`
                }
                </p>
              </div>
            )}
            <div className="bg-gray-50 p-4 rounded-lg">
              <FaBuilding className="text-primary text-2xl mb-2" />
              <h3 className="font-semibold text-gray-700">Company</h3>
              {/* Link to company profile page if available in future */}
              <p className="text-gray-600">{companyName}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <FaUsers className="text-primary text-2xl mb-2" />
              <h3 className="font-semibold text-gray-700">Employer</h3>
              {/* Link to employer profile page if available in future */}
              <p className="text-gray-600">
              {employerId?.name || 'Employer Information'}
              {employerId?.email && (
                <span className="block text-sm text-gray-500">{employerId.email}</span>
              )}
              )}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center"><FaTasks className="mr-3 text-primary"/>Job Description</h2>
            <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: description?.replace(/\n/g, '<br />') || 'No description provided.' }}></div>
          </div>

          {requirements && requirements.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center"><FaLightbulb className="mr-3 text-primary"/>Requirements</h2>
              <ul className="list-disc list-inside pl-5 text-gray-700 space-y-1">
                {requirements.map((req, index) => <li key={index}>{req}</li>)}
              </ul>
            </div>
          )}

          {skills && skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span key={index} className="bg-secondary text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {user && user.role === 'candidate' && !applicationStatus.applied && (
             <div className="mt-8 pt-6 border-t border-gray-200">
                <button 
                    onClick={handleApply}
                    disabled={isApplying}
                    className="btn btn-primary py-3 px-8 text-lg w-full md:w-auto flex items-center justify-center disabled:opacity-70"
                >
                    <FaPaperPlane className="mr-2" /> {isApplying ? 'Submitting Application...' : 'Apply for this Job'}
                </button>
             </div>
          )}
           {user && user.role === 'candidate' && applicationStatus.applied && (
             <div className="mt-8 pt-6 border-t border-gray-200">
                <p className={`p-3 rounded-md ${applicationStatus.type === 'success' || applicationStatus.type === 'info' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} flex items-center`}>
                    {applicationStatus.type === 'success' || applicationStatus.type === 'info' ? <FaCheckCircle className="mr-2" /> : <FaTimesCircle className="mr-2" />}
                    {applicationStatus.message}
                </p>
                {applicationStatus.applied && (
                    <Link to="/candidate/applications" className="mt-4 inline-block text-primary hover:underline">
                        View your applications
                    </Link>
                )}
             </div>
          )}
          {user && user.role === 'employer' && user._id === (employerId?._id || employerId) && (
            <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 class="text-xl font-semibold text-gray-700 mb-3">Employer Actions</h3>
                <Link to={`/employer/jobs/${jobId}/applications`} className="btn btn-secondary">
                    View Applications ({job.applicationsCount || 0})
                </Link>
                {/* Add Edit Job link here */}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
