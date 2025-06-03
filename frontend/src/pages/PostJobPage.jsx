import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/api';
import { FaPaperPlane, FaBuilding, FaMapMarkerAlt, FaDollarSign, FaListAlt, FaLightbulb, FaTags, FaBriefcase } from 'react-icons/fa';

const PostJobPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    companyName: user?.companyName || '', // Pre-fill if available from user context
    location: '',
    jobType: 'Full-time',
    salary: '',
    salaryPeriod: 'Annually',
    description: '',
    requirements: [''], // Start with one empty requirement field
    skills: [''], // Start with one empty skill field
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleListChange = (listName, index, value) => {
    const newList = [...formData[listName]];
    newList[index] = value;
    setFormData(prev => ({ ...prev, [listName]: newList }));
  };

  const addListItem = (listName) => {
    setFormData(prev => ({ ...prev, [listName]: [...prev[listName], ''] }));
  };

  const removeListItem = (listName, index) => {
    const newList = formData[listName].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [listName]: newList }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!formData.title.trim() || !formData.description.trim()) {
        setError('Job title and description are required.');
        setLoading(false);
        return;
    }
    if (!formData.companyName.trim() && !user?.companyName) {
        setError('Company name is required. Please ensure it is set in your profile or entered here.');
        setLoading(false);
        return;
    }

    const jobData = {
      ...formData,
      requirements: formData.requirements.filter(req => req.trim() !== ''),
      skills: formData.skills.filter(skill => skill.trim() !== ''),
      // Ensure salary is a number if provided, otherwise null/undefined
      salary: formData.salary ? parseFloat(formData.salary) : undefined,
    };

    try {
      const response = await jobService.createJob(jobData);
      setSuccess(`Job "${response.data.title}" posted successfully!`);
      // Reset form or navigate
      setFormData({
        title: '',
        companyName: user?.companyName || '',
        location: '',
        jobType: 'Full-time',
        salary: '',
        salaryPeriod: 'Annually',
        description: '',
        requirements: [''],
        skills: [''],
      });
      setTimeout(() => {
        navigate(`/jobs/${response.data._id}`); // Navigate to the new job's detail page
      }, 1500);
    } catch (err) {
      console.error("Error posting job:", err);
      setError(err.response?.data?.message || 'Failed to post job. Please check your input and try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "input-field w-full";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <FaBriefcase className="mx-auto h-12 w-auto text-primary" />
          <h1 className="text-3xl font-bold text-gray-800 mt-4">Post a New Job</h1>
          <p className="text-gray-600">Fill in the details below to find your next great hire.</p>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className={labelClass}>Job Title <span className="text-red-500">*</span></label>
            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className={inputClass} placeholder="e.g., Senior Software Engineer" required />
          </div>

          <div>
            <label htmlFor="companyName" className={labelClass}>Company Name <span className="text-red-500">*</span></label>
            <input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={handleChange} className={inputClass} placeholder="Your company's name" required />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="location" className={labelClass}>Location</label>
              <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} className={inputClass} placeholder="e.g., San Francisco, CA or Remote" />
            </div>
            <div>
              <label htmlFor="jobType" className={labelClass}>Job Type</label>
              <select name="jobType" id="jobType" value={formData.jobType} onChange={handleChange} className={inputClass}>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Temporary">Temporary</option>
              </select>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="salary" className={labelClass}>Salary (Optional)</label>
              <input type="number" name="salary" id="salary" value={formData.salary} onChange={handleChange} className={inputClass} placeholder="e.g., 90000" />
            </div>
            <div>
              <label htmlFor="salaryPeriod" className={labelClass}>Salary Period</label>
              <select name="salaryPeriod" id="salaryPeriod" value={formData.salaryPeriod} onChange={handleChange} className={inputClass} disabled={!formData.salary}>
                <option value="Annually">Annually</option>
                <option value="Monthly">Monthly</option>
                <option value="Hourly">Hourly</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>Job Description <span className="text-red-500">*</span></label>
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="6" className={inputClass} placeholder="Detailed description of the job role, responsibilities, and company culture." required></textarea>
          </div>

          <div>
            <label className={labelClass}>Requirements</label>
            {formData.requirements.map((req, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input type="text" value={req} onChange={(e) => handleListChange('requirements', index, e.target.value)} className={inputClass} placeholder={`Requirement ${index + 1}`} />
                {formData.requirements.length > 1 && (
                  <button type="button" onClick={() => removeListItem('requirements', index)} className="text-red-500 hover:text-red-700 p-1">Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addListItem('requirements')} className="text-sm text-primary hover:underline">+ Add Requirement</button>
          </div>

          <div>
            <label className={labelClass}>Skills</label>
            {formData.skills.map((skill, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input type="text" value={skill} onChange={(e) => handleListChange('skills', index, e.target.value)} className={inputClass} placeholder={`Skill ${index + 1} (e.g., React, Node.js)`} />
                {formData.skills.length > 1 && (
                  <button type="button" onClick={() => removeListItem('skills', index)} className="text-red-500 hover:text-red-700 p-1">Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addListItem('skills')} className="text-sm text-primary hover:underline">+ Add Skill</button>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn btn-primary py-3 text-lg flex items-center justify-center disabled:opacity-70"
            >
              <FaPaperPlane className="mr-2" /> {loading ? 'Posting Job...' : 'Post Job Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJobPage;