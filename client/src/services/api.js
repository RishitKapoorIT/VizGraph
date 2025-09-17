import axios from "axios";

// Create an Axios instance with a base URL for your backend.
// All requests made with this instance will be prefixed with this URL.
const API = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_API_URL
    : "/api", // Use proxy configured in package.json for development
});

// Use an interceptor to add the JWT token to the Authorization header
// for every request that is sent. This automates authentication.
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on actual authentication failures
    if (error.response?.status === 401 && error.response?.data?.code === 'NO_TOKEN') {
      const currentPath = window.location.pathname;
      // Don't redirect if on chart-studio (demo mode) or auth pages
      if (!currentPath.includes('/login') && 
          !currentPath.includes('/register') && 
          !currentPath.includes('/chart-studio') && 
          !currentPath.includes('/demo')) {
        console.log('No token detected, redirecting to login');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- Authentication Endpoints ---

// Handles user registration.
export const registerUser = (data) => API.post("auth/register", data);

// Handles standard email/password login.
export const loginUser = (data) => API.post("auth/login", data);

// Handles Google Sign-In. Sends the Google token to the backend.
export const googleAuth = (tokenData) => API.post('auth/google', tokenData);


// --- Data Fetching Endpoints ---

// Fetches general protected data for a logged-in user (e.g., their dashboard projects).
export const getProtectedData = () => API.get("data");


// --- Admin Endpoints ---

// Fetches a list of all users. This route should be protected on the backend
// and only accessible to users with an 'admin' role.
export const getAllUsers = () => API.get('admin/users');

// Fetches user statistics with analysis counts (Admin only).
export const getUserStats = () => API.get('admin/user-stats');

// Creates initial admin user (one-time setup).
export const setupAdmin = () => API.post('admin/setup');

// Deletes a user by ID.
export const deleteUser = (id) => API.delete(`admin/users/${id}`);

// Updates a user by ID (admin only).
export const updateUser = (id, userData) => API.put(`admin/users/${id}`, userData);

// Updates user profile
export const updateProfile = (profileData) => API.put('auth/profile', profileData);

// Gets current user profile
export const getUserProfile = () => API.get('auth/user');

// Forgot password
export const forgotPassword = (email) => API.post('auth/forgot-password', { email });

// --- Admin Data Management Endpoints ---

// Gets all files (Admin only)
export const getAllFiles = () => API.get('admin/files');

// Deletes a file (Admin only)
export const deleteFile = (id) => API.delete(`admin/files/${id}`);

// Gets all analyses (Admin only)
export const getAllAnalyses = () => API.get('admin/analyses');

// Deletes an analysis (Admin only)
export const deleteAnalysisAdmin = (id) => API.delete(`admin/analyses/${id}`);

// Gets comprehensive dashboard statistics (Admin only)
export const getDashboardStats = () => API.get('admin/dashboard-stats');

// --- File Upload Endpoint ---

// Handles file uploads. Sends FormData.
export const uploadFile = (formData) => API.post('upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Demo file upload (no auth required)
export const uploadFileDemo = (formData) => API.post('upload/demo', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Gets file data by ID.
// Get file data by ID for editing analyses
export const getFileData = (fileId) => API.get(`upload/${fileId}`);

// Generate AI summary for data
export const generateAISummary = (data, chartConfig) => API.post('analysis/summarize', {
  data,
  chartConfig
});

// Get analysis statistics
export const getAnalysisStats = () => API.get('analysis/stats');

// --- Analysis Endpoints ---

// Saves a new analysis.
export const saveAnalysis = (analysisData) => API.post('analysis', analysisData);

// Updates an existing analysis.
export const updateAnalysis = (id, analysisData) => API.put(`analysis/${id}`, analysisData);

// Gets all analyses for the current user.
export const getAnalyses = () => API.get('analysis');

// Gets a single analysis by ID for editing.
export const getAnalysis = (id) => API.get(`analysis/${id}`);

// Deletes an analysis by ID.
export const deleteAnalysis = (id) => API.delete(`analysis/${id}`);

// Note: There is no need for a default export when using named exports.