import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProposal, getCompanies, getLocations } from '../../lib/api';
import { ProposalLocationSelect } from './ProposalLocationSelect';

interface ProposalFormProps {
  onClose: () => void;
}

export function ProposalForm({ onClose }: ProposalFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    company_id: '',
    status: 'Draft' as const,
    locations: [] as string[]
  });

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: getCompanies
  });

  const { mutate, isPending, data: createdProposal } = useMutation({
    mutationFn: createProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      onClose();
    }
  });

  const { data: locations } = useQuery({
    queryKey: ['locations', { company_id: formData.company_id }],
    queryFn: () => getLocations({ company_id: formData.company_id }),
    enabled: !!formData.company_id
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(formData);
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

      {formData.company_id && locations && (
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
          {isPending ? 'Creating...' : 'Continue'}
        </button>
      </div>
    </form>
  );
}