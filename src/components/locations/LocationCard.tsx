import React from 'react';
import { MapPin, Building2, ChevronRight, Users, Server, Monitor } from 'lucide-react';
import type { Location } from '../../types';

interface LocationCardProps {
  location: Location;
}

export function LocationCard({ location }: LocationCardProps) {
  const criticalityColors = {
    High: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    Medium: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    Low: 'text-green-500 bg-green-50 dark:bg-green-900/20'
  }[location.criticality] || 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md 
                  transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary">
                {location.name}
              </h3>
              <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                <Building2 className="h-4 w-4 mr-1" />
                <span>{location.company?.name || 'No Company'}</span>
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary 
                                transition-transform group-hover:translate-x-1" />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Details */}
      <div className="p-6 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {location.city}, {location.state}
            </span>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${criticalityColors}`}>
            {location.criticality}
          </span>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          {location.address}
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          {location.zip_code}, {location.country}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Users className="h-4 w-4" />
          <span>{location.active_users || 0}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Monitor className="h-4 w-4" />
          <span>{location.num_devices || 0}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Server className="h-4 w-4" />
          <span>{location.num_servers || 0}</span>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 
                    transition-opacity pointer-events-none" />
    </div>
  );
}