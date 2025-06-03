import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/api';
import { FaUserEdit, FaBriefcase, FaGraduationCap, FaTools, FaFileAlt, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const CandidateProfilePage = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    headline: '',
    summary: '',
    portfolioUrl: '',
    linkedinUrl: '',
    githubUrl: '',
    experiences: [],
    educations: [],
    skills: [],
    resume: null, // For file upload
    resumeUrl: '', // To display current resume link
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingSection, setEditingSection] = useState(null); // 'experience', 'education', 'skills'
  const [currentSectionItem, setCurrentSectionItem] = useState(null); // item being edited
  const [sectionItemIndex, setSectionItemIndex] = useState(null); // index of item being edited

  const fetchProfile = useCallback(async () => {
    if (!user || user.role !== 'candidate') {
      setLoading(false);
      setError('User not authorized or not a candidate.');
      return;
    }
    setLoading(true);
    try {
      const response = await profileService.getMyProfile();
      setProfile(response.data);
      setFormData({
        fullName: response.data.fullName || user.name || '',
        contactNumber: response.data.contactNumber || '',
        headline: response.data.headline || '',
        summary: response.data.summary || '',
        portfolioUrl: response.data.portfolioUrl || '',
        linkedinUrl: response.data.linkedinUrl || '',
        githubUrl: response.data.githubUrl || '',
        experiences: response.data.experiences || [],
        educations: response.data.educations || [],
        skills: response.data.skills || [],
        resumeUrl: response.data.resumeUrl || '',
        resume: null,
      });
      setError(null);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      if (err.response && err.response.status === 404) {
        setFormData(prev => ({
          ...prev,
          fullName: user.name || '',
        }));
        setProfile(null);
      } else {
        setError(err.response?.data?.message || 'Failed to load profile.');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'resume') {
      setFormData(prev => ({ ...prev, resume: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSectionItemChange = (e) => {
    const { name, value } = e.target;
    setCurrentSectionItem(prev => ({ ...prev, [name]: value }));
  };

  const openSectionModal = (section, item = null, index = null) => {
    setEditingSection(section);
    setSectionItemIndex(index);
    if (item) {
      setCurrentSectionItem({ ...item });
    } else {
      // Default structure for new items
      if (section === 'experiences') setCurrentSectionItem({ title: '', company: '', startDate: '', endDate: '', description: '' });
      if (section === 'educations') setCurrentSectionItem({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' });
      if (section === 'skills') setCurrentSectionItem({ name: '', proficiency: 'Intermediate' });
    }
  };

  const closeSectionModal = () => {
    setEditingSection(null);
    setCurrentSectionItem(null);
    setSectionItemIndex(null);
  };

  const saveSectionItem = () => {
    if (!currentSectionItem) return;
    let updatedSectionItems;
    if (sectionItemIndex !== null) { // Editing existing item
      updatedSectionItems = formData[editingSection].map((item, idx) => 
        idx === sectionItemIndex ? currentSectionItem : item
      );
    } else { // Adding new item
      updatedSectionItems = [...formData[editingSection], currentSectionItem];
    }
    setFormData(prev => ({ ...prev, [editingSection]: updatedSectionItems }));
    closeSectionModal();
  };

  const removeSectionItem = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, idx) => idx !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const dataToSubmit = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'experiences' || key === 'educations' || key === 'skills') {
        formData[key].forEach((item, index) => {
          Object.keys(item).forEach(itemKey => {
            dataToSubmit.append(`${key}[${index}][${itemKey}]`, item[itemKey]);
          });
        });
      } else if (key === 'resume' && formData.resume) {
        dataToSubmit.append('resume', formData.resume);
      } else if (key !== 'resume' && key !== 'resumeUrl') {
        dataToSubmit.append(key, formData[key]);
      }
    });
    
    const method = profile ? 'put' : 'post';
    const url = '/profile/candidate';

    try {
      const response = await profileService.updateMyProfile(dataToSubmit);
      setProfile(response.data.profile || response.data); // Adjust based on backend response structure
      setFormData(prev => ({ ...prev, resume: null, resumeUrl: response.data.profile?.resumeUrl || response.data.resumeUrl || prev.resumeUrl }));
      setSuccess('Profile saved successfully!');
      if (response.data.user) {
        setUser(response.data.user);
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError(err.response?.data?.message || 'Failed to save profile. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "input-field w-full";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const sectionCardClass = "bg-white p-6 rounded-lg shadow-md";

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><FaSpinner className="animate-spin text-4xl text-primary" /> <span className="ml-3 text-xl">Loading Profile...</span></div>;
  }

  if (!user || user.role !== 'candidate') {
    return <div className="container mx-auto py-8 px-4 text-center text-red-600">You are not authorized to view this page. Please log in as a candidate.</div>;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-50 to-blue-50 p-8 rounded-xl shadow-2xl">
        <div className="text-center mb-10">
          <FaUserEdit className="mx-auto h-16 w-auto text-primary" />
          <h1 className="text-4xl font-bold text-gray-800 mt-4">Manage Your Profile</h1>
          <p className="text-gray-600 mt-2">Keep your professional information up-to-date to attract employers.</p>
        </div>

        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert"><FaTimesCircle className="inline mr-2" />{error}</div>}
        {success && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded" role="alert"><FaCheckCircle className="inline mr-2" />{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className={sectionCardClass}>
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">Basic Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className={labelClass}>Full Name <span className="text-red-500">*</span></label>
                <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label htmlFor="contactNumber" className={labelClass}>Contact Number</label>
                <input type="tel" name="contactNumber" id="contactNumber" value={formData.contactNumber} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div className="mt-6">
              <label htmlFor="headline" className={labelClass}>Headline <span className="text-red-500">*</span></label>
              <input type="text" name="headline" id="headline" value={formData.headline} onChange={handleChange} className={inputClass} placeholder="e.g., Full Stack Developer | React & Node.js Expert" required />
            </div>
            <div className="mt-6">
              <label htmlFor="summary" className={labelClass}>Summary</label>
              <textarea name="summary" id="summary" value={formData.summary} onChange={handleChange} rows="5" className={inputClass} placeholder="Brief professional summary..."></textarea>
            </div>
          </div>

          {/* Professional Links */}
          <div className={sectionCardClass}>
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">Professional Links</h2>
            <div className="grid md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="portfolioUrl" className={labelClass}>Portfolio URL</label>
                    <input type="url" name="portfolioUrl" id="portfolioUrl" value={formData.portfolioUrl} onChange={handleChange} className={inputClass} placeholder="https://yourportfolio.com" />
                </div>
                <div>
                    <label htmlFor="linkedinUrl" className={labelClass}>LinkedIn Profile URL</label>
                    <input type="url" name="linkedinUrl" id="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} className={inputClass} placeholder="https://linkedin.com/in/yourprofile" />
                </div>
                <div>
                    <label htmlFor="githubUrl" className={labelClass}>GitHub Profile URL</label>
                    <input type="url" name="githubUrl" id="githubUrl" value={formData.githubUrl} onChange={handleChange} className={inputClass} placeholder="https://github.com/yourusername" />
                </div>
            </div>
          </div>

          {/* Experience */}
          <div className={sectionCardClass}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-700">Work Experience</h2>
              <button type="button" onClick={() => openSectionModal('experiences')} className="btn btn-secondary btn-sm">+ Add Experience</button>
            </div>
            {formData.experiences.length === 0 && <p className="text-gray-500">No work experience added yet.</p>}
            <div className="space-y-4">
              {formData.experiences.map((exp, index) => (
                <div key={index} className="p-4 border rounded-md bg-gray-50">
                  <h3 className="font-semibold text-lg">{exp.title} at {exp.company}</h3>
                  <p className="text-sm text-gray-600">{exp.startDate} - {exp.endDate || 'Present'}</p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{exp.description}</p>
                  <div className="mt-2 space-x-2">
                    <button type="button" onClick={() => openSectionModal('experiences', exp, index)} className="text-sm text-blue-600 hover:underline">Edit</button>
                    <button type="button" onClick={() => removeSectionItem('experiences', index)} className="text-sm text-red-600 hover:underline">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className={sectionCardClass}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-700">Education</h2>
              <button type="button" onClick={() => openSectionModal('educations')} className="btn btn-secondary btn-sm">+ Add Education</button>
            </div>
            {formData.educations.length === 0 && <p className="text-gray-500">No education details added yet.</p>}
            <div className="space-y-4">
              {formData.educations.map((edu, index) => (
                <div key={index} className="p-4 border rounded-md bg-gray-50">
                  <h3 className="font-semibold text-lg">{edu.degree} in {edu.fieldOfStudy}</h3>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                  <p className="text-sm text-gray-500">{edu.startDate} - {edu.endDate || 'Present'}</p>
                  <div className="mt-2 space-x-2">
                    <button type="button" onClick={() => openSectionModal('educations', edu, index)} className="text-sm text-blue-600 hover:underline">Edit</button>
                    <button type="button" onClick={() => removeSectionItem('educations', index)} className="text-sm text-red-600 hover:underline">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className={sectionCardClass}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-700">Skills</h2>
              <button type="button" onClick={() => openSectionModal('skills')} className="btn btn-secondary btn-sm">+ Add Skill</button>
            </div>
            {formData.skills.length === 0 && <p className="text-gray-500">No skills added yet.</p>}
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <div key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center">
                  {skill.name} ({skill.proficiency})
                  <button type="button" onClick={() => openSectionModal('skills', skill, index)} className="ml-2 text-xs text-blue-500 hover:text-blue-700">(edit)</button>
                  <button type="button" onClick={() => removeSectionItem('skills', index)} className="ml-1 text-xs text-red-500 hover:text-red-700">&times;</button>
                </div>
              ))}
            </div>
          </div>

          {/* Resume Upload */}
          <div className={sectionCardClass}>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Resume/CV</h2>
            <label htmlFor="resume" className={labelClass}>Upload New Resume (PDF, DOC, DOCX)</label>
            <input type="file" name="resume" id="resume" onChange={handleChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-primary-dark" accept=".pdf,.doc,.docx" />
            {formData.resumeUrl && (
              <p className="mt-3 text-sm text-gray-600">
                Current Resume: <a href={formData.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Resume</a>
              </p>
            )}
            {formData.resume && <p className="mt-1 text-xs text-gray-500">Selected: {formData.resume.name}</p>}
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={saving}
              className="w-full btn btn-primary py-3 text-lg flex items-center justify-center disabled:opacity-70"
            >
              {saving ? <FaSpinner className="animate-spin mr-2" /> : <FaCheckCircle className="mr-2" />} 
              {saving ? 'Saving Profile...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal for Editing/Adding Section Items */}
      {editingSection && currentSectionItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
            <h3 className="text-xl font-semibold mb-4 capitalize">{sectionItemIndex !== null ? 'Edit' : 'Add'} {editingSection.slice(0, -1)}</h3>
            {editingSection === 'experiences' && (
              <div className="space-y-4">
                <div><label className={labelClass}>Job Title</label><input type="text" name="title" value={currentSectionItem.title} onChange={handleSectionItemChange} className={inputClass} /></div>
                <div><label className={labelClass}>Company</label><input type="text" name="company" value={currentSectionItem.company} onChange={handleSectionItemChange} className={inputClass} /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelClass}>Start Date</label><input type="month" name="startDate" value={currentSectionItem.startDate} onChange={handleSectionItemChange} className={inputClass} /></div>
                    <div><label className={labelClass}>End Date (leave blank if current)</label><input type="month" name="endDate" value={currentSectionItem.endDate} onChange={handleSectionItemChange} className={inputClass} /></div>
                </div>
                <div><label className={labelClass}>Description</label><textarea name="description" value={currentSectionItem.description} onChange={handleSectionItemChange} rows="4" className={inputClass}></textarea></div>
              </div>
            )}
            {editingSection === 'educations' && (
              <div className="space-y-4">
                <div><label className={labelClass}>Institution</label><input type="text" name="institution" value={currentSectionItem.institution} onChange={handleSectionItemChange} className={inputClass} /></div>
                <div><label className={labelClass}>Degree</label><input type="text" name="degree" value={currentSectionItem.degree} onChange={handleSectionItemChange} className={inputClass} /></div>
                <div><label className={labelClass}>Field of Study</label><input type="text" name="fieldOfStudy" value={currentSectionItem.fieldOfStudy} onChange={handleSectionItemChange} className={inputClass} /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelClass}>Start Date</label><input type="month" name="startDate" value={currentSectionItem.startDate} onChange={handleSectionItemChange} className={inputClass} /></div>
                    <div><label className={labelClass}>End Date (leave blank if current)</label><input type="month" name="endDate" value={currentSectionItem.endDate} onChange={handleSectionItemChange} className={inputClass} /></div>
                </div>
              </div>
            )}
            {editingSection === 'skills' && (
              <div className="space-y-4">
                <div><label className={labelClass}>Skill Name</label><input type="text" name="name" value={currentSectionItem.name} onChange={handleSectionItemChange} className={inputClass} /></div>
                <div>
                  <label className={labelClass}>Proficiency</label>
                  <select name="proficiency" value={currentSectionItem.proficiency} onChange={handleSectionItemChange} className={inputClass}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>
            )}
            <div className="mt-6 flex justify-end space-x-3">
              <button type="button" onClick={closeSectionModal} className="btn btn-ghost">Cancel</button>
              <button type="button" onClick={saveSectionItem} className="btn btn-primary">Save Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateProfilePage;
