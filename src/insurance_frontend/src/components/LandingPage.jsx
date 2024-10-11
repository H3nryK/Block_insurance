import React from 'react';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaChartLine, FaFileAlt } from 'react-icons/fa';

const LandingPage = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col items-center justify-center text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold mb-4">Smart Underwriting System</h1>
        <p className="text-xl mb-8">Revolutionizing the insurance industry with AI-powered underwriting</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLogin}
          className="bg-white text-blue-600 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-blue-100 transition duration-300"
        >
          Get Started
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white bg-opacity-20 p-6 rounded-lg shadow-lg"
        >
          <FaShieldAlt className="text-4xl mb-4 mx-auto" />
          <h2 className="text-2xl font-semibold mb-2 text-center">Secure</h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white bg-opacity-20 p-6 rounded-lg shadow-lg"
        >
          <FaChartLine className="text-4xl mb-4 mx-auto" />
          <h2 className="text-2xl font-semibold mb-2 text-center">Efficient</h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white bg-opacity-20 p-6 rounded-lg shadow-lg"
        >
          <FaFileAlt className="text-4xl mb-4 mx-auto" />
          <h2 className="text-2xl font-semibold mb-2 text-center">Comprehensive</h2>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;