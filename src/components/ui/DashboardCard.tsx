import React from 'react';
import type { DashboardCardProps } from '../../types';

export function DashboardCard({ title, value, icon, description }: DashboardCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        <div className="text-primary">{icon}</div>
      </div>
      <div className="flex flex-col">
        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
        {description && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
    </div>
  );
}