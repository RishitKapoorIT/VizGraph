import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiFileText, FiXCircle } from 'react-icons/fi';

export default function UploadZone({ onFileUpload }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    setError('');
    setUploadedFile(null);

    if (fileRejections.length > 0) {
      setError('Upload failed. Please upload a single .xls or .xlsx file.');
      return;
    }
    
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      // Pass the file up to the parent component for processing
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: false,
  });

  const removeFile = () => {
    setUploadedFile(null);
    setError('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <div
        {...getRootProps()}
        className={`p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300
        ${isDragActive ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 hover:border-gray-400'}
        ${uploadedFile ? 'border-green-500 bg-green-900/20' : ''}`}
      >
        <input {...getInputProps()} />
        
        {uploadedFile ? (
          <div className="flex flex-col items-center gap-4 text-white">
            <FiFileText className="w-16 h-16 text-green-400" />
            <p className="text-lg font-semibold">{uploadedFile.name}</p>
            <p className="text-sm text-gray-400">File ready for analysis!</p>
            <button
              onClick={removeFile}
              className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white font-bold flex items-center gap-2"
            >
              <FiXCircle /> Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-gray-400">
            <FiUploadCloud className="w-16 h-16" />
            <p className="text-lg font-semibold text-white">
              {isDragActive ? 'Drop the file here...' : 'Drag & drop your Excel file here'}
            </p>
            <p>or click to select a file</p>
            <p className="text-xs mt-2">Supports .xls and .xlsx</p>
          </div>
        )}
      </div>
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
}