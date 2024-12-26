import React, { useState } from 'react';
import { Building2, Plus, Edit2, X, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table } from '../components/ui/Table';
import { GridView } from '../components/ui/GridView';
import { ViewToggle } from '../components/ui/ViewToggle';
import { SearchBar } from '../components/ui/SearchBar';
import { FilterDropdown } from '../components/ui/FilterDropdown';
import { Modal } from '../components/ui/Modal';
import { DeleteConfirmationDialog } from '../components/ui/DeleteConfirmationDialog';
import { CompanyForm } from '../components/companies/CompanyForm';
import { CompanyEditForm } from '../components/companies/CompanyEditForm';
import { CompanyCard } from '../components/companies/CompanyCard';
import { getCompanies, deleteCompany, getCompanyDependencies } from '../lib/api';
import type { Company } from '../types';

const getColumns = (onEdit: (company: Company) => void, onDelete: (company: Company) => void) => [
  { header: 'Name', accessorKey: 'name' },
  { header: 'City', accessorKey: 'address_city' },
  { header: 'State', accessorKey: 'address_state' },
  { header: 'Phone', accessorKey: 'phone' },
  { header: 'Email', accessorKey: 'email' },
  {
    header: '',
    accessorKey: 'id',
    cell: (_: string, row: Company) => (
      <div className="flex items-center space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(row);
          }}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Edit2 className="h-4 w-4 text-gray-400 hover:text-primary" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(row);
          }}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
        </button>
      </div>
    )
  }
];

export function Companies() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);
  const [dependencies, setDependencies] = useState<{ id: string; name: string; }[]>([]);

  const hasFilters = search || stateFilter || cityFilter;

  const clearFilters = () => {
    setSearch('');
    setStateFilter('');
    setCityFilter('');
  };

  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies', { search, state: stateFilter, city: cityFilter }],
    queryFn: () => getCompanies({ search, state: stateFilter, city: cityFilter })
  });

  const { mutate: deleteCompanyMutation } = useMutation({
    mutationFn: (id: string) => deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setDeletingCompany(null);
    }
  });

  const handleDeleteClick = async (company: Company) => {
    const deps = await getCompanyDependencies(company.id);
    setDependencies(deps);
    setDeletingCompany(company);
  };

  // Get unique states and cities for filters
  const states = React.useMemo(() => {
    if (!companies) return [];
    const uniqueStates = [...new Set(companies.map(c => c.address_state))];
    return uniqueStates.map(state => ({ value: state, label: state }));
  }, [companies]);

  const cities = React.useMemo(() => {
    if (!companies) return [];
    const uniqueCities = [...new Set(companies.map(c => c.address_city))];
    return uniqueCities.map(city => ({ value: city, label: city }));
  }, [companies]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Companies</h1>
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
          <div className="flex items-center space-x-4">
            <ViewToggle view={view} onViewChange={setView} />
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90
                       flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Company</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search companies..."
            />
          </div>
          <div className="flex space-x-4">
            <FilterDropdown
              value={stateFilter}
              onChange={setStateFilter}
              options={states}
              label="All States"
            />
            <FilterDropdown
              value={cityFilter}
              onChange={setCityFilter}
              options={cities}
              label="All Cities"
            />
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Company"
      >
        <CompanyForm onClose={() => setIsModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={!!editingCompany}
        onClose={() => setEditingCompany(null)}
        title="Edit Company"
      >
        {editingCompany && (
          <CompanyEditForm
            company={editingCompany}
            onClose={() => setEditingCompany(null)}
          />
        )}
      </Modal>

      <DeleteConfirmationDialog
        isOpen={!!deletingCompany}
        onClose={() => {
          setDeletingCompany(null);
          setDependencies([]);
        }}
        onConfirm={() => deletingCompany && deleteCompanyMutation(deletingCompany.id)}
        title={`Delete ${deletingCompany?.name}`}
        description={
          <div className="space-y-4">
            <p>Are you sure you want to delete {deletingCompany?.name}?</p>
            {dependencies.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium">The following locations will also be deleted:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                  {dependencies.map(location => (
                    <li key={location.id}>{location.name}</li>
                  ))}
                </ul>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  All circuits associated with these locations will also be deleted.
                </p>
              </div>
            )}
          </div>
        }
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          view === 'table' ? (
            <Table
              data={companies || []}
              columns={getColumns(setEditingCompany, handleDeleteClick)}
              onRowClick={setEditingCompany}
            />
          ) : (
            <GridView
              data={companies || []}
              renderCard={(company) => (
                <div
                  onClick={() => setEditingCompany(company)}
                  className="cursor-pointer"
                  key={company.id}
                >
                  <CompanyCard company={company} />
                </div>
              )}
            />
          )
        )}
      </div>
    </div>
  );
}