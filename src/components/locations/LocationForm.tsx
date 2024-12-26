import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createLocation, getCompanies } from '../../lib/api';
import { geocodeAddress } from '../../lib/maps';
import { AddressForm } from '../address/AddressForm';

interface LocationFormProps {
  onClose: () => void;
}

interface LocationFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  criticality: string;
  site_description: string;
  critical_processes: string;
  active_users: number;
  company_id: string;
}

export function LocationForm({ onClose }: LocationFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    criticality: 'Low',
    site_description: '',
    critical_processes: '',
    active_users: 0,
    num_servers: 0,
    hosted_applications: '',
    company_id: ''
  });

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: getCompanies
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Geocode the address before creating the location
    const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip_code}`;
    geocodeAddress(fullAddress).then(coords => {
      mutate({
        ...formData,
        longitude: coords?.longitude,
        latitude: coords?.latitude
      });
    });
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
          Location Name *
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
        <AddressForm
          value={{
            street: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zip_code,
            country: formData.country
          }}
          onChange={(address) => {
            setFormData(prev => ({
              ...prev,
              address: address.street,
              city: address.city,
              state: address.state,
              zip_code: address.zip_code,
              country: address.country
            }));
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Criticality *
        </label>
        <select
          name="criticality"
          required
          value={formData.criticality}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100
                   focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Site Description
        </label>
        <textarea
          name="site_description"
          value={formData.site_description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100
                   focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Describe the site and its purpose..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Critical On-site Business Processes
        </label>
        <textarea
          name="critical_processes"
          value={formData.critical_processes}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100
                   focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="List critical business processes that occur at this location..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Critical Hosted Business Applications
        </label>
        <textarea
          name="hosted_applications"
          value={formData.hosted_applications}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100
                   focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="List critical business applications hosted at this location..."
        />
      </div>

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
          {isPending ? 'Creating...' : 'Create Location'}
        </button>
      </div>
    </form>
  );
}