import React from 'react';
import type { Location } from '../../types';

interface LocationPopupProps {
  location: Location;
}

export function LocationPopup({ location }: LocationPopupProps) {
  const criticalityColors = {
    High: 'text-red-600 bg-red-50',
    Medium: 'text-amber-600 bg-amber-50',
    Low: 'text-emerald-600 bg-emerald-50'
  }[location.criticality] || 'text-gray-600 bg-gray-50';

  return `
    <div class="p-4 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        ${location.name}
      </h3>
      
      <div class="space-y-2 text-sm">
        <p class="text-gray-600 dark:text-gray-400">
          ${location.address}<br />
          ${location.city}, ${location.state} ${location.zip_code}
        </p>
        
        <div class="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
          <span class="text-gray-600 dark:text-gray-400">Criticality:</span>
          <span class="px-2 py-1 rounded-full text-xs font-medium ${criticalityColors}">
            ${location.criticality}
          </span>
        </div>

        ${location.site_description ? `
          <div class="border-t border-gray-200 dark:border-gray-700 pt-2">
            <p class="text-gray-600 dark:text-gray-400">
              ${location.site_description}
            </p>
          </div>
        ` : ''}

        <div class="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
          <div>
            <span class="text-gray-500 dark:text-gray-400">Active Users:</span>
            <span class="ml-1 font-medium text-gray-900 dark:text-gray-100">
              ${location.active_users}
            </span>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400">Servers:</span>
            <span class="ml-1 font-medium text-gray-900 dark:text-gray-100">
              ${location.num_servers}
            </span>
          </div>
        </div>
      </div>
    </div>
  `;
}