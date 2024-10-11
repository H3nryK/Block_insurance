import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaWallet, FaPlug, FaEthereum, FaCheckCircle } from 'react-icons/fa';
import Navbar from './Navbar';
import Footer from './Footer';
import Preloader from './Preloader';
import { Principal } from '@dfinity/principal';
import { insurance_backend } from '../../../declarations/insurance_backend';

const Profile = ({ onLogout }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [principal, setPrincipal] = useState('');
    const [connectedWallets, setConnectedWallets] = useState([]);
    const [premiumTransactions, setPremiumTransactions] = useState([]);
  
    useEffect(() => {
      fetchUserInfo();
      fetchPremiumTransactions();
    }, []);
  
    const fetchUserInfo = async () => {
      setIsLoading(true);
      try {
        const info = await insurance_backend.whoami();
        const principal = blobToPrincipal(info._arr);
        setPrincipal(principal);
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Helper function to convert Uint8Array to string
    const blobToPrincipal = (blob) => {
      // Convert array to Uint8Array
      const uint8Array = new Uint8Array(blob);
    
      // Decode as Principal
      const principal = Principal.fromUint8Array(uint8Array);
      
      // Convert Principal to text format
      return principal.toText();
    }
  
    const fetchPremiumTransactions = async () => {
      try {
        const transactions = await insurance_backend.getPremiumTransactions();
        setPremiumTransactions(transactions);
      } catch (error) {
        console.error('Error fetching premium transactions:', error);
      }
    };
  
    const connectWallet = async (walletType) => {
      setIsLoading(true);
      try {
        if (walletType === 'Plug') {
          if (!window.ic?.plug) {
            window.open('https://plugwallet.ooo/', '_blank');
            throw new Error('Plug wallet not installed');
          }
          await window.ic.plug.requestConnect();
          const principalId = await window.ic.plug.agent.getPrincipal();
          setConnectedWallets(wallets => [...wallets, { type: 'Plug', address: principalId.toString() }]);
        } else if (walletType === 'MetaMask') {
          if (!window.ethereum) {
            window.open('https://metamask.io/', '_blank');
            throw new Error('MetaMask not installed');
          }
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setConnectedWallets(wallets => [...wallets, { type: 'MetaMask', address: accounts[0] }]);
        }
        alert(`${walletType} wallet connected successfully!`);
      } catch (error) {
        console.error(`Error connecting ${walletType} wallet:`, error);
        alert(`Failed to connect ${walletType} wallet. ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar onLogout={onLogout} />
      {isLoading && <Preloader />}
      <main className="flex-grow container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-lg rounded-lg overflow-hidden mb-8"
        >
          <div className="bg-blue-600 px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-white flex items-center">
              <FaUser className="mr-2" /> User Profile
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-lg font-semibold mb-2">Personal Information</h4>
                <p><strong>Principal ID:</strong> {principal}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white shadow-lg rounded-lg overflow-hidden mb-8"
        >
          <div className="bg-blue-600 px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-white flex items-center">
              <FaWallet className="mr-2" /> Connected Wallets
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {connectedWallets.length > 0 ? (
              <ul className="space-y-3 mb-4">
                {connectedWallets.map((wallet, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                  >
                    <span className="font-medium">{wallet.type}</span>
                    <span className="text-sm text-gray-500">{wallet.address}</span>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 mb-4">No wallets connected yet.</p>
            )}
            <div className="grid grid-cols-1gap-4 sm:grid-cols-2">
              <button
                onClick={() => connectWallet('Plug')}
                className="w-full flex justify-center m-4 items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FaPlug className="mr-2" /> Connect Plug Wallet
              </button>
              <button
                onClick={() => connectWallet('MetaMask')}
                className="w-full flex justify-center m-4 items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
              >
                <FaEthereum className="mr-2" /> Connect MetaMask
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white shadow-lg rounded-lg overflow-hidden"
        >
          <div className="bg-blue-600 px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-white flex items-center">
              <FaCheckCircle className="mr-2" /> Premium Transactions
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {premiumTransactions.length > 0 ? (
              <ul className="space-y-3">
                {premiumTransactions.map((transaction, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                  >
                    <span className="font-medium">Transaction #{transaction.id}</span>
                    <span className="text-sm text-gray-500">${transaction.amount} - {transaction.date}</span>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No premium transactions yet.</p>
            )}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;