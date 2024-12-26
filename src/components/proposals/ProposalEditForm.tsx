import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { updateProposal, getCompanies, getProposal, getLocations } from '../../lib/api';
import { ProposalCircuits } from './ProposalCircuits';
import type { Proposal } from '../../types';

interface ProposalEditFormProps {
  proposal: Proposal;
  onClose: () => void;
}

export function ProposalEditForm({ proposal, onClose }: ProposalEditFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: proposal.name,
    company_id: proposal.company_id,
    status: proposal.status,
    valid_until: proposal.valid_until || undefined,
    notes: proposal.notes || '',
    locations: proposal.locations?.map(l => l.id || l.location?.id).filter(Boolean) || []
  });

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: getCompanies
  });

  const { data: locations } = useQuery({
    queryKey: ['locations', { company_id: formData.company_id }],
    queryFn: () => getLocations({ company_id: formData.company_id }),
    enabled: !!formData.company_id
  });

  const { data: fullProposal } = useQuery({
    queryKey: ['proposals', proposal.id],
    queryFn: () => getProposal(proposal.id)
  });

  const { mutate, isPending } = useMutation({
    mutationFn: () => updateProposal(proposal.id, formData),
    onSuccess: () => {
      const selectedLocations = locations?.filter(l => formData.locations.includes(l.id)) || [];

      // Immediately update all related queries
      queryClient.setQueriesData(
        { queryKey: ['proposals'] },
        (oldData: any) => {
          // Handle proposals list
          if (Array.isArray(oldData)) {
            return oldData.map(p => 
              p.id === proposal.id 
                ? {
                    ...p,
                    ...formData,
                    locations: selectedLocations
                  }
                : p
            );
          }

          // Handle single proposal query
          if (oldData?.id === proposal.id) {
            return {
              ...oldData,
              ...formData,
              locations: selectedLocations
            };
          }

          return oldData;
        }
      );

      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: ['proposals'],
        refetchType: 'none' 
      });

      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Company *
        </label>
        <select
          name="company_id"
          required
          value={formData.company_id}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100
                   focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Select a company</option>
          {companies?.map(company => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Proposal Name *
        </label>
        <input
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100
                   focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Status *
        </label>
        <select
          name="status"
          required
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100
                   focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="Draft">Draft</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Valid Until
        </label>
        <input
          type="date"
          name="valid_until"
          value={formData.valid_until}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100
                   focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100
                   focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {locations && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Locations * 
            <button
              type="button"
              onClick={() => {
                const allLocationIds = locations.map(l => l.id);
                setFormData(prev => ({
                  ...prev,
                  locations: formData.locations.length === allLocationIds.length ? [] : allLocationIds
                }));
              }}
              className="ml-2 text-sm text-primary hover:text-primary/90"
            >
              {formData.locations.length === locations.length ? 'Deselect All' : 'Select All'}
            </button>
          </label>
          <div className="mt-2 space-y-2">
            {locations.map(location => (
              <label key={location.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.locations.includes(location.id)}
                  onChange={(e) => {
                    const newLocations = e.target.checked
                      ? [...formData.locations, location.id]
                      : formData.locations.filter(id => id !== location.id);
                    setFormData(prev => ({ ...prev, locations: newLocations }));
                  }}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {location.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                   hover:text-gray-900 dark:hover:text-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md 
                   hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}