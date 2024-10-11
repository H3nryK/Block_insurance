import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUpload } from 'react-icons/fa';
import Navbar from './Navbar';
import Footer from './Footer';
import Preloader from './Preloader';
import { insurance_backend } from '../../../declarations/insurance_backend';
import axios from 'axios';

const Dashboard = ({ onLogout }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [financialAudit, setFinancialAudit] = useState(null);
  const [filledForm, setFilledForm] = useState(null);
  const [operationLicense, setOperationLicense] = useState(null);
  const [underwritingResult, setUnderwritingResult] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);
  const [aiQuotation, setAiQuotation] = useState(null);

  useEffect(() => {
    createAccountIfNeeded();
    fetchDocuments();
  }, []);

  const uploadToFlaskBackend = async (files) => {
    const formData = new FormData();
    Object.keys(files).forEach(key => {
      if (files[key]) {
        formData.append(key, files[key].file);
      }
    });

    try {
      const response = await axios.post('http://l127.0.0.1:5000/process_underwriting', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading to Flask backend:", error);
      throw error;
    }
  };

  const getAiQuotationResult = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/get_underwriting_result');
      return response.data;
    } catch (error) {
      console.error("Error getting AI quotation result:", error);
      throw error;
    }
  };

  const createAccountIfNeeded = async () => {
    try {
      const result = await insurance_backend.createAccount();
      if (result.err) {
        console.log("Account already exists or error:", result.err);
      } else {
        console.log("Account created successfully");
      }
    } catch (error) {
      console.error("Error creating account:", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      console.log("Attempting to fetch documents...");
      const docs = await insurance_backend.getDocuments(0, 20);
      console.log("Received response:", docs);
      setDocuments(docs);
    } catch (error) {
      console.error("Error fetching documents:", error);
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      setError("Failed to fetch documents. Please check the console for more details.");
    }
  };

  const submitDocument = async (file, docType) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const arrayBuffer = reader.result;
      try {
        const result = await insurance_backend.submitDocument(docType, Array.from(new Uint8Array(arrayBuffer)));
        console.log(`Document submitted:`, result);
        if ('ok' in result) {
          console.log(`Document submitted with ID: ${result.ok}`);
          fetchDocuments(); // Refresh the document list
        } else {
          console.error(`Error submitting document: ${result.err}`);
          setError(`Failed to submit document: ${result.err}`);
        }
      } catch (error) {
        console.error("Error submitting document:", error);
        setError("Failed to submit document. Please try again.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (financialAudit) await submitDocument(financialAudit.file, { FinancialAudit: null });
      if (filledForm) await submitDocument(filledForm.file, { ScannedForm: null });
      if (operationLicense) await submitDocument(operationLicense.file, { OperationLicense: null });

      const principal = await insurance_backend.whoami();
      await insurance_backend.processUnderwriting(principal);
      
      const result = await insurance_backend.getUnderwritingResult();
      if ('ok' in result) {
        setUnderwritingResult(result.ok);
      } else {
        console.error("Error getting underwriting result:", result.err);
        setError(`Failed to get underwriting result: ${result.err}`);
      }

      const aiResult = await uploadToFlaskBackend({
        financialAudit,
        filledForm,
        operationLicense
      });
      console.log("AI processing result: ", aiResult);

      const aiQuotationResult = await getAiQuotationResult();
      setAiQuotation(aiQuotationResult);

    } catch (error) {
      console.error("Error processing quotation:", error);
      setError("Failed to process quotation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event, setFile, docType) => {
    const file = event.target.files[0];
    setFile({ file, docType });
  };

  useEffect(() => {
    const init = async () => {
      try {
        const principal = await insurance_backend.whoami();
        console.log("Connected to backend. Principal:", principal);
        await createAccountIfNeeded();
        await fetchDocuments();
      } catch (error) {
        console.error("Error connecting to backend:", error);
        setError("Failed to connect to the backend. Please check the console for more details.");
      }
    };
    init();
  }, []);

  console.log("Insurance backend canister ID:", insurance_backend.canisterId);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar onLogout={onLogout} />
      {isLoading && <Preloader />}
      <main className="flex-grow container mx-auto px-4 py-8">
      {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white shadow-lg rounded-lg p-6"
          >
            <h2 className="text-2xl font-semibold mb-4">Upload Documents</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Financial Audit</label>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, setFinancialAudit, { FinancialAudit: null })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Filled Form</label>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, setFilledForm, { ScannedForm: null })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Operation License</label>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, setOperationLicense, { OperationLicense: null })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={!financialAudit && !filledForm && !operationLicense || isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLoading ? 'Processing...' : 'Submit for Quotation'}
              </button>
            </form>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white shadow-lg rounded-lg p-6"
          >
            <h2 className="text-2xl font-semibold mb-4">Quotation Result</h2>
            {underwritingResult && (
              <div>
            <h3 className="text-xl font-semibold">Internet Computer Result</h3>
                <p><strong>Status:</strong> {Object.keys(underwritingResult.status)[0]}</p>
                <p><strong>Quotation:</strong> Ksh. {underwritingResult.quotation || 'N/A'}</p>
                <p><strong>Reason:</strong> {underwritingResult.reason || 'N/A'}</p>
              </div>
            )}
            {aiQuotation && (
              <div>
                <h3 className="text-xl font-semibold">AI Model Result</h3>
                <p><strong>Status:</strong> {aiQuotation.status}</p>
                <p><strong>Quotation:</strong> Ksh. {aiQuotation.quotation.toFixed(2)}</p>
                <p><strong>Confidence:</strong> {(aiQuotation.confidence * 100).toFixed(2)}%</p>
                <details>
                  <summary className="cursor-pointer text-blue-600">Model Predictions</summary>
                  <ul className="pl-5 mt-2 space-y-1 list-disc list-inside">
                    {Object.entries(aiQuotation.model_predictions).map(([model, prediction]) => (
                      <li key={model}>{model}: Ksh. {prediction.toFixed(2)}</li>
                    ))}
                  </ul>
                </details>
              </div>
            )}
        {aiQuotation && (
          <div>
            <h3 className="text-xl font-semibold">AI Model Result</h3>
            <p><strong>Status:</strong> {aiQuotation.status}</p>
            <p><strong>Quotation:</strong> Ksh. {aiQuotation.quotation.toFixed(2)}</p>
            <p><strong>Confidence:</strong> {(aiQuotation.confidence * 100).toFixed(2)}%</p>
            <details>
              <summary className="cursor-pointer text-blue-600">Model Predictions</summary>
              <ul className="pl-5 mt-2 space-y-1 list-disc list-inside">
                {Object.entries(aiQuotation.model_predictions).map(([model, prediction]) => (
                  <li key={model}>{model}: Ksh. {prediction.toFixed(2)}</li>
                ))}
              </ul>
            </details>
          </div>
        )}
        {!underwritingResult && !aiQuotation && (
          <p className="text-gray-500">No quotation results available. Please submit documents for processing.</p>
        )}
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 bg-white shadow-lg rounded-lg p-6"
        >
          <h2 className="text-2xl font-semibold mb-4">Submitted Documents</h2>
          {documents.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {documents.map((doc, index) => (
                <li key={index} className="py-4">
                  <p><strong>Document Type:</strong> {Object.keys(doc.docType)[0]}</p>
                  <p><strong>Timestamp:</strong> {new Date(Number(doc.timestamp) / 1000000).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No documents submitted yet.</p>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;