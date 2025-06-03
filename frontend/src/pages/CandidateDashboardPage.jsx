import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationService, profileService, jobService } from '../services/api';
import { FaUserEdit, FaFileAlt, FaSearch, FaHeart, FaBriefcase, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaEye, FaUsers, FaChartLine, FaTrophy } from 'react-icons/fa';
import StatCard from '../components/Dashboard/StatCard';



const ApplicationStatusIcon = ({ status }) => {
    switch (status.toLowerCase()) {
        case 'applied': return <FaHourglassHalf className="text-yellow-500" title="Applied" />;
        case 'viewed': return <FaEye className="text-blue-500" title="Viewed by Employer" />;
        case 'shortlisted': return <FaCheckCircle className="text-teal-500" title="Shortlisted" />;
        case 'interviewing': return <FaUsers className="text-indigo-500" title="Interviewing" />;
        case 'offered': return <FaCheckCircle className="text-green-500" title="Offered" />;
        case 'rejected': return <FaTimesCircle className="text-red-500" title="Rejected" />;
        case 'withdrawn': return <FaTimesCircle className="text-gray-500" title="Withdrawn" />;
        default: return <FaFileAlt className="text-gray-400" title={status} />;
    }
};

const CandidateDashboardPage = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalApplications: 0,
    activeProcesses: 0,
    profileCompletion: 0,
    responseRate: 0
  });

  useEffect(() => {
    const fetchCandidateData = async () => {
      if (!user || user.role !== 'candidate') return;
      setLoading(true);
      setError(null);
      try {
        // Fetch candidate's applications
        const appsResponse = await applicationService.getMyApplications();
        const applicationsData = appsResponse.data || [];
        setApplications(applicationsData);

        // Fetch candidate's profile
        try {
            const profileResponse = await profileService.getMyProfile();
            setProfile(profileResponse.data);
        } catch (profileError) {
            if (profileError.response && profileError.response.status === 404) {
                setProfile(null); // Profile not yet created
            } else {
                throw profileError; // Re-throw other errors
            }
        }

        // Fetch recent jobs for recommendations
        try {
            const jobsResponse = await jobService.getJobs({ limit: 5, sort: '-postedDate' });
            setRecentJobs(jobsResponse.data.jobs || []);
        } catch (jobError) {
            console.warn('Failed to fetch recent jobs:', jobError);
        }

        // Calculate stats
        const totalApplications = applicationsData.length;
        const activeProcesses = applicationsData.filter(app =>
          ['shortlisted', 'interviewing', 'offered'].includes(app.status?.toLowerCase())
        ).length;
        const responseRate = totalApplications > 0
          ? Math.round((applicationsData.filter(app => app.status !== 'applied').length / totalApplications) * 100)
          : 0;

        setStats({
          totalApplications,
          activeProcesses,
          profileCompletion: calculateProfileCompletion(profile),
          responseRate
        });

      } catch (err) {
        console.error("Error fetching candidate data:", err);
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
        setApplications([]);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateData();
  }, [user]);

  const calculateProfileCompletion = (profile) => {
    if (!profile) return 0;
    const fields = ['headline', 'skills', 'experience', 'education', 'resumeUrl'];
    const completedFields = fields.filter(field => profile[field] && profile[field].length > 0);
    return Math.round((completedFields.length / fields.length) * 100);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 animate-pulse">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 mt-4 sm:mt-0"></div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-lg">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <p className="text-center py-10">Please log in to view your dashboard.</p>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Candidate Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user.name}!</p>
        </div>
        <Link to="/jobs" className="btn btn-primary mt-4 sm:mt-0 flex items-center">
          <FaSearch className="mr-2" /> Find New Jobs
        </Link>
      </div>

      {error && <p className="text-center text-red-500 bg-red-100 p-4 rounded-md mb-6">{error}</p>}

      {/* Profile Completion Prompt */}
      {!profile && !loading && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-md" role="alert">
          <div className="flex">
            <div className="py-1"><FaUserEdit className="h-6 w-6 text-yellow-500 mr-3" /></div>
            <div>
              <p className="font-bold">Complete Your Profile</p>
              <p className="text-sm">A complete profile increases your chances of getting noticed by employers. </p>
              <Link to="/candidate/profile" className="font-semibold underline hover:text-yellow-800">
                Create or Update Your Profile Now
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Your Activity Overview</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Applications Submitted"
            value={stats.totalApplications}
            icon={<FaFileAlt />}
            colorTheme="blue"
            linkTo="/candidate/applications"
            linkText="View All"
          />
          <StatCard
            title="Active Processes"
            value={stats.activeProcesses}
            icon={<FaTrophy />}
            colorTheme="green"
            linkTo="/candidate/applications?status=active"
            linkText="View Active"
          />
          <StatCard
            title="Profile Completion"
            value={`${stats.profileCompletion}%`}
            icon={<FaUserEdit />}
            colorTheme={stats.profileCompletion < 50 ? "red" : stats.profileCompletion < 80 ? "yellow" : "green"}
            linkTo="/candidate/profile"
            linkText={stats.profileCompletion < 100 ? "Complete Profile" : "Edit Profile"}
          />
          <StatCard
            title="Response Rate"
            value={`${stats.responseRate}%`}
            icon={<FaChartLine />}
            colorTheme="purple"
            linkTo="/candidate/applications"
            linkText="View Details"
          />
        </div>
      </section>

      {/* Recent Applications Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Recent Applications</h2>
        {applications.length === 0 && !loading ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <FaBriefcase size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg mb-2">You haven't applied for any jobs yet.</p>
            <Link to="/jobs" className="btn btn-primary">
              Start Applying Now
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.slice(0, 5).map(app => ( // Show recent 5, link to all applications page
                  <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/jobs/${app.jobId?._id || app.jobId}`} className="text-sm font-medium text-primary hover:underline">
                        {app.jobDetails?.title || app.jobSnapshot?.title || 'Job Title N/A'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.jobDetails?.companyName || app.jobSnapshot?.companyName || 'Company N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(app.applicationDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="flex items-center">
                        <ApplicationStatusIcon status={app.status} />
                        <span className="ml-2 capitalize">{app.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/candidate/applications/${app._id}`} className="text-indigo-600 hover:text-indigo-900">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {applications.length > 5 && (
                <div className="text-center p-4 border-t border-gray-200">
                    <Link to="/candidate/applications" className="text-primary hover:underline font-medium">
                        View All Applications ({applications.length})
                    </Link>
                </div>
            )}
          </div>
        )}
      </section>

      {/* Recommended Jobs Section */}
      <section className="mt-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">Recent Job Opportunities</h2>
          <Link to="/jobs" className="text-primary hover:underline font-medium">
            View All Jobs
          </Link>
        </div>
        {recentJobs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentJobs.map(job => (
              <div key={job._id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{job.title}</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {job.jobType || 'Full-time'}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{job.companyName}</p>
                <p className="text-gray-500 text-sm mb-4">{job.location}</p>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {job.salaryMin && job.salaryMax ?
                      `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}` :
                      'Salary not specified'
                    }
                  </div>
                  <Link
                    to={`/jobs/${job._id}`}
                    className="bg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-primary-dark transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <FaBriefcase size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg mb-2">No recent jobs available</p>
            <Link to="/jobs" className="btn btn-primary">
              Browse All Jobs
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default CandidateDashboardPage;
