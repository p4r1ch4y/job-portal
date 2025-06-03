import React from 'react';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-300 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">JobPortal</h3>
            <p className="text-sm">
              Connecting talent with opportunity. Find your dream job or the perfect candidate with us.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/jobs" className="hover:text-primary transition-colors">Find Jobs</a></li>
              <li><a href="/employer/post-job" className="hover:text-primary transition-colors">Post a Job</a></li>
              <li><a href="/about" className="hover:text-primary transition-colors">About Us (Placeholder)</a></li>
              <li><a href="/contact" className="hover:text-primary transition-colors">Contact (Placeholder)</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href=" https://github.com/p4r1ch4y/job_portal " target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                <FaGithub size={24} />
              </a>
              <a href=" https://www.linkedin.com/in/iamcsubrata/ " target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                <FaLinkedin size={24} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                <FaTwitter size={24} />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-6 text-center text-sm">
          <p>&copy; {currentYear} JobPortal. All rights reserved.</p>
          <p className="mt-1">Designed with <span className="text-red-500">❤</span> by Subrata Choudhury ( IITGCS24061306 )</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
