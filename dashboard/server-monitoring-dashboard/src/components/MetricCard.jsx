// src/components/MetricCard.jsx
import React from 'react';

const MetricCard = ({ title, value, subtitle, color = 'blue', icon }) => {
  const colorClasses = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    red: 'border-red-500',
    purple: 'border-purple-500'
  };

  const textColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    purple: 'text-purple-600'
  };

  return (
    <div className={`bg-white rounded-lg p-6 border-l-4 ${colorClasses[color]} shadow-sm`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-2">
            {title}
          </p>
          <p className={`text-4xl font-bold ${textColorClasses[color]} mb-1`}>
            {value}
          </p>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
    </div>
  );
};

export default MetricCard;