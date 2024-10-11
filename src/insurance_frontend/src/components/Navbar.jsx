import React from 'react';
import { Link } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';

const Navbar = ({ onLogout }) => {
  return (
    <nav className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <img className="h-8 w-auto" src="/icon.webp" alt="Logo" />
            <div className="ml-6 flex space-x-8">
              <Link to="/dashboard" className="text-white hover:bg-purple-700 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
              <Link to="/profile" className="text-white hover:bg-purple-700 px-3 py-2 rounded-md text-sm font-medium">Profile</Link>
            </div>
          </div>
          <div className="flex items-center">
            <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
              <FaSignOutAlt className="inline-block mr-2" /> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;