import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { updateLocation, getCompanies } from '../../lib/api';
import { geocodeAddress } from '../../lib/maps';
import { AddressForm } from '../address/AddressForm';
import { DeleteConfirmationDialog } from '../ui/DeleteConfirmationDialog';
import type { Location } from '../../types';

interface LocationEditFormProps {
  location: Location;
  onClose: () => void;
}

export function LocationEditForm({ location, onClose }: LocationEditFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: location.name,
    address: location.address,
    city: location.city,
    state: location.state,
    zip_code: location.zip_code,
    country: location.country,
    criticality: location.criticality,
    site_description: location.site_description || '',
    critical_processes: location.critical_processes || '',
    active_users: location.active_users || 0,
    num_servers: location.num_servers || 0,
    num_devices: location.num_devices || 0,
    hosted_applications: location.hosted_applications || '',
    company_id: location.company_id
  });
  const [showWarning, setShowWarning] = useState(false);
  const [affectedProposals, setAffectedProposals] = useState<any[]>([]);
  const [pendingCompanyId, setPendingCompanyId] = useState<string | null>(null);

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: getCompanies
  });

  // Check for affected proposals when company changes
  const handleCompanyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCompanyId = e.target.value;
    
    setPendingCompanyId(newCompanyId);

    try {
      // If changing back to original company, just update form
      if (newCompanyId === location.company_id) {
        setFormData(prev => ({ ...prev, company_id: newCompanyId }));
        setPendingCompanyId(null);
        return;
      }

      // Get proposal IDs that contain this location
      const { data: proposalLocations } = await supabase
        .from('proposal_locations')
        .select('proposal_id')
        .eq('location_id', location.id);

      if (!proposalLocations?.length) {
        handleChange(e);
        return;
      }

      // Get proposal details
      const { data: proposals } = await supabase
        .from('proposals')
        .select(`
          id, name, company:companies(name)
        `)
        .eq('company_id', location.company_id)
        .in('id', proposalLocations.map(pl => pl.proposal_id));

      if (proposals?.length) {
        setAffectedProposals(proposals);
        // Show warning and don't update form data yet
        setShowWarning(true);
      } else {
        // No affected proposals, safe to update
        setFormData(prev => ({ ...prev, company_id: newCompanyId }));
      }
    } catch (error) {
      console.error('Error checking affected proposals:', error);
      // On error, revert to original company
      setFormData(prev => ({ ...prev, company_id: location.company_id }));
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip_code}`;
      const coords = await geocodeAddress(fullAddress);
      
      const result = await updateLocation(location.id, {
        ...formData,
        longitude: coords?.longitude,
        latitude: coords?.latitude
      });
      return result;
    },
    onSuccess: (data) => {
      // Show warning if proposals were affected
      if (data && 'affectedProposals' in data) {
        const proposals = data.affectedProposals
          .map((p: any) => `${p.name} (${p.company.name})`)
          .join('\n- ');
        
        alert(
          `This location has been removed from the following proposals due to the company change:\n\n- ${proposals}`
        );
      }

      queryClient.invalidateQueries({ queryKey: ['locations'] });
      onClose();
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate();
    setPendingCompanyId(null);
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Company *
        </label>
        <select
          name="company_id"
          required
          value={formData.company_id}
          onChange={(e) => handleCompanyChange(e)}
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Number of Servers
          </label>
          <input
            type="number"
            name="num_servers"
            min="0"
            value={formData.num_servers}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100
                     focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Active Users
          </label>
          <input
            type="number"
            name="active_users"
            min="0"
            value={formData.active_users}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100
                     focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Number of Devices
          </label>
          <input
            type="number"
            name="num_devices"
            min="0"
            value={formData.num_devices}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100
                     focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
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

    <DeleteConfirmationDialog
      isOpen={showWarning}
      onClose={() => {
        setShowWarning(false);
        setPendingCompanyId(null);
        // Reset company_id to original value
        setFormData(prev => ({
          ...prev,
          company_id: location.company_id
        }));
      }}
      onConfirm={() => {
        if (pendingCompanyId) {
          setFormData(prev => ({
            ...prev,
            company_id: pendingCompanyId
          }));
        }
        setShowWarning(false);
      }}
      title="Warning: Company Change"
      description={
        <div className="space-y-4">
          <p>Changing the company will remove this location from:</p>
          <ul className="list-disc list-inside">
            {affectedProposals.map(p => (
              <li key={p.id}>{p.name} ({p.company.name})</li>
            ))}
          </ul>
        </div>
      }
      confirmText="CONFIRM"
      confirmButtonText="Change Company"
    />
    </>
  );
}