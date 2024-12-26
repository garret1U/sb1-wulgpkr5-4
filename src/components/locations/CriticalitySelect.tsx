import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateLocation } from '../../lib/api';
import type { Location } from '../../types';

interface CriticalitySelectProps {
  location: Location;
}

const criticalityOptions = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' }
];

export function CriticalitySelect({ location }: CriticalitySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: (criticality: string) => updateLocation(location.id, { ...location, criticality }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      setIsOpen(false);
    }
  });

  const colors = {
    High: 'text-red-500',
    Medium: 'text-yellow-500',
    Low: 'text-green-500'
  }[location.criticality] || 'text-gray-500';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${colors} hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary rounded`}
      >
        {location.criticality}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-2 w-32 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5">
            <div className="py-1" role="menu">
              {criticalityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => mutate(option.value)}
                  className={`
                    ${location.criticality === option.value ? 'bg-gray-100 dark:bg-gray-600' : ''}
                    block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200
                    hover:bg-gray-100 dark:hover:bg-gray-600
                  `}
                  role="menuitem"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}