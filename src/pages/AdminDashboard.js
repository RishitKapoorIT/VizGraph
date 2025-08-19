import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Make sure to create this function in your api service
import { getAllUsers } from '../services/api'; 
import { FiUser, FiMail, FiShield, FiTrash2 } from 'react-icons/fi';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getAllUsers();
        setUsers(res.data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch users. You might not have admin rights.');
        setIsLoading(false);
        // Optional: Redirect if forbidden
        if (err.response?.status === 403) {
            setTimeout(() => navigate('/dashboard'), 2000);
        }
      }
    };

    fetchUsers();
  }, [navigate]);

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {isLoading && <p>Loading users...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!isLoading && !error && (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-4 font-semibold">Username</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="p-4 flex items-center gap-2">
                    <FiUser /> {user.username}
                  </td>
                  <td className="p-4">
                    <FiMail className="inline mr-2" /> {user.email}
                  </td>
                  <td className="p-4">
                    {user.role === 'admin' ? (
                      <span className="flex items-center gap-2 text-green-400">
                        <FiShield /> Admin
                      </span>
                    ) : (
                      <span className="text-gray-400">User</span>
                    )}
                  </td>
                  <td className="p-4">
                    <button className="text-red-500 hover:text-red-400">
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
