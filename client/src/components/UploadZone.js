import React, { useCallback, useState } from "react";
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiXCircle, FiCheck } from 'react-icons/fi';

export default function UploadZone({ onFileUpload }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState('');
  
  const onDrop = useCallback(
    (acceptedFiles, fileRejections) => {
      setError('');
      setUploadedFile(null);
      onFileUpload(null); // Reset parent state on new drop
  
      if (fileRejections.length > 0) {
        const { errors } = fileRejections[0];
        if (errors[0]) {
          switch (errors[0].code) {
            case 'file-invalid-type':
              setError('Invalid file type. Please upload an .xls, .xlsx, or .csv file.');
              break;
            case 'too-many-files':
              setError('Please upload only one file at a time.');
              break;
            default:
              setError('Upload failed. Please try again.');
              break;
          }
        }
        return;
      }
  
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setUploadedFile(file);
        // Pass the file up to the parent component for processing
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  const removeFile = useCallback(
    (e) => {
      e.stopPropagation(); // Prevent file dialog from opening on button click
      setUploadedFile(null);
      setError('');
      onFileUpload(null); // Notify parent that file is removed
    },
    [onFileUpload]
  );

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        {...getRootProps()}
        className={`relative p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm
        ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'}
        ${uploadedFile ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}`}
      >
        <input {...getInputProps()} />
        
        {uploadedFile ? (
          <div className="flex flex-col items-center gap-6 text-gray-900 dark:text-white">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
              <FiCheck className="w-10 h-10 text-white" />
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold mb-2">{uploadedFile.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">File ready for analysis!</p>
            </div>
            <button
              onClick={removeFile}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium flex items-center gap-2 transition-all duration-300 hover:scale-105"
            >
              <FiXCircle size={18} /> 
              Remove File
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 text-gray-700 dark:text-gray-300">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <FiUploadCloud className="w-10 h-10 text-white" />
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {isDragActive ? 'Drop your file here' : 'Upload your data file'}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Drag and drop your file here, or click to browse
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-sm">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full">
                  .xlsx
                </span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full">
                  .xls
                </span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full">
                  .csv
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-red-600 dark:text-red-400 text-center font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}