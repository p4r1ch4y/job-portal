import React from 'react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, linkTo, linkText, colorTheme }) => {
  const themes = {
    primary: 'from-primary to-secondary',
    blue: 'from-blue-500 to-blue-700',
    green: 'from-green-500 to-green-700',
    yellow: 'from-yellow-400 to-yellow-600',
    red: 'from-red-500 to-red-700',
    purple: 'from-purple-500 to-purple-700',
    gray: 'from-gray-500 to-gray-700',
  };

  const selectedTheme = themes[colorTheme] || themes.primary;

  const cardContent = (
    <div className={`bg-gradient-to-br ${selectedTheme} text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between h-full`}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold opacity-90">{title}</h3>
          {icon && <div className="text-3xl opacity-70">{icon}</div>}
        </div>
        <p className="text-4xl font-bold mb-1">{value}</p>
      </div>
      {linkTo && linkText && (
        <div className="mt-auto pt-4">
          <span className="text-sm font-medium bg-white bg-opacity-20 px-3 py-1.5 rounded-md hover:bg-opacity-30 transition-colors duration-200">
            {linkText}
          </span>
        </div>
      )}
    </div>
  );

  return linkTo ? (
    <Link to={linkTo} className="block h-full">
      {cardContent}
    </Link>
  ) : (
    <div className="h-full">
        {cardContent}
    </div>
  );
};

export default StatCard;