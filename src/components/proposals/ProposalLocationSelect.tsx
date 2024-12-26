import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { getLocations } from '../../lib/api';
import type { Location } from '../../types';

interface ProposalLocationSelectProps {
  companyId: string;
  proposalId: string;
  onLocationsSelected: () => void;
}

export function ProposalLocationSelect({ companyId, proposalId, onLocationsSelected }: ProposalLocationSelectProps) {
  const queryClient = useQueryClient();
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const { data: locations, isLoading } = useQuery({
    queryKey: ['locations', { company_id: companyId }],
    queryFn: () => getLocations({ company_id: companyId })
  });

  const { mutate: addLocations, isPending } = useMutation({
    mutationFn: async () => {
      // Add API call here to save selected locations
      onLocationsSelected();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    }
  });

  const toggleLocation = (locationId: string) => {
    setSelectedLocations(prev => 
      prev.includes(locationId)
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  const toggleAll = () => {
    if (!locations) return;
    
    setSelectedLocations(prev => 
      prev.length === locations.length
        ? []
        : locations.map(l => l.id)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLocations.length > 0) {
      addLocations();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Select Locations
        </h3>
        <button
          type="button"
          onClick={toggleAll}
          className="text-sm text-primary hover:text-primary/90"
        >
          {selectedLocations.length === locations?.length
            ? 'Deselect All'
            : 'Select All'}
        </button>
      </div>

      <div className="space-y-3">
        {locations?.map((location) => (
          <div
            key={location.id}
            onClick={() => toggleLocation(location.id)}
            className={`
              relative p-4 rounded-lg border cursor-pointer transition-all
              ${selectedLocations.includes(location.id)
                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary'}
            `}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {location.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {location.address}, {location.city}, {location.state}
                </p>
              </div>

              {selectedLocations.includes(location.id) && (
                <div className="rounded-full bg-primary p-1">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="submit"
          disabled={isPending || selectedLocations.length === 0}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md 
                   hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </form>
  );
}