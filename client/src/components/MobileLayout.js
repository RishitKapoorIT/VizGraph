import React, { useState, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';
import { 
    FaBars, 
    FaTimes, 
    FaHome, 
    FaChartBar, 
    FaUser, 
    FaCog,
    FaSignOutAlt
} from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const MobileLayout = ({ children }) => {
    const { theme } = useContext(ThemeContext);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const menuItems = [
        { icon: FaHome, label: 'Dashboard', path: '/dashboard' },
        { icon: FaChartBar, label: 'Chart Studio', path: '/chart-studio' },
        { icon: FaUser, label: 'Profile', path: '/profile' },
        { icon: FaCog, label: 'Settings', path: '/settings' },
    ];

    // Add admin menu items if user is admin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'admin') {
        menuItems.splice(3, 0, { 
            icon: FaCog, 
            label: 'Admin Panel', 
            path: '/admin' 
        });
    }

    const isActive = (path) => location.pathname === path;

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Mobile Header */}
            <header className={`lg:hidden fixed top-0 left-0 right-0 z-50 ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border-b shadow-lg`}>
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className={`p-2 rounded-lg ${
                            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                    >
                        <FaBars size={20} />
                    </button>
                    
                    <h1 className="text-xl font-bold text-blue-500">VizGraph</h1>
                    
                    <ThemeToggle />
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    {/* Overlay */}
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                    
                    {/* Sidebar */}
                    <div className={`relative flex flex-col w-80 max-w-xs ${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    } shadow-xl`}>
                        {/* Sidebar Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-xl font-bold text-blue-500">VizGraph</h2>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className={`p-2 rounded-lg ${
                                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                                }`}
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* User Info */}
                        <div className="p-4 border-b">
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                                }`}>
                                    <FaUser />
                                </div>
                                <div>
                                    <div className="font-medium">{user.name || 'User'}</div>
                                    <div className={`text-sm ${
                                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                        {user.role || 'user'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <nav className="flex-1 p-4 space-y-2">
                            {menuItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => {
                                        navigate(item.path);
                                        setSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                        isActive(item.path)
                                            ? theme === 'dark'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-blue-100 text-blue-900'
                                            : theme === 'dark'
                                            ? 'hover:bg-gray-700 text-gray-300'
                                            : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    <item.icon size={18} />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>

                        {/* Logout Button */}
                        <div className="p-4 border-t">
                            <button
                                onClick={handleLogout}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                    theme === 'dark'
                                        ? 'hover:bg-red-800 text-red-400'
                                        : 'hover:bg-red-100 text-red-600'
                                }`}
                            >
                                <FaSignOutAlt size={18} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className={`hidden lg:block fixed left-0 top-0 bottom-0 w-64 ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border-r shadow-lg`}>
                {/* Desktop Header */}
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-blue-500">VizGraph</h1>
                </div>

                {/* User Info */}
                <div className="p-6 border-b">
                    <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                        }`}>
                            <FaUser size={20} />
                        </div>
                        <div>
                            <div className="font-medium">{user.name || 'User'}</div>
                            <div className={`text-sm ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                {user.role || 'user'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <nav className="flex-1 p-6 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                isActive(item.path)
                                    ? theme === 'dark'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-blue-100 text-blue-900'
                                    : theme === 'dark'
                                    ? 'hover:bg-gray-700 text-gray-300'
                                    : 'hover:bg-gray-100 text-gray-700'
                            }`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Desktop Theme Toggle & Logout */}
                <div className="p-6 border-t space-y-2">
                    <div className="flex items-center justify-center">
                        <ThemeToggle />
                    </div>
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                            theme === 'dark'
                                ? 'hover:bg-red-800 text-red-400'
                                : 'hover:bg-red-100 text-red-600'
                        }`}
                    >
                        <FaSignOutAlt size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen">
                {/* Mobile Spacer */}
                <div className="lg:hidden h-16"></div>
                
                {/* Content */}
                <div className="p-4 lg:p-6">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MobileLayout;
