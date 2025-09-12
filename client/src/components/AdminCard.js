import React from 'react';
import { FiChevronRight } from 'react-icons/fi';

// Color mapping functions for Tailwind CSS
const getColorClasses = (color) => {
  const colorMap = {
    blue: {
      icon: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
      hover: 'group-hover:text-blue-700 dark:group-hover:text-blue-300',
      border: 'hover:border-blue-400 dark:hover:border-blue-500',
      gradient: 'from-blue-400 to-blue-500',
      bgGradient: 'from-blue-50 via-transparent to-blue-50 dark:from-blue-900/10 dark:via-transparent dark:to-blue-900/10',
      badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
    },
    green: {
      icon: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-600 dark:text-green-400',
      hover: 'group-hover:text-green-700 dark:group-hover:text-green-300',
      border: 'hover:border-green-400 dark:hover:border-green-500',
      gradient: 'from-green-400 to-green-500',
      bgGradient: 'from-green-50 via-transparent to-green-50 dark:from-green-900/10 dark:via-transparent dark:to-green-900/10',
      badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
    },
    purple: {
      icon: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-400',
      hover: 'group-hover:text-purple-700 dark:group-hover:text-purple-300',
      border: 'hover:border-purple-400 dark:hover:border-purple-500',
      gradient: 'from-purple-400 to-purple-500',
      bgGradient: 'from-purple-50 via-transparent to-purple-50 dark:from-purple-900/10 dark:via-transparent dark:to-purple-900/10',
      badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
    },
    orange: {
      icon: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-600 dark:text-orange-400',
      hover: 'group-hover:text-orange-700 dark:group-hover:text-orange-300',
      border: 'hover:border-orange-400 dark:hover:border-orange-500',
      gradient: 'from-orange-400 to-orange-500',
      bgGradient: 'from-orange-50 via-transparent to-orange-50 dark:from-orange-900/10 dark:via-transparent dark:to-orange-900/10',
      badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
    }
  };
  return colorMap[color] || colorMap.blue;
};

// Admin Card Component
const AdminCard = ({ 
  title, 
  description, 
  icon: Icon, 
  color, 
  onClick, 
  stats = null,
  badge = null,
  disabled = false 
}) => {
  const colors = getColorClasses(color);
  
  return (
    <div 
      onClick={disabled ? undefined : onClick}
      className={`group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 cursor-pointer overflow-hidden ${
        disabled ? 'opacity-50 cursor-not-allowed' : colors.border
      }`}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`}></div>
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-4 ${colors.bg} rounded-xl`}>
            <Icon className={colors.icon} size={24} />
          </div>
          {badge && (
            <span className={`px-2 py-1 ${colors.badge} text-xs font-semibold rounded-full`}>
              {badge}
            </span>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{description}</p>
        
        {stats && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
        
        <div className={`flex items-center ${colors.text} text-sm font-medium ${colors.hover} transition-colors`}>
          <span>Manage</span>
          <FiChevronRight className="ml-1 transform group-hover:translate-x-1 transition-transform" size={16} />
        </div>
      </div>
    </div>
  );
};

export default AdminCard;
export { getColorClasses };
