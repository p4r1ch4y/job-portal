import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobService, analyticsService, applicationService } from '../services/api';
import { FaPlusCircle, FaListAlt, FaChartBar, FaBriefcase, FaUsers, FaEye, FaFileAlt, FaEdit, FaTrash, FaChartLine, FaClock } from 'react-icons/fa';
import StatCard from '../components/Dashboard/StatCard';



const EmployerDashboardPage = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    totalViews: 0,
    activeJobs: 0,
    avgApplicationsPerJob: 0,
    responseRate: 0
  });
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployerData = async () => {
      if (!user || user.role !== 'employer') return;

      setLoadingJobs(true);
      setLoadingStats(true);
      setError(null);

      try {
        // Fetch jobs posted by this employer
        const jobsResponse = await jobService.getEmployerJobs();
        const jobsData = jobsResponse.data.jobs || [];
        setJobs(jobsData);

        // Calculate enhanced stats
        const totalJobs = jobsData.length;
        const activeJobs = jobsData.filter(job => job.isActive).length;
        const totalApplications = jobsData.reduce((sum, job) => sum + (job.applicationsCount || 0), 0);
        const totalViews = jobsData.reduce((sum, job) => sum + (job.views || 0), 0);
        const avgApplicationsPerJob = totalJobs > 0 ? Math.round(totalApplications / totalJobs) : 0;

        // Fetch analytics for this employer (if available)
        try {
          const analyticsResponse = await analyticsService.getJobPostingsAnalytics();
          setStats({
            totalJobs: analyticsResponse.data.totalJobsPosted || totalJobs,
            totalApplications: analyticsResponse.data.totalApplications || totalApplications,
            totalViews: analyticsResponse.data.totalViews || totalViews,
            activeJobs,
            avgApplicationsPerJob,
            responseRate: analyticsResponse.data.responseRate || 0
          });
        } catch (analyticsError) {
          // Fallback to calculated stats if analytics service fails
          setStats({
            totalJobs,
            totalApplications,
            totalViews,
            activeJobs,
            avgApplicationsPerJob,
            responseRate: 0
          });
        }

        // Fetch recent applications for active jobs
        try {
          const recentApps = [];
          for (const job of jobsData.slice(0, 3)) { // Get applications for first 3 jobs
            try {
              const appsResponse = await applicationService.getJobApplications(job._id);
              const apps = appsResponse.data.slice(0, 2); // Get 2 most recent per job
              recentApps.push(...apps.map(app => ({ ...app, jobTitle: job.title })));
            } catch (appError) {
              console.warn(`Failed to fetch applications for job ${job._id}:`, appError);
            }
          }
          setRecentApplications(recentApps.slice(0, 5)); // Limit to 5 total
        } catch (appError) {
          console.warn('Failed to fetch recent applications:', appError);
        }

      } catch (err) {
        console.error("Error fetching employer data:", err);
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
        setJobs([]);
      } finally {
        setLoadingJobs(false);
        setLoadingStats(false);
      }
    };

    fetchEmployerData();
  }, [user]);

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
        return;
    }
    try {
        await jobService.deleteJob(jobId);
        setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
        // Optionally, re-fetch stats or update them locally
        setStats(prev => ({...prev, totalJobs: prev.totalJobs -1}));
        alert('Job deleted successfully.');
    } catch (err) {
        console.error('Error deleting job:', err);
        alert(err.response?.data?.message || 'Failed to delete job.');
    }
  };

  if (!user) {
    return <p className="text-center py-10">Please log in to view your dashboard.</p>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Employer Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user.name}!</p>
        </div>
        <Link to="/employer/post-job" className="btn btn-primary mt-4 sm:mt-0 flex items-center">
          <FaPlusCircle className="mr-2" /> Post New Job
        </Link>
      </div>

      {error && <p className="text-center text-red-500 bg-red-100 p-4 rounded-md mb-6">{error}</p>}

      {/* Stats Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Performance Overview</h2>
        {loadingStats ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Jobs Posted"
              value={stats.totalJobs}
              icon={<FaBriefcase />}
              colorTheme="blue"
              linkTo="/employer/jobs"
              linkText="Manage Jobs"
            />
            <StatCard
              title="Active Jobs"
              value={stats.activeJobs}
              icon={<FaClock />}
              colorTheme="green"
              linkTo="/employer/jobs?status=active"
              linkText="View Active"
            />
            <StatCard
              title="Total Applications"
              value={stats.totalApplications}
              icon={<FaFileAlt />}
              colorTheme="purple"
              linkTo="/employer/applications"
              linkText="Review Applications"
            />
            <StatCard
              title="Avg Applications/Job"
              value={stats.avgApplicationsPerJob}
              icon={<FaChartLine />}
              colorTheme="yellow"
              linkTo="/employer/analytics"
              linkText="View Analytics"
            />
          </div>
        )}
      </section>

      {/* Recent Job Postings Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">Your Job Postings</h2>
            {/* Link to a page with all jobs if many exist */}
        </div>
        {loadingJobs ? (
          <p>Loading your jobs...</p>
        ) : jobs.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <FaBriefcase size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg mb-2">You haven't posted any jobs yet.</p>
            <Link to="/employer/post-job" className="btn btn-primary">
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted On</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map(job => (
                  <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/jobs/${job._id}`} className="text-sm font-medium text-primary hover:underline">
                        {job.title}
                      </Link>
                      <div className="text-xs text-gray-500">{job.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${job.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {job.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link to={`/employer/jobs/${job._id}/applications`} className="text-blue-600 hover:underline">
                            {job.applicationsCount || 0}
                        </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.views || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(job.postedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link to={`/employer/jobs/${job._id}/edit`} className="text-indigo-600 hover:text-indigo-900" title="Edit Job">
                        <FaEdit />
                      </Link>
                      <button onClick={() => handleDeleteJob(job._id)} className="text-red-600 hover:text-red-900" title="Delete Job">
                        <FaTrash />
                      </button>
                       <Link to={`/employer/jobs/${job._id}/applications`} className="text-green-600 hover:text-green-900" title="View Applications">
                        <FaUsers />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent Applications Section */}
      <section className="mt-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">Recent Applications</h2>
          <Link to="/employer/applications" className="text-primary hover:underline font-medium">
            View All Applications
          </Link>
        </div>
        {recentApplications.length > 0 ? (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentApplications.map(app => (
                    <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {app.profileSnapshot?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {app.profileSnapshot?.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {app.jobTitle || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(app.applicationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          app.status === 'applied' ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                          app.status === 'interviewing' ? 'bg-purple-100 text-purple-800' :
                          app.status === 'offered' ? 'bg-green-100 text-green-800' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {app.status || 'Applied'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/employer/applications/${app._id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <FaUsers size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg mb-2">No recent applications</p>
            <p className="text-gray-500 text-sm">Applications will appear here when candidates apply to your jobs.</p>
          </div>
        )}
      </section>

      {/* Quick Links/Actions Section */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/employer/post-job" className="block p-6 bg-blue-50 hover:bg-blue-100 rounded-lg shadow hover:shadow-md transition-all">
            <FaPlusCircle size={28} className="text-blue-600 mb-2" />
            <h3 className="text-lg font-semibold text-blue-700">Post a New Job</h3>
            <p className="text-sm text-blue-600">Quickly create and publish a new job listing.</p>
          </Link>
          <Link to="/employer/analytics" className="block p-6 bg-green-50 hover:bg-green-100 rounded-lg shadow hover:shadow-md transition-all">
            <FaChartBar size={28} className="text-green-600 mb-2" />
            <h3 className="text-lg font-semibold text-green-700">View Analytics</h3>
            <p className="text-sm text-green-600">Track performance of your job postings.</p>
          </Link>
          {/* Add more quick actions like 'Manage Company Profile' etc. */}
        </div>
      </section>

    </div>
  );
};

export default EmployerDashboardPage;