import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import { getColorClasses } from './AdminCard';

// Quick Stats Component
const QuickStatsCard = ({ title, value, icon: Icon, color, subtitle, trend = null }) => {
  const colors = getColorClasses(color);
  
  return (
    <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">{title}</p>
          <p className={`text-3xl font-bold ${colors.text} mb-1`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <FiTrendingUp className={trend.direction === 'down' ? 'rotate-180' : ''} size={12} />
              <span>{trend.value}% vs last week</span>
            </div>
          )}
        </div>
        <div className={`p-3 ${colors.bg} rounded-xl`}>
          <Icon className={colors.icon} size={24} />
        </div>
      </div>
    </div>
  );
};

export default QuickStatsCard;