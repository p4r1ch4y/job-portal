import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { profileService } from '../services/api';
import { FaUserCircle, FaBriefcase, FaGraduationCap, FaTools, FaEnvelope, FaPhone, FaLinkedin, FaGithub, FaGlobe, FaFileDownload, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

const PublicCandidateProfilePage = () => {
  const { candidateId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPublicProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await profileService.getProfileById(candidateId);
      setProfile(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch public profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile. It may not exist or is private.');
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    fetchPublicProfile();
  }, [fetchPublicProfile]);

  const sectionCardClass = "bg-white p-6 rounded-lg shadow-md mb-6";
  const iconClass = "mr-3 text-primary text-xl";

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><FaSpinner className="animate-spin text-5xl text-primary" /> <span className="ml-4 text-2xl">Loading Profile...</span></div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <FaExclamationTriangle className="mx-auto text-6xl text-red-500 mb-4" />
        <h1 className="text-3xl font-semibold text-red-700">Profile Not Found</h1>
        <p className="text-gray-600 mt-2">{error}</p>
        <Link to="/jobs" className="mt-6 inline-block btn btn-primary">
          Back to Job Listings
        </Link>
      </div>
    );
  }

  if (!profile) {
    return <div className="container mx-auto py-8 px-4 text-center">Profile data is not available.</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-8 rounded-xl shadow-2xl mb-8 text-center md:text-left md:flex items-center">
          {profile.user?.avatarUrl ? (
            <img src={profile.user.avatarUrl} alt={profile.fullName} className="w-32 h-32 rounded-full mx-auto md:mx-0 md:mr-8 border-4 border-white shadow-lg" />
          ) : (
            <FaUserCircle className="w-32 h-32 text-blue-100 mx-auto md:mx-0 md:mr-8" />
          )}
          <div>
            <h1 className="text-4xl font-bold mt-4 md:mt-0">{profile.fullName}</h1>
            {profile.headline && <p className="text-xl mt-1 text-blue-50">{profile.headline}</p>}
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4 text-sm">
              {profile.contactNumber && <span className="flex items-center"><FaPhone className="mr-1.5" /> {profile.contactNumber}</span>}
              {profile.user?.email && <span className="flex items-center"><FaEnvelope className="mr-1.5" /> {profile.user.email}</span>}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="md:grid md:grid-cols-3 md:gap-8">
          {/* Left Column (Contact & Links) */}
          <div className="md:col-span-1 space-y-6 mb-8 md:mb-0">
            {profile.resumeUrl && (
              <div className={sectionCardClass}>
                 <a 
                    href={profile.resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-primary w-full flex items-center justify-center text-lg"
                  >
                    <FaFileDownload className="mr-2" /> Download Resume
                  </a>
              </div>
            )}
            <div className={sectionCardClass}>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Connect</h2>
              <ul className="space-y-3">
                {profile.linkedinUrl && <li><a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline"><FaLinkedin className={iconClass} /> LinkedIn</a></li>}
                {profile.githubUrl && <li><a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline"><FaGithub className={iconClass} /> GitHub</a></li>}
                {profile.portfolioUrl && <li><a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline"><FaGlobe className={iconClass} /> Portfolio</a></li>}
              </ul>
            </div>
          </div>

          {/* Right Column (Summary, Experience, Education, Skills) */}
          <div className="md:col-span-2 space-y-8">
            {profile.summary && (
              <div className={sectionCardClass}>
                <h2 className="text-2xl font-semibold text-gray-700 mb-3">Professional Summary</h2>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{profile.summary}</p>
              </div>
            )}

            {profile.experiences?.length > 0 && (
              <div className={sectionCardClass}>
                <h2 className="text-2xl font-semibold text-gray-700 mb-5 flex items-center"><FaBriefcase className={iconClass} /> Work Experience</h2>
                <div className="space-y-6">
                  {profile.experiences.map((exp, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4 py-2">
                      <h3 className="text-xl font-semibold text-gray-800">{exp.title}</h3>
                      <p className="text-md font-medium text-secondary">{exp.company}</p>
                      <p className="text-sm text-gray-500 my-1">{exp.startDate} - {exp.endDate || 'Present'}</p>
                      <p className="text-gray-600 whitespace-pre-wrap text-sm">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile.educations?.length > 0 && (
              <div className={sectionCardClass}>
                <h2 className="text-2xl font-semibold text-gray-700 mb-5 flex items-center"><FaGraduationCap className={iconClass} /> Education</h2>
                <div className="space-y-6">
                  {profile.educations.map((edu, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4 py-2">
                      <h3 className="text-xl font-semibold text-gray-800">{edu.degree}</h3>
                      <p className="text-md font-medium text-secondary">{edu.institution}</p>
                      <p className="text-sm text-gray-500 my-1">{edu.fieldOfStudy}</p>
                      <p className="text-sm text-gray-500">{edu.startDate} - {edu.endDate || 'Present'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile.skills?.length > 0 && (
              <div className={sectionCardClass}>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center"><FaTools className={iconClass} /> Skills</h2>
                <div className="flex flex-wrap gap-3">
                  {profile.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                      {skill.name} {skill.proficiency && `(${skill.proficiency})`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicCandidateProfilePage;