import React, { useState } from 'react';
import { Activity, CircleDollarSign, Network, AlertCircle, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { LocationMap } from '../components/maps/LocationMap';
import { DashboardCard } from '../components/ui/DashboardCard';
import { FilterDropdown } from '../components/ui/FilterDropdown';
import { getDashboardStats, getCompanies, getLocations, getEnvironmentVariable } from '../lib/api';

export function Dashboard() {
  const [companyFilter, setCompanyFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>();

  const hasFilters = companyFilter || locationFilter;

  const clearFilters = () => {
    setCompanyFilter('');
    setLocationFilter('');
  };

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats', { company_id: companyFilter, location_id: locationFilter }],
    queryFn: () => getDashboardStats({ 
      company_id: companyFilter, 
      location_id: locationFilter 
    })
  });

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: getCompanies
  });

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: getLocations
  });

  const { data: azureMapsKey } = useQuery({
    queryKey: ['azureMapsKey'],
    queryFn: () => getEnvironmentVariable('AZURE_MAPS_KEY')
  });

  const companyOptions = React.useMemo(() => {
    return (companies || []).map(company => ({
      value: company.id,
      label: company.name
    }));
  }, [companies]);

  const locationOptions = React.useMemo(() => {
    return (locations || [])
      .filter(location => !companyFilter || location.company_id === companyFilter)
      .map(location => ({
        value: location.id,
        label: `${location.name} (${location.company?.name})`
      }));
  }, [locations, companyFilter]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-4 flex items-center space-x-1 px-2 py-1 text-sm text-gray-500 
                       hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 
                       bg-gray-100 dark:bg-gray-700 rounded-md"
            >
              <X className="h-4 w-4" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
        <div className="flex space-x-4">
          <FilterDropdown
            value={companyFilter}
            onChange={(value) => {
              setCompanyFilter(value);
              setLocationFilter('');
            }}
            options={companyOptions}
            label="All Companies"
          />
          <FilterDropdown
            value={locationFilter}
            onChange={setLocationFilter}
            options={locationOptions}
            label="All Locations"
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Circuits"
          value={stats?.totalCircuits || 0}
          icon={<Network className="h-6 w-6" />}
        />
        <DashboardCard
          title="Active Circuits"
          value={stats?.activeCircuits || 0}
          icon={<Activity className="h-6 w-6" />}
        />
        <DashboardCard
          title="Inactive Circuits"
          value={stats?.inactiveCircuits || 0}
          icon={<AlertCircle className="h-6 w-6" />}
        />
        <DashboardCard
          title="Monthly Cost"
          value={`$${(stats?.totalMonthlyCost || 0).toLocaleString()}`}
          icon={<CircleDollarSign className="h-6 w-6" />}
        />
      </div>)}
      
      {/* Location Map */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Location Overview
        </h2>
        {locations && (
          <LocationMap
            locations={locations.filter(l => 
              (!companyFilter || l.company_id === companyFilter) &&
              (!locationFilter || l.id === locationFilter)
            )}
            selectedLocationId={selectedLocation}
            onLocationSelect={setSelectedLocation}
          />
        )}
      </div>
    </div>
  );
}