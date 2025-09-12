import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import FloatingGraphsBackground from './FloatingGraphsBackground';
import ThemeToggle from './ThemeToggle';
import { 
    FaUser, 
    FaUserShield, 
    FaUserCog, 
    FaEdit, 
    FaTrash, 
    FaSearch,
    FaFilter,
    FaTimes,
    FaCheck,
    FaArrowLeft
} from 'react-icons/fa';
import { getAllUsers, deleteUser, updateUser } from '../services/api';

const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        role: ''
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    const handleBack = () => {
        navigate('/admin/dashboard');
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await getAllUsers();
            setUsers(response.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch users');
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = (user) => {
        setEditingUser(user._id);
        setEditForm({
            name: user.name,
            email: user.email,
            role: user.role
        });
    };

    const handleSaveEdit = async (userId) => {
        try {
            await updateUser(userId, editForm);
            await fetchUsers();
            setEditingUser(null);
            setEditForm({ name: '', email: '', role: '' });
        } catch (err) {
            setError('Failed to update user');
            console.error('Error updating user:', err);
        }
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setEditForm({ name: '', email: '', role: '' });
    };

    const handleDeleteUser = async (userId, userName) => {
        if (window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
            try {
                await deleteUser(userId);
                await fetchUsers();
            } catch (err) {
                setError('Failed to delete user');
                console.error('Error deleting user:', err);
            }
        }
    };

    // Filter and search users
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // Pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin':
                return <FaUserShield className="text-red-500" />;
            case 'moderator':
                return <FaUserCog className="text-yellow-500" />;
            default:
                return <FaUser className="text-blue-500" />;
        }
    };

    const getRoleBadge = (role) => {
        const baseClasses = "px-2 py-1 rounded-full text-xs font-semibold";
        switch (role) {
            case 'admin':
                return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
            case 'moderator':
                return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
            default:
                return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900/50 dark:via-gray-800/30 dark:to-gray-900/50 relative overflow-hidden">
                <FloatingGraphsBackground />
                <div className="relative z-10 flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900/50 dark:via-gray-800/30 dark:to-gray-900/50 relative overflow-hidden">
            <FloatingGraphsBackground />
            
            <div className="relative z-10 p-8">
                <div className="mb-12">
                    <div className="mb-8 flex justify-between items-center">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl text-gray-700 dark:text-gray-300"
                        >
                            <FaArrowLeft />
                            Back to Admin
                        </button>
                        <ThemeToggle />
                    </div>
                    
                    <div className="text-center">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-green-600 to-green-800 dark:from-white dark:via-green-200 dark:to-green-400 bg-clip-text text-transparent mb-4">
                            User Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            Manage users, roles, and permissions
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
                        <p className="text-red-700 dark:text-red-400">{error}</p>
                    </div>
                )}

                <div className="mb-6 p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            />
                        </div>

                        <div className="relative">
                            <FaFilter className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                            >
                                <option value="all">All Roles</option>
                                <option value="user">Users</option>
                                <option value="moderator">Moderators</option>
                                <option value="admin">Admins</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-500">{filteredUsers.length}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg shadow-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Joined</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                {currentUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingUser === user._id ? (
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={editForm.name}
                                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                                        className="w-full px-3 py-1 rounded border bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white"
                                                    />
                                                    <input
                                                        type="email"
                                                        value={editForm.email}
                                                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                                        className="w-full px-3 py-1 rounded border bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                                                            {getRoleIcon(user.role)}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingUser === user._id ? (
                                                <select
                                                    value={editForm.role}
                                                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                                                    className="px-3 py-1 rounded border bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white"
                                                >
                                                    <option value="user">User</option>
                                                    <option value="moderator">Moderator</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            ) : (
                                                <span className={getRoleBadge(user.role)}>
                                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {editingUser === user._id ? (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleSaveEdit(user._id)}
                                                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 flex items-center"
                                                    >
                                                        <FaCheck className="mr-1" /> Save
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 flex items-center"
                                                    >
                                                        <FaTimes className="mr-1" /> Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditUser(user)}
                                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                                                    >
                                                        <FaEdit className="mr-1" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user._id, user.name)}
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 flex items-center"
                                                    >
                                                        <FaTrash className="mr-1" /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;