// // src/services/api.js
// import axios from "axios";

// // Base API instance
// const API = axios.create({
//   baseURL: "http://localhost:5000/api", // backend base URL
// });

// // Add token to every request if it exists
// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Register User
// export const registerUser = (data) => API.post("/register", data);

// // Login User
// export const loginUser = (data) => API.post("/login", data);

// // Get Protected Data
// export const getProtectedData = () => API.get("/data");

// // Add this to your client/src/services/api.js file

// export const googleAuth = (tokenData) => API.post('/api/auth/google', tokenData);
// // Ensure that the backend has an endpoint to handle Google authentication

// export const getAllUsers = () => API.get('/api/admin/users');


// export default API;


import axios from "axios";

// Create an Axios instance with a base URL for your backend.
// All requests made with this instance will be prefixed with this URL.
const API = axios.create({
  baseURL: "http://localhost:5000/api", 
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

// --- Authentication Endpoints ---

// Handles user registration.
export const registerUser = (data) => API.post("/auth/register", data);

// Handles standard email/password login.
export const loginUser = (data) => API.post("/auth/login", data);

// Handles Google Sign-In. Sends the Google token to the backend.
export const googleAuth = (tokenData) => API.post('/auth/google', tokenData);


// --- Data Fetching Endpoints ---

// Fetches general protected data for a logged-in user (e.g., their dashboard projects).
export const getProtectedData = () => API.get("/data");


// --- Admin Endpoints ---

// Fetches a list of all users. This route should be protected on the backend
// and only accessible to users with an 'admin' role.
export const getAllUsers = () => API.get('/admin/users');

// Note: There is no need for a default export when using named exports.
