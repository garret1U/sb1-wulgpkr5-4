import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLocations, getCircuits } from '../../lib/api';
import { CircuitSelectionCard } from './CircuitSelectionCard';
import type { Location, Circuit } from '../../types';

interface CircuitSelectionProps {
  companyId: string;
  onSelect: (circuit: Circuit) => void;
  selectedCircuits: Circuit[];
}

export function CircuitSelection({ companyId, onSelect, selectedCircuits }: CircuitSelectionProps) {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showAllLocations, setShowAllLocations] = useState(false);

  const { data: locations } = useQuery({
    queryKey: ['locations', { company_id: companyId }],
    queryFn: () => getLocations({ company_id: companyId })
  });

  const { data: circuits } = useQuery({
    queryKey: ['circuits', { location_id: selectedLocation }],
    queryFn: () => getCircuits({ location_id: selectedLocation || undefined }),
    enabled: !showAllLocations && !!selectedLocation
  });

  const { data: allCircuits } = useQuery({
    queryKey: ['circuits', { locations: locations?.map(l => l.id) }],
    queryFn: async () => {
      if (!locations) return [];
      const allCircuits = await Promise.all(
        locations.map(location => getCircuits({ location_id: location.id }))
      );
      return allCircuits.flat();
    },
    enabled: showAllLocations && !!locations?.length
  });

  const displayedCircuits = showAllLocations ? allCircuits : circuits;

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setShowAllLocations(value === 'all');
    setSelectedLocation(value === 'all' ? null : value);
  };

  return (
    <div className="space-y-6">
      {/* Location Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Location
        </label>
        <select
          value={showAllLocations ? 'all' : (selectedLocation || '')}
          onChange={handleLocationChange}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100
                   focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Select a location</option>
          <option value="all">All Locations</option>
          {locations?.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </div>

      {/* Circuit Selection */}
      {(showAllLocations || selectedLocation) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Available Circuits
            </h3>
            {displayedCircuits && displayedCircuits.length > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {displayedCircuits.length} circuit{displayedCircuits.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4">
            {displayedCircuits?.map((circuit) => (
              <CircuitSelectionCard
                key={circuit.id}
                circuit={circuit}
                isSelected={selectedCircuits.some(c => c.id === circuit.id)}
                onSelect={() => onSelect(circuit)}
              />
            ))}
            {displayedCircuits?.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400">
                No circuits available for {showAllLocations ? 'any location' : 'this location'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}