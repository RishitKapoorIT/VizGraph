// import React, { useState } from "react";
// import { getProtectedData } from "../services/api";
// import { useNavigate } from "react-router-dom";

// function Dashboard() {
//   const [message, setMessage] = useState("");
//   const navigate = useNavigate();

//   const fetchData = async () => {
//     try {
//       const res = await getProtectedData();
//       setMessage(res.data.message);
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to fetch data");
//       if (err.response?.status === 403) {
//         navigate("/login"); // redirect if not authorized
//       }
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/login");
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Dashboard</h2>
//       <button onClick={fetchData}>Fetch Protected Data</button>
//       <button onClick={handleLogout} style={{ marginLeft: "10px" }}>
//         Logout
//       </button>
//       <p>{message}</p>
//     </div>
//   );
// }

// export default Dashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
// Make sure this path is correct for your project structure
import { getProtectedData } from '../services/api'; 

// Reusable card component for the dashboard
const DashboardCard = ({ project }) => (
  <div className="bg-gray-800 rounded-lg p-5 shadow-lg hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300">
    {/* You can add a chart thumbnail here */}
    <div className="w-full h-32 bg-gray-700 rounded-md mb-4 flex items-center justify-center text-gray-500">
      Chart Preview
    </div>
    <h3 className="font-bold text-white truncate">{project.name}</h3>
    <p className="text-sm text-gray-400 mt-1">{`Created ${project.date}`}</p>
    <div className="mt-4 flex justify-between items-center">
      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">{project.chartType} Chart</span>
      <div className="flex gap-3 text-gray-400">
        <FiEdit className="cursor-pointer hover:text-white" />
        <FiTrash2 className="cursor-pointer hover:text-red-500" />
      </div>
    </div>
  </div>
);

function Dashboard() {
  // State to hold the projects fetched from the backend
  const [projects, setProjects] = useState([]);
  // State for loading and error messages
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // useEffect will run once when the component mounts to fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Assuming getProtectedData fetches the user's projects
        const res = await getProtectedData();
        // Assuming the response has a 'projects' array: res.data.projects
        setProjects(res.data.projects || []); 
        setIsLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch data. You may be logged out.");
        setIsLoading(false);
        // Redirect to login if unauthorized (e.g., token expired)
        if (err.response?.status === 403 || err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    fetchData();
  }, [navigate]); // Dependency array ensures this runs only once

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  
  const handleCreateNew = () => {
    // Navigate to the page where users can upload a file and create a chart
    navigate('/new-chart'); 
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
            <button 
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
                <FiPlus /> Create New Chart
            </button>
            <button 
                onClick={handleLogout} 
                className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
            >
                Logout
            </button>
        </div>
      </div>

      {/* Display Loading or Error Messages */}
      {isLoading && <p className="text-center">Loading your projects...</p>}
      {error && <p className="text-center text-red-500 bg-red-900/50 p-3 rounded-md">{error}</p>}

      {/* Display Project Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.length > 0 ? (
            projects.map(p => <DashboardCard key={p.id} project={p} />)
          ) : (
            <p className="col-span-full text-center text-gray-400">You haven't created any charts yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
// Note: Ensure that the getProtectedData function is correctly implemented in your services/api.js file
// and that it returns the expected data structure for projects.