import React from 'react';
import { getColorClasses } from './AdminCard';

// Activity Feed Component
const ActivityFeedItem = ({ activity, index }) => {
  const colors = getColorClasses(activity.color);
  const IconComponent = activity.icon;
  
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
      <div className={`p-2 ${colors.bg} rounded-lg`}>
        <IconComponent className={colors.icon} size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-white">{activity.title}</p>
        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{activity.description}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activity.time}</p>
      </div>
    </div>
  );
};

export default ActivityFeedItem;