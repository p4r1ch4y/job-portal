import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaBriefcase, FaDollarSign, FaClock, FaBuilding } from 'react-icons/fa';

const JobCard = ({ job }) => {
  if (!job) return null;

  const { 
    _id,
    title,
    companyName,
    companyLogoUrl, // might add this later
    location,
    jobType,
    salary,
    salaryPeriod,
    postedDate,
  } = job;

  const timeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col h-full">
      <div className="p-6 flex-grow">
        <div className="flex items-start mb-3">
          {companyLogoUrl ? (
            <img src={companyLogoUrl} alt={`${companyName} logo`} className="w-14 h-14 rounded-md mr-4 object-contain"/>
          ) : (
            <div className="w-14 h-14 rounded-md mr-4 bg-gray-100 flex items-center justify-center">
              <FaBuilding className="text-3xl text-gray-400" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-primary hover:underline">
              <Link to={`/jobs/${_id}`}>{title}</Link>
            </h2>
            <p className="text-md text-gray-700 font-medium">{companyName}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          {location && (
            <p className="flex items-center">
              <FaMapMarkerAlt className="mr-2 text-secondary" /> {location}
            </p>
          )}
          {jobType && (
            <p className="flex items-center">
              <FaBriefcase className="mr-2 text-secondary" /> {jobType}
            </p>
          )}
          {salary && (
            <p className="flex items-center">
              <FaDollarSign className="mr-2 text-secondary" /> 
              ${Number(salary).toLocaleString()} {salaryPeriod ? `(${salaryPeriod})` : ''}
            </p>
          )}
          {postedDate && (
            <p className="flex items-center">
              <FaClock className="mr-2 text-secondary" /> Posted {timeSince(postedDate)}
            </p>
          )}
        </div>
        
        {/* Optional: Short Description 
        {description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-3">
            {description}
          </p>
        )}
        */} 
      </div>

      <div className="px-6 pb-6 pt-2 border-t border-gray-100 mt-auto">
        <Link 
          to={`/jobs/${_id}`} 
          className="btn btn-primary w-full text-center"
        >
          View Details & Apply
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
